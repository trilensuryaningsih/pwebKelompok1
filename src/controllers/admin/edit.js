
// controllers/admin/edit.js

const { item } = require('../../models'); // Sesuaikan path jika perlu

// 1. FUNGSI UNTUK MENAMPILKAN HALAMAN EDIT
exports.edit = async (req, res) => {
  try {
    // Ambil SEMUA item untuk ditampilkan di dropdown "Pilih item"
    const items = await item.findAll({
      order: [['nama', 'ASC']] // Urutkan berdasarkan nama agar mudah dicari
    });
    
    // Render halaman edit dan kirim data 'items' ke sana
    res.render('admin/edit', { items: items });
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal memuat halaman edit.');
  }
};

// 2. FUNGSI API UNTUK MENGAMBIL DETAIL SATU ITEM
exports.getitemDetails = async (req, res) => {
  try {
    const itemId = req.params.id;
    const selecteditem = await item.findByPk(itemId);
    
    if (!selecteditem) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    
    // Kirim detail item sebagai response JSON
    res.json(selecteditem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil detail item' });
  }
};


// 3. FUNGSI UNTUK MENYIMPAN PERUBAHAN (UPDATE)
exports.updateitem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { nama, kategori, deskripsi, status, jumlah } = req.body;

    // Cari item yang akan diupdate
    const itemToUpdate = await item.findByPk(itemId);
    if (!itemToUpdate) {
      return res.status(404).send('Item yang akan diupdate tidak ditemukan.');
    }

    // Update field-fieldnya dengan data baru dari form
    itemToUpdate.nama = nama;
    itemToUpdate.kategori = kategori;
    itemToUpdate.deskripsi = deskripsi;
    itemToUpdate.status = status;
    itemToUpdate.jumlah = parseInt(jumlah);

    // Cek jika ada file foto baru yang di-upload
    if (req.file) {
      itemToUpdate.foto = req.file.filename;
      
      // Optional: tambahkan logika untuk menghapus foto lama dari server
    }

    // Simpan perubahan ke database
    await itemToUpdate.save();

    // Redirect ke halaman daftar untuk melihat hasilnya
    res.redirect('/admin/daftar');

  } catch (error) {
    console.error('Gagal mengupdate item:', error);
    res.status(500).send('Terjadi kesalahan saat menyimpan perubahan.');
  }
};