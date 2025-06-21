// controllers/admin/edit.js

// PERBAIKAN: Impor modul 'fs' dan 'path' untuk menghapus file
const fs = require('fs');
const path = require('path');

const { Item } = require('../../models');

// 1. FUNGSI UNTUK MENAMPILKAN HALAMAN EDIT (Sudah Benar)
exports.edit = async (req, res) => {
  try {
    const allItems = await Item.findAll({
      order: [['name', 'ASC']]
    });
    // Kirim juga req.query agar notifikasi bisa tampil di halaman edit
    res.render('admin/items/edit', { items: allItems, query: req.query });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
};

// 2. FUNGSI API (Sudah Benar)
exports.getitemDetails = async (req, res) => {
  try {
    const itemId = req.params.id;
    const selecteditem = await Item.findByPk(itemId);
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
    const { name, category, description, status, price, quantity } = req.body;

    const itemToUpdate = await Item.findByPk(itemId);
    if (!itemToUpdate) {
      return res.status(404).send('Item yang akan diupdate tidak ditemukan.');
    }

    // Simpan nama file foto lama sebelum di-update
    const oldPhoto = itemToUpdate.photo;

    // Update field-fieldnya
    itemToUpdate.name = name;
    itemToUpdate.category = category;
    itemToUpdate.description = description;
    itemToUpdate.status = status; 
    itemToUpdate.price = category === 'jasa' ? parseFloat(price) : null;
    itemToUpdate.quantity = parseInt(quantity);

    // Cek jika ada file foto baru yang di-upload
    if (req.file) {
      itemToUpdate.photo = req.file.filename;
      // PERBAIKAN: Hapus file foto lama jika ada
      if (oldPhoto) {
        const oldPhotoPath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', oldPhoto);
        try {
          fs.unlinkSync(oldPhotoPath);
          console.log(`Successfully deleted old image: ${oldPhotoPath}`);
        } catch (unlinkErr) {
          console.error(`Error deleting old image: ${unlinkErr.message}`);
        }
      }
    }

    await itemToUpdate.save();
    // Redirect ke halaman daftar item agar pengguna bisa melihat perubahannya
    res.redirect('/admin/items?update=success');
  } catch (error) {
    console.error('Gagal mengupdate item:', error);
    res.status(500).send('Terjadi kesalahan saat menyimpan perubahan.');
  }
};