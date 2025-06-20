// controllers/admin/edit.js

// PERBAIKAN: Impor modul 'fs' dan 'path' untuk menghapus file
const fs = require('fs');
const path = require('path');

const { items } = require('../../models');

// 1. FUNGSI UNTUK MENAMPILKAN HALAMAN EDIT (Sudah Benar)
exports.edit = async (req, res) => {
  try {
    const items = await items.findAll();
    res.render('admin/items/edit', { items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
};

// 2. FUNGSI API (Sudah Benar)
exports.getitemDetails = async (req, res) => {
  try {
    const itemId = req.params.id;
    const selecteditem = await items.findByPk(itemId);
    if (!selecteditem) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    res.json(selecteditem);
  } catch (error) {
    console.error("Gagal mengambil detail item:", error);
    res.status(500).json({ message: 'Gagal mengambil detail item' });
  }
};

// 3. FUNGSI UNTUK MENYIMPAN PERUBAHAN (UPDATE) - DENGAN PERBAIKAN
exports.updateitem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { nama, kategori, deskripsi, status, jumlah } = req.body;

    const itemToUpdate = await items.findByPk(itemId);
    if (!itemToUpdate) {
      return res.status(404).send('Item yang akan diupdate tidak ditemukan.');
    }

    // Simpan nama file foto lama sebelum di-update
    const oldFoto = itemToUpdate.foto;

    // Update field-fieldnya
    itemToUpdate.nama = nama;
    itemToUpdate.kategori = kategori;
    itemToUpdate.deskripsi = deskripsi;
    itemToUpdate.status = status;
    itemToUpdate.jumlah = parseInt(jumlah);

    // Cek jika ada file foto baru yang di-upload
    if (req.file) {
      itemToUpdate.foto = req.file.filename;

      // PERBAIKAN: Hapus file foto lama jika ada
      if (oldFoto) {
        const oldFotoPath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', oldFoto);
        // Gunakan fs.unlink untuk menghapus file. Pakai try-catch untuk jaga-jaga jika file tidak ada
        try {
          fs.unlinkSync(oldFotoPath);
          console.log(`Successfully deleted old image: ${oldFotoPath}`);
        } catch (unlinkErr) {
          console.error(`Error deleting old image: ${unlinkErr.message}`);
        }
      }
    }

    await itemToUpdate.save();

    // PERBAIKAN: Redirect ke halaman daftar agar pengguna bisa melihat perubahannya
    res.redirect('/admin/edit?update=success');

  } catch (error) {
    console.error('Gagal mengupdate item:', error);
    res.status(500).send('Terjadi kesalahan saat menyimpan perubahan.');
  }
};