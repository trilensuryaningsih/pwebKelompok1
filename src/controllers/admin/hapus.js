// src/controllers/admin/hapus.js
const { Item, Service } = require('../../models');
const fs = require('fs'); 
const path = require('path');

// Menampilkan halaman konfirmasi hapus
exports.showDeleteConfirmation = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { type } = req.query;
    
    let item;
    if (type === 'service') {
      item = await Service.findByPk(itemId);
    } else {
      item = await Item.findByPk(itemId);
    }

    if (!item) {
      return res.status(404).render('error', {
        message: 'Item tidak ditemukan',
        error: { status: 404 }
      });
    }

    // Tambahkan tipe ke objek item untuk digunakan di view
    item.type = type || 'item';

    res.render('admin/items/delete', { item });
  } catch (error) {
    console.error('Gagal mengambil data item untuk konfirmasi hapus:', error);
    res.status(500).render('error', {
      message: 'Terjadi kesalahan pada server',
      error: { status: 500 }
    });
  }
};

exports.deleteItemAPI = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { type } = req.query;
    
    let itemToDelete;
    if (type === 'service') {
      itemToDelete = await Service.findByPk(itemId);
    } else {
      itemToDelete = await Item.findByPk(itemId);
    }

    if (!itemToDelete) {
      return res.status(404).json({ success: false, message: 'Item tidak ditemukan.' });
    }

    if (itemToDelete.photo) {
      const fotoPath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', itemToDelete.photo);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    await itemToDelete.destroy();
    
    // FUNGSI INI HARUS MENGEMBALIKAN JSON, BUKAN REDIRECT
    res.json({ success: true, message: 'Item berhasil dihapus.' });

  } catch (error) {
    console.error('Gagal menghapus item via API:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
  }
};