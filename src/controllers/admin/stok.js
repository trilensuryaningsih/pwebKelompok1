const { item } = require('../../models');

exports.stok = (req, res) => {
    return res.render('admin/stok');
}


exports.showAllitemsPage = async (req, res) => {
    try {
        const items = await item.findAll();
        res.render('admin/items/stock', { items });
    } catch (err) {
        res.status(500).send('Gagal memuat data item.');
    }
};
