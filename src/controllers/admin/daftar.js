const { item } = require('../../models');

exports.daftar = (req, res) => {
    return res.render('admin/daftar');
}


exports.showAllitemsPage = async (req, res) => {
  try {
    const items = await item.findAll();
    res.render('admin/daftar', { items }); // pakai view engine (misal ejs)
  } catch (error) {
    res.status(500).send('Gagal menampilkan data');
  }
};




