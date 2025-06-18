const path = require('path');
const multer = require('multer');
const { item } = require('../../models');

// Fungsi render halaman tambah
exports.tambah = (req, res) => {
  res.render('admin/tambah');
};

// Setup multer di luar kalau mau pakai di route
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

exports.upload = multer({ storage });

// Fungsi untuk handle post data
exports.createitem = async (req, res) => {
  try {
    const { nama, kategori, deskripsi, status, jumlah } = req.body;
    const foto = req.file?.filename || null;

    if (!nama || !kategori || !status || !jumlah) {
      return res.status(400).send('Form tidak lengkap.');
    }

    await item.create({
      nama,
      kategori,
      deskripsi,
      status,
      jumlah: parseInt(jumlah),
      foto
    });

    
    res.redirect('/admin/tambah?success=true');

  } catch (err) {
    console.error('Gagal menyimpan data:', err);
    res.status(500).send('Terjadi kesalahan saat menyimpan data.');
  }
};
