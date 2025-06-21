const { User, Item, Service, Order } = require('../../models');

exports.createOrder = async (req, res) => {
    try {
        const { email } = req.session.user;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ success: false, message: 'User not found' });

        const { pesanan, startDate, endDate, notes } = req.body;
        if (!pesanan || !Array.isArray(pesanan) || pesanan.length === 0) {
            return res.status(400).json({ success: false, message: 'Pesanan kosong' });
        }
        const createdOrders = [];
        for (const p of pesanan) {
            let itemType = p.type === 'tool' ? 'item' : 'service';
            let itemId = p.id;
            let quantity = p.quantity;
            let totalAmount = quantity;
            let mouFile = `/user/download-mou-pdf`;
            // Validasi item/service
            if (itemType === 'item') {
                const item = await Item.findByPk(itemId);
                if (!item) continue;
            } else {
                const service = await Service.findByPk(itemId);
                if (!service) continue;
            }
            const order = await Order.create({
                user_id: user.id,
                itemType,
                itemId,
                quantity,
                startDate,
                endDate,
                status: 'pending',
                mouFile,
                notes: notes || null,
                totalAmount
            });
            createdOrders.push(order);
        }
        res.status(201).json({ success: true, data: createdOrders });
    } catch (e) {
        console.error('Order error:', e);
        res.status(500).json({ success: false, message: 'Gagal simpan pesanan', error: e.message });
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