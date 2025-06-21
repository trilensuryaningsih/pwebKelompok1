const { Item, Service } = require('../../models');
const path = require('path');

// List all items (for page)
exports.showAllItemsPage = async (req, res) => {
  try {
    const items = await Item.findAll();
    const services = await Service.findAll();
    // Map and normalize both to a common structure
    const itemList = items.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      photo: i.photo,
      status: i.status,
      category: i.category,
      price: i.price,
      quantity: i.quantity,
      type: 'item',
      createdAt: i.createdAt,
      updatedAt: i.updatedAt
    }));
    const serviceList = services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      photo: s.photo,
      status: s.status,
      category: s.category || 'jasa',
      price: s.price,
      quantity: '-',
      type: 'service',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));
    // Gabungkan dan urutkan
    const allItems = [...itemList, ...serviceList]
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((item, idx) => ({ ...item, no: idx + 1 }));
    res.render('admin/items/index', { items: allItems });
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
    const { name, category, description, status, price, quantity } = req.body;
    const foto = req.file ? req.file.filename : null;
    const updateData = {
      name,
      category,
      description,
      status,
      quantity,
      price: category === 'jasa' ? price : null
    };
    if (foto) updateData.photo = foto;
    await Item.update(updateData, { where: { id: req.params.id } });
    res.redirect('/admin/items?update=success');
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

// Tampilkan halaman form tambah item
exports.showCreateItemPage = (req, res) => {
  res.render('admin/items/create');
};

// Tampilkan halaman detail item
exports.showItemDetailPage = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).send('Item tidak ditemukan.');
    res.render('admin/items/detail', { item });
  } catch (err) {
    res.status(500).send('Gagal memuat detail item.');
  }
};

// Tampilkan halaman konfirmasi hapus item
exports.showDeleteItemPage = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).send('Item tidak ditemukan.');
    res.render('admin/items/delete', { item });
  } catch (err) {
    res.status(500).send('Gagal memuat halaman hapus item.');
  }
};
