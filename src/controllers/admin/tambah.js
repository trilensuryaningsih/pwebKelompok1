// src/controllers/admin/tambah.js

// Impor model dengan nama yang benar ('items')
const { items } = require('../../models'); 

// Fungsi render halaman tambah (ini sudah benar)
exports.tambah = (req, res) => {
  res.render('admin/items/create');
};

// Fungsi untuk handle post data
exports.createitems = async (req, res) => {
  try {
    const { nama, kategori, deskripsi, status, jumlah } = req.body;

    // Cek apakah ada file yang di-upload
    if (!req.file) {
      return res.status(400).send('Foto item wajib diunggah.');
    }
    const foto = req.file.filename; // Ambil nama file dari req.file

    if (!nama || !kategori || !status || !jumlah) {
      return res.status(400).send('Form tidak lengkap. Semua field wajib diisi.');
    }

    // Gunakan 'items' (plural) untuk membuat data baru
    await items.create({
      nama,
      kategori,
      deskripsi,
      status,
      jumlah: parseInt(jumlah), // Pastikan jumlah adalah angka
      foto
    });

    res.redirect('/admin/tambah?success=true');

  } catch (err) {
    console.error('Gagal menyimpan data:', err);
    res.status(500).send('Terjadi kesalahan saat menyimpan data. Error: ' + err.message);
  }
};