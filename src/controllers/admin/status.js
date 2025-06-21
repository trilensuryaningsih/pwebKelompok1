const { item, Fine, Order, User, Item, Service } = require('../../models');

exports.status = (req, res) => {
    return res.render('admin/status');
}

exports.showAllitemsPage = async (req, res) => {
  try {
    // Fetch items
    const items = await item.findAll();
    
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
        'waived': 'bg-blue-100 text-blue-800'
      };
      return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
      const statusTexts = {
        'pending': 'Menunggu',
        'paid': 'Dibayar',
        'waived': 'Dibebaskan'
      };
      return statusTexts[status] || status;
    };

    res.render('admin/status', { 
      items,
      fines: finesWithDetails,
      formatDate,
      formatNumber,
      getStatusClass,
      getStatusText
    });
  } catch (error) {
    console.error('Error loading status page:', error);
    res.status(500).send('Gagal menampilkan data');
  }
};

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

exports.getFineHistory = async (req, res) => {
  try {
    const { Fine, Order, User } = require('../../models');
    const fines = await Fine.findAll({
      include: [
        { model: Order, attributes: ['id', 'user_id', 'itemType', 'itemId', 'totalAmount'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ success: true, data: fines });
  } catch (error) {
    console.error('Error get fine history:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat denda' });
  }
};

// Render fine history page with server-side data
exports.renderFineHistoryPage = async (req, res) => {
  try {
    const { Fine, Order, User, Item, Service } = require('../../models');
    
    // Get all fines with order details
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
          const item = await Item.findByPk(fine.Order.itemId);
          fineData.itemDetails = item ? {
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image
          } : null;
        } else if (fine.Order && fine.Order.itemType === 'service') {
          const service = await Service.findByPk(fine.Order.itemId);
          fineData.itemDetails = service ? {
            name: service.name,
            description: service.description,
            price: service.price,
            image: service.image
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
      totalFines: fines.length,
      pendingFines: fines.filter(f => f.status === 'pending').length,
      paidFines: fines.filter(f => f.status === 'paid').length,
      waivedFines: fines.filter(f => f.status === 'waived').length,
      totalAmount: fines.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0),
      pendingAmount: fines.filter(f => f.status === 'pending').reduce((sum, f) => sum + parseFloat(f.amount || 0), 0)
    };

    // Helper functions
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
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
        'waived': 'bg-blue-100 text-blue-800'
      };
      return statusClasses[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
      const statusTexts = {
        'pending': 'Menunggu',
        'paid': 'Dibayar',
        'waived': 'Dibebaskan'
      };
      return statusTexts[status] || status;
    };

    res.render('admin/riwayat-denda', { 
      user: req.session.user,
      fines: finesWithDetails,
      stats,
      formatDate,
      formatNumber,
      getStatusClass,
      getStatusText
    });

  } catch (error) {
    console.error('Error rendering fine history page:', error);
    res.render('admin/riwayat-denda', { 
      user: req.session.user,
      fines: [],
      stats: {
        totalFines: 0,
        pendingFines: 0,
        paidFines: 0,
        waivedFines: 0,
        totalAmount: 0,
        pendingAmount: 0
      },
      error: 'Gagal memuat riwayat denda',
      formatDate: () => '-',
      formatNumber: () => 'Rp 0',
      getStatusClass: () => 'bg-gray-100 text-gray-800',
      getStatusText: (status) => status
    });
  }
};




