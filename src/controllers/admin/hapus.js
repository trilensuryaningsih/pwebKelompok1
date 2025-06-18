// src/controllers/admin/hapus.js
const { items: ItemModel } = require('../../models');
const fs = require('fs'); 
const path = require('path');

exports.deleteItemAPI = async (req, res) => {
  try {
    const itemId = req.params.id;
    const itemToDelete = await ItemModel.findByPk(itemId);

    if (!itemToDelete) {
      return res.status(404).json({ success: false, message: 'Item tidak ditemukan.' });
    }

    if (itemToDelete.foto) {
      const fotoPath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', itemToDelete.foto);
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