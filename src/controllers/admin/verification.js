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
    console.log(`Rejecting order ${orderId}`);
    
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      console.log(`Order ${orderId} not found`);
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    
    console.log(`Found order:`, {
      id: order.id,
      itemType: order.itemType,
      itemId: order.itemId,
      quantity: order.quantity,
      status: order.status
    });
    
    if (order.status !== 'pending') {
      console.log(`Order ${orderId} cannot be rejected - status: ${order.status}`);
      return res.status(400).json({ success: false, message: 'Pesanan tidak bisa ditolak' });
    }

    // Start transaction to ensure data consistency
    const transaction = await Order.sequelize.transaction();
    
    try {
      console.log(`Starting transaction for order ${orderId}`);
      
      // Restore quantity to item/service before rejecting
      if (order.itemType === 'item') {
        console.log(`Processing item with ID: ${order.itemId}`);
        const item = await Item.findByPk(order.itemId, { transaction });
        if (item) {
          const oldQuantity = item.quantity;
          const newQuantity = oldQuantity + order.quantity;
          console.log(`Item ${item.name}: ${oldQuantity} + ${order.quantity} = ${newQuantity}`);
          
          await item.update({ 
            quantity: newQuantity,
            status: newQuantity > 0 ? 'available' : 'unavailable'
          }, { transaction });
          
          console.log(`Item ${item.name} quantity updated successfully`);
        } else {
          console.log(`Item with ID ${order.itemId} not found`);
        }
      } else if (order.itemType === 'service') {
        console.log(`Processing service with ID: ${order.itemId}`);
        const service = await Service.findByPk(order.itemId, { transaction });
        if (service) {
          const oldQuantity = service.quantity;
          const newQuantity = oldQuantity + order.quantity;
          console.log(`Service ${service.name}: ${oldQuantity} + ${order.quantity} = ${newQuantity}`);
          
          await service.update({ 
            quantity: newQuantity,
            status: newQuantity > 0 ? 'available' : 'unavailable'
          }, { transaction });
          
          console.log(`Service ${service.name} quantity updated successfully`);
        } else {
          console.log(`Service with ID ${order.itemId} not found`);
        }
      } else {
        console.log(`Unknown itemType: ${order.itemType}`);
      }

      // Update order status to rejected
      await order.update({ status: 'rejected' }, { transaction });
      console.log(`Order ${orderId} status updated to rejected`);
      
      // Commit transaction
      await transaction.commit();
      console.log(`Transaction committed successfully for order ${orderId}`);
      
      console.log(`Order ${orderId} rejected successfully`);
      res.json({ success: true, message: 'Pesanan berhasil ditolak dan stok telah dikembalikan' });
      
    } catch (error) {
      // Rollback transaction on error
      console.error(`Error in transaction for order ${orderId}:`, error);
      await transaction.rollback();
      throw error;
    }
    
  } catch (err) {
    console.error('Error rejecting order:', err);
    res.status(500).json({ success: false, message: 'Gagal menolak pesanan: ' + err.message });
  }
}; 