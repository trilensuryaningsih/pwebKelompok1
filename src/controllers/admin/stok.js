const { item } = require('../../models');

exports.stok = (req, res) => {
    return res.render('admin/stok', {
        path: '/admin/stok'
    });
}


exports.showAllitemsPage = async (req, res) => {
    try {
        const items = await item.findAll();
        res.render('admin/items/stock', { 
            items,
            path: '/admin/items/stock'
        });
    } catch (err) {
        res.status(500).send('Gagal memuat data item.');
    }
};
