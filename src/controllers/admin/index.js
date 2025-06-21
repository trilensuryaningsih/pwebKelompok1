const { Item, Service, Order } = require('../../models');

exports.index = async (req, res) => {
    try {
        const totalItems = await Item.count();
        const totalServices = await Service.count();
        const totalOrders = await Order.count({ where: { status: 'approved' } });

        res.render('admin/dashboard/index', {
            totalItems,
            totalServices,
            totalOrders,
            user: req.session.user,
            path: '/admin/dashboard'
        });
    } catch (error) {
        console.error("Error di Admin Dashboard:", error);
        res.status(500).send('Terjadi kesalahan pada server: ' + error.message);
    }
};