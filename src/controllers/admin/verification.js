const { Item, Order, Service } = require('../../models');

// Show pending orders page for verification
exports.showPendingOrdersPage = async (req, res) => {
  try {
    // Ambil semua order dengan status pending
    const orders = await Order.findAll({
      where: { status: 'pending' },
      include: [
        { model: Item, attributes: ['name'], required: false },
        { model: Service, attributes: ['name'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Map agar field name universal (barang/jasa)
    const items = orders.map(order => ({
      id: order.id,
      name: order.itemType === 'item' && order.Item ? order.Item.name : (order.itemType === 'service' && order.Service ? order.Service.name : '-'),
      startDate: order.startDate,
      endDate: order.endDate
    }));
    
    res.render('admin/items/verification', { items });
  } catch (err) {
    console.error('Error loading pending orders:', err);
    res.status(500).send('Gagal memuat pesanan pending.');
  }
};

// Approve order
exports.approveOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Pesanan tidak bisa diverifikasi' });
    }

    // Update order status to approved
    order.status = 'approved';
    await order.save();
    
    console.log(`Order ${orderId} approved successfully`);
    res.json({ success: true, message: 'Pesanan berhasil diverifikasi' });
  } catch (err) {
    console.error('Error approving order:', err);
    res.status(500).json({ success: false, message: 'Gagal memverifikasi pesanan: ' + err.message });
  }
};

// Reject order and restore quantity
exports.rejectOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Pesanan tidak bisa ditolak' });
    }

    // Restore quantity to item/service before rejecting
    if (order.itemType === 'item') {
      const item = await Item.findByPk(order.itemId);
      if (item) {
        // Increase quantity back
        const newQuantity = item.quantity + order.quantity;
        await item.update({ quantity: newQuantity });
        console.log(`Restored ${order.quantity} quantity to item ${item.name}. New quantity: ${newQuantity}`);
      }
    } else if (order.itemType === 'service') {
      const service = await Service.findByPk(order.itemId);
      if (service) {
        // Increase quantity back
        const newQuantity = service.quantity + order.quantity;
        await service.update({ quantity: newQuantity });
        console.log(`Restored ${order.quantity} quantity to service ${service.name}. New quantity: ${newQuantity}`);
      }
    }

    // Update order status to rejected
    order.status = 'rejected';
    await order.save();
    
    console.log(`Order ${orderId} rejected successfully`);
    res.json({ success: true, message: 'Pesanan berhasil ditolak dan stok telah dikembalikan' });
  } catch (err) {
    console.error('Error rejecting order:', err);
    res.status(500).json({ success: false, message: 'Gagal menolak pesanan: ' + err.message });
  }
}; 