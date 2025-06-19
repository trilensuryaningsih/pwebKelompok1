// src/controllers/admin/tambah.js

// Impor model dengan nama yang benar ('items')
const { item } = require('../../models'); 

// Fungsi render halaman tambah (ini sudah benar)
exports.tambah = (req, res) => {
  res.render('admin/tambah');
};

// Fungsi untuk handle post data
exports.createitems = async (req, res) => {
  try {
    const { nama, kategori, deskripsi, status, harga, jumlah } = req.body;

    // Cek apakah ada file yang di-upload
    if (!req.file) {
      return res.status(400).send('Foto item wajib diunggah.');
    }
    const foto = req.file.filename; // Ambil nama file dari req.file

    if (!nama || !kategori || !status || !jumlah) {
      return res.status(400).send('Form tidak lengkap. Semua field wajib diisi.');
    }

    // Gunakan 'items' (plural) untuk membuat data baru
    await item.create({
      nama,
      kategori,
      deskripsi,
      status,
      harga: kategori === 'jasa' ? parseInt(harga) : null,
      jumlah: parseInt(jumlah), // Pastikan jumlah adalah angka
      foto
    });

    if (kategori === 'jasa' && (!harga || isNaN(harga))) {
  return res.status(400).send('Harga wajib diisi jika kategori adalah jasa.');
}

    res.redirect('/admin/tambah?success=true');

  } catch (err) {
    console.error('Gagal menyimpan data:', err);
    res.status(500).send('Terjadi kesalahan saat menyimpan data. Error: ' + err.message);
  }
};