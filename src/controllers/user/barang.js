const { items } = require('../../models');
const { Op } = require('sequelize');

const barangController = {
    // Get all items
    getAllItems: async (req, res) => {
        try {
            const allItems = await items.findAll({
                order: [['id_item', 'ASC']]
            });

            if (res) {
                return res.json({ success: true, data: allItems });
            }
            return allItems;
        } catch (error) {
            console.error('Error fetching items:', error);
            if (res) {
                return res.status(500).json({ success: false, message: 'Error fetching items' });
            }
            throw error;
        }
    },

    // Get items by category
    getItemsByCategory: async (req, res) => {
        const { kategori } = req.params;
        try {
            const itemsByCategory = await items.findAll({
                where: {
                    kategori: kategori
                },
                order: [['id_item', 'ASC']]
            });

            if (itemsByCategory.length > 0) {
                return res.json({ success: true, data: itemsByCategory });
            } else {
                return res.status(404).json({ success: false, message: 'No items found in this category' });
            }
        } catch (error) {
            console.error('Error fetching items by category:', error);
            return res.status(500).json({ success: false, message: 'Error fetching items by category' });
        }
    },

    // Get available items only
    getAvailableItems: async (req, res) => {
        try {
            const availableItems = await items.findAll({
                where: {
                    status: 'tersedia',
                    jumlah: {
                        [Op.gt]: 0
                    }
                },
                order: [['id_item', 'ASC']]
            });

            if (availableItems.length > 0) {
                return res.json({ success: true, data: availableItems });
            } else {
                return res.status(404).json({ success: false, message: 'No available items found' });
            }
        } catch (error) {
            console.error('Error fetching available items:', error);
            return res.status(500).json({ success: false, message: 'Error fetching available items' });
        }
    },

    // Get single item by ID
    getItemById: async (req, res) => {
        const { id_item } = req.params;
        try {
            const item = await items.findByPk(id_item);
            if (item) {
                return res.json({ success: true, data: item });
            } else {
                return res.status(404).json({ success: false, message: 'Item not found' });
            }
        } catch (error) {
            console.error('Error fetching item by ID:', error);
            return res.status(500).json({ success: false, message: 'Error fetching item by ID' });
        }
    },

    // Update item quantity (for booking purposes)
    updateItemQuantity: async (id_item, newQuantity) => {
        try {
            const result = await items.update(
                { jumlah: newQuantity },
                { where: { id_item: id_item } }
            );
            return result;
        } catch (error) {
            console.error('Error updating item quantity:', error);
            throw error;
        }
    },

    // Check item availability
    checkItemAvailability: async (id_item, requestedQuantity) => {
        try {
            const item = await items.findByPk(id_item);
            if (!item) {
                return { available: false, message: 'Item not found' };
            }

            if (item.status !== 'available') {
                return { available: false, message: 'Item is not available' };
            }

            if (item.jumlah < requestedQuantity) {
                return { available: false, message: `Only ${item.jumlah} items available` };
            }

            return { available: true, item: item };
        } catch (error) {
            console.error('Error checking item availability:', error);
            throw error;
        }
    },

    // Create new order/booking
    createOrder: async (req, res) => {
        const { id_item, quantity, tanggal_pinjam, tanggal_kembali, user_id } = req.body;

        try {
            // Validate input
            if (!id_item || !quantity || !tanggal_pinjam || !tanggal_kembali || !user_id) {
                return res.status(400).json({ success: false, message: 'All fields must be filled' });
            }

            // Check item availability
            const availability = await barangController.checkItemAvailability(id_item, quantity);
            if (!availability.available) {
                return res.status(400).json({ success: false, message: availability.message });
            }

            // Update item quantity
            const currentItem = availability.item;
            const newQuantity = currentItem.jumlah - quantity;

            await barangController.updateItemQuantity(id_item, newQuantity);

            // Create order record (you might need to add this to a separate orders table)
            // Simulate order creation (this can be replaced with actual database logic)
            const order = {
                id_item,
                quantity,
                tanggal_pinjam,
                tanggal_kembali,
                user_id,
                status: 'pending',
            };

            return res.json({
                success: true,
                message: 'Order created successfully',
                order: order,
            });
        } catch (error) {
            console.error('Error creating order:', error);
            return res.status(500).json({ success: false, message: 'Error creating order' });
        }
    }
};

module.exports = barangController;
