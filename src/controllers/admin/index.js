const { Item, Service, Order } = require('../../models');

exports.index = (req, res) => {
    res.render('admin/dashboard/index', {
        path: '/admin/dashboard' // Variabel 'path' yang dibutuhkan sidebar
    });
};