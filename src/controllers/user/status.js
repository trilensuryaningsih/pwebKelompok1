const { Order } = require('../../models');

exports.getUserOrdersStatus = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']]
        });
        res.render('user/status', { user: req.session.user, orders, currentPage: 'status' });
    } catch (e) {
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
        // Di sini bisa ditambah logic insert ke tabel Exchange jika ada
        order.status = 'exchange_requested';
        await order.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Gagal mengajukan penukaran' });
    }
};
