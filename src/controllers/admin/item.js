const { Item, Order, Service } = require('../../models');
const path = require('path');

// List all items (for page)
exports.showAllItemsPage = async (req, res) => {
  try {
    const items = await Item.findAll();
    res.render('admin/items/index', { items });
  } catch (err) {
    res.status(500).send('Gagal memuat data item.');
  }
};

// Get item details (API)
exports.getItemDetails = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail item.' });
  }
};

// Create item (POST)
exports.createItem = async (req, res) => {
  try {
    const { nama, kategori, deskripsi, status, jumlah } = req.body;
    const foto = req.file ? req.file.filename : null;
    await Item.create({
      name: nama,
      category: kategori,
      description: deskripsi,
      status,
      quantity: jumlah,
      photo: foto
    });
    res.redirect('/admin/items?create=success');
  } catch (err) {
    res.status(500).send('Gagal menambah item.');
  }
};

// Update item (POST)
exports.updateItem = async (req, res) => {
  try {
    const { nama, kategori, deskripsi, status, jumlah } = req.body;
    const foto = req.file ? req.file.filename : null;
    const updateData = {
      name: nama,
      category: kategori,
      description: deskripsi,
      status,
      quantity: jumlah
    };
    if (foto) updateData.photo = foto;
    await Item.update(updateData, { where: { id: req.params.id } });
    res.redirect('/admin/items/edit?update=success');
  } catch (err) {
    res.status(500).send('Gagal mengupdate item.');
  }
};

// Delete item (POST, non-API)
exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Item.destroy({ where: { id } });
    if (!deleted) return res.status(404).send('Item tidak ditemukan.');
    res.redirect('/admin/items?delete=success');
  } catch (err) {
    res.status(500).send('Gagal menghapus item.');
  }
};

exports.showAllOrdersPage = async (req, res) => {
  try {
    const { User, Item, Service } = require('../../models');
    
    const orders = await Order.findAll({
      include: [
        { 
          model: User, 
          attributes: ['name', 'email'], 
          required: false 
        },
        { 
          model: Item, 
          attributes: ['name', 'category'], 
          required: false 
        },
        { 
          model: Service, 
          attributes: ['name', 'category'], 
          required: false 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Orders found:', orders.length);
    
    res.render('admin/items/pesanan', { 
      orders,
      user: req.session.user || null
    });
  } catch (err) {
    console.error('Error in showAllOrdersPage:', err);
    res.status(500).send('Gagal memuat daftar pesanan: ' + err.message);
  }
};
