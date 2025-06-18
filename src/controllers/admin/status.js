
const { item } = require('../../models');

exports.status = (req, res) => {
    return res.render('admin/status');
}


exports.showAllitemsPage = async (req, res) => {
  try {
    const items = await item.findAll();
    res.render('admin/status', { items }); // pakai view engine (misal ejs)
  } catch (error) {
    res.status(500).send('Gagal menampilkan data');
  }
};




