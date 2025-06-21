const { Order } = require('../../models');

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