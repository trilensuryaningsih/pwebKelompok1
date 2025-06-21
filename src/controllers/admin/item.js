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
      category: s.category,
      price: s.price,
      quantity: '-',
      type: 'service',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));
    // Gabungkan dan urutkan berdasarkan tipe (item dulu, kemudian service)
    const allItems = [...itemList, ...serviceList]
      .sort((a, b) => {
        // Sort by type first (item before service)
        if (a.type !== b.type) {
          return a.type === 'item' ? -1 : 1;
        }
        // Then sort by name within each type
        return a.name.localeCompare(b.name);
      })
      .map((item, idx) => ({ ...item, no: idx + 1 }));
    res.render('admin/items/index', { items: allItems });
  } catch (err) {
    res.status(500).send('Gagal memuat data item.');
  }
};

// Get item details (API)
exports.getItemDetails = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { type } = req.query;
    
    let item;
    if (type === 'service') {
      item = await Service.findByPk(itemId);
    } else {
      item = await Item.findByPk(itemId);
    }
    
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan.' });
    
    // Log the item data for debugging
    console.log('Item data:', {
      id: item.id,
      name: item.name,
      category: item.category,
      type: type
    });
    
    res.json(item);
  } catch (err) {
    console.error('Error in getItemDetails:', err);
    res.status(500).json({ message: 'Gagal mengambil detail item.' });
  }
};

// Create Service (POST)
exports.createItem = async (req, res) => {
  try {
    const { nama, kategori, deskripsi, harga } = req.body;
    const foto = req.file ? req.file.filename : null;

    await Service.create({
      name: nama,
      category: kategori,
      description: deskripsi,
      status: 'available',
      price: harga,
      photo: foto,
    });
    res.redirect('/admin/items/create?success=true');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menambah jasa.');
  }
};

// Update item (POST)
exports.updateItem = async (req, res) => {
  try {
    const { name, category, description, status, price, quantity, type } = req.body;
    const foto = req.file ? req.file.filename : null;
    
    console.log('Update request body:', req.body); // Debug log
    console.log('Update request params:', req.params); // Debug log
    
    // Determine type if not provided
    let itemType = type;
    if (!itemType) {
      // Try to determine type by checking if item exists in either model
      const itemExists = await Item.findByPk(req.params.id);
      const serviceExists = await Service.findByPk(req.params.id);
      
      if (itemExists && !serviceExists) {
        itemType = 'item';
      } else if (serviceExists && !itemExists) {
        itemType = 'service';
      } else {
        throw new Error('Tidak dapat menentukan tipe item');
      }
    }
    
    console.log('Determined type:', itemType); // Debug log
    
    let updateData = {
      name,
      category,
      description,
      status
    };
    
    if (itemType === 'service') {
      updateData.price = price;
    } else {
      updateData.quantity = quantity;
      updateData.price = null;
    }
    
    if (foto) updateData.photo = foto;
    
    console.log('Update data:', updateData); // Debug log
    
    if (itemType === 'service') {
      await Service.update(updateData, { where: { id: req.params.id } });
    } else {
      await Item.update(updateData, { where: { id: req.params.id } });
    }
    
    res.redirect('/admin/items?update=success');
  } catch (err) {
    console.error('Error in updateItem:', err);
    res.status(500).send('Gagal mengupdate item: ' + err.message);
  }
};

// Delete item (POST, non-API)
exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { type } = req.body;
    
    let deleted = false;
    if (type === 'service') {
      deleted = await Service.destroy({ where: { id } });
    } else {
      deleted = await Item.destroy({ where: { id } });
    }
    
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
    const itemId = req.params.id;
    
    // Try to find in Item model first
    let item = await Item.findByPk(itemId);
    let itemType = 'item';
    
    // If not found in Item, try Service model
    if (!item) {
      item = await Service.findByPk(itemId);
      itemType = 'service';
    }
    
    if (!item) return res.status(404).send('Item tidak ditemukan.');
    
    // Add type to item object
    item = item.toJSON();
    item.type = itemType;
    
    res.render('admin/items/detail', { item });
  } catch (err) {
    res.status(500).send('Gagal memuat detail item.');
  }
};

// Tampilkan halaman konfirmasi hapus item
exports.showDeleteItemPage = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Try to find in Item model first
    let item = await Item.findByPk(itemId);
    let itemType = 'item';
    
    // If not found in Item, try Service model
    if (!item) {
      item = await Service.findByPk(itemId);
      itemType = 'service';
    }
    
    if (!item) return res.status(404).send('Item tidak ditemukan.');
    
    // Add type to item object
    item = item.toJSON();
    item.type = itemType;
    
    res.render('admin/items/delete', { item });
  } catch (err) {
    res.status(500).send('Gagal memuat halaman hapus item.');
  }
};
