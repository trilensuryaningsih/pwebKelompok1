const { item } = require('../../models');

exports.status = (req, res) => {
    return res.render('admin/status');
}


exports.showAllitemsPage = async (req, res) => {
    try {
        const items = await item.findAll();
        res.render('admin/items/status', { items });
    } catch (err) {
        res.status(500).send('Gagal memuat data item.');
    }
};




