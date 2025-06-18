
const { item } = require('../../models');

exports.stok = (req, res) => {
    return res.render('admin/stok');
}


exports.showAllitemsPage = async (req, res) => {
  try {
    const items = await item.findAll();
    res.render('admin/stok', { items }); // pakai view engine (misal ejs)
  } catch (error) {
    res.status(500).send('Gagal menampilkan data');
  }
};
