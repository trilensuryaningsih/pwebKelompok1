const { Order, Fine, User, Item, Service } = require('../../models');

// Render pesanan page with orders and fines
exports.showPesananPage = async (req, res) => {
  try {
    // Fetch orders with user details
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Fetch fines with order and user details
    const fines = await Fine.findAll({
      include: [
        { 
          model: Order, 
          attributes: ['id', 'user_id', 'itemType', 'itemId', 'totalAmount', 'status', 'createdAt'],
          include: [
            { model: User, attributes: ['id', 'name', 'email'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get item/service details for each fine
    const finesWithDetails = await Promise.all(fines.map(async (fine) => {
      const fineData = fine.toJSON();
      
      try {
        if (fine.Order && fine.Order.itemType === 'item') {
          const itemDetail = await Item.findByPk(fine.Order.itemId);
          fineData.itemDetails = itemDetail ? {
            name: itemDetail.name,
            description: itemDetail.description,
            price: itemDetail.price,
            image: itemDetail.image
          } : null;
        } else if (fine.Order && fine.Order.itemType === 'service') {
          const serviceDetail = await Service.findByPk(fine.Order.itemId);
          fineData.itemDetails = serviceDetail ? {
            name: serviceDetail.name,
            description: serviceDetail.description,
            price: serviceDetail.price,
            image: serviceDetail.image
          } : null;
        }
      } catch (error) {
        console.error(`Error fetching ${fine.Order?.itemType} details for fine ${fine.id}:`, error);
        fineData.itemDetails = null;
      }
      
      return fineData;
    }));

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      activeOrders: orders.filter(o => o.status === 'active').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalFines: fines.length,
      pendingFines: fines.filter(f => f.status === 'pending').length,
      paidFines: fines.filter(f => f.status === 'paid').length,
      waivedFines: fines.filter(f => f.status === 'waived').length,
      totalFineAmount: fines.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0),
      pendingFineAmount: fines.filter(f => f.status === 'pending').reduce((sum, f) => sum + parseFloat(f.amount || 0), 0)
    };

    // Helper functions
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatNumber = (number) => {
      if (!number) return 'Rp 0';
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(number);
    };

    const getStatusClass = (status) => {
      const statusClasses = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'paid': 'bg-green-100 text-green-800',
        'waived': 'bg-blue-100 text-blue-800',
        'active': 'bg-green-100 text-green-800',
        'completed': 'bg-gray-100 text-gray-800',
        'cancelled': 'bg-red-100 text-red-800',
        'approved': 'bg-blue-100 text-blue-800',
        'rejected': 'bg-red-100 text-red-800'
      };
      return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
      const statusTexts = {
        'pending': 'Menunggu',
        'paid': 'Dibayar',
        'waived': 'Dibebaskan',
        'active': 'Aktif',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan',
        'approved': 'Disetujui',
        'rejected': 'Ditolak'
      };
      return statusTexts[status] || status;
    };

    res.render('admin/pesanan', { 
      user: req.session.user || { name: 'Admin' },
      orders,
      fines: finesWithDetails,
      stats,
      formatDate,
      formatNumber,
      getStatusClass,
      getStatusText
    });

  } catch (error) {
    console.error('Error loading pesanan page:', error);
    
    // Fallback with default values if database error
    res.render('admin/pesanan', {
      user: req.session.user || { name: 'Admin' },
      orders: [],
      fines: [],
      stats: {
        totalOrders: 0,
        pendingOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalFines: 0,
        pendingFines: 0,
        paidFines: 0,
        waivedFines: 0,
        totalFineAmount: 0,
        pendingFineAmount: 0
      },
      formatDate: () => '-',
      formatNumber: () => 'Rp 0',
      getStatusClass: () => 'bg-gray-100 text-gray-800',
      getStatusText: (status) => status,
      error: 'Gagal memuat data pesanan'
    });
  }
};

// Update fine status
exports.updateFineStatus = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'waived'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }
    
    const fine = await Fine.findByPk(fineId);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Denda tidak ditemukan' });
    }
    
    await fine.update({ status });
    return res.json({ success: true, message: 'Status denda berhasil diperbarui', data: fine });
  } catch (error) {
    console.error('Error update fine status:', error);
    return res.status(500).json({ success: false, message: 'Gagal update status denda' });
  }
};

// Get fine history (API endpoint)
exports.getFineHistory = async (req, res) => {
  try {
    const fines = await Fine.findAll({
      include: [
        { 
          model: Order, 
          attributes: ['id', 'user_id', 'itemType', 'itemId', 'totalAmount'],
          include: [
            { model: User, attributes: ['id', 'name', 'email'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ success: true, data: fines });
  } catch (error) {
    console.error('Error get fine history:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat denda' });
  }
}; 