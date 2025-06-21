const { Order, Item, Service } = require('../../models');

exports.getUserOrdersStatus = async (req, res) => {
    try {
        const userId = req.session.user.id;
        console.log('Fetching orders for user ID:', userId);
        
        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Item,
                    as: 'Item',
                    attributes: ['name', 'description']
                },
                {
                    model: Service,
                    as: 'Service',
                    attributes: ['name', 'description']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        console.log('Found orders:', orders.length);
        
        res.render('user/status', { 
            user: req.session.user, 
            orders, 
            currentPage: 'status' 
        });
    } catch (e) {
        console.error('Error in getUserOrdersStatus:', e);
        res.status(500).send('Gagal memuat status pesanan');
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;
        const order = await Order.findOne({ where: { id: orderId, user_id: userId } });
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        if (!['pending', 'approved'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Pesanan tidak bisa dibatalkan' });
        }
        order.status = 'cancelled';
        await order.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Gagal membatalkan pesanan' });
    }
};

exports.requestExchange = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;
        const order = await Order.findOne({ where: { id: orderId, user_id: userId } });
        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        if (!['active', 'completed'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Penukaran hanya bisa diajukan jika alat sudah diambil' });
        }
        // Update status to completed for exchange request
        order.status = 'completed';
        await order.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Gagal mengajukan penukaran' });
    }
};
