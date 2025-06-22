const { item } = require('../../models');

exports.daftar = (req, res) => {
    return res.render('admin/daftar', {
        path: '/admin/daftar' // Variabel 'path' yang dibutuhkan sidebar
    });
}


exports.showAllitemsPage = async (req, res) => {
  try {
    const items = await item.findAll();
    res.render('admin/daftar', { 
      items,
      path: '/admin/daftar' // Variabel 'path' yang dibutuhkan sidebar
    }); // pakai view engine (misal ejs)
  } catch (error) {
    res.status(500).send('Gagal menampilkan data');
  }
};




