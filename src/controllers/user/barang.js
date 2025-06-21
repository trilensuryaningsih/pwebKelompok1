const { Item, Service } = require('../../models');
const { Op } = require('sequelize');

const barangController = {
    // Get all items (alat)
    getAllItems: async (req, res) => {
        try {
            const allItems = await Item.findAll({
                where: { type: 'tool' },
                order: [['id', 'ASC']]
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

    // Get items by category (alat)
    getItemsByCategory: async (kategori) => {
        try {
            const itemsByCategory = await Item.findAll({
                where: {
                    type: 'tool',
                    category: kategori
                },
                order: [['id', 'ASC']]
            });
            return itemsByCategory;
        } catch (error) {
            console.error('Error fetching items by category:', error);
            throw error;
        }
    },

    // Get available items only (alat)
    getAvailableItems: async () => {
        try {
            const availableItems = await Item.findAll({
                where: {
                    type: 'tool',
                    status: 'available',
                    quantity: { [Op.gt]: 0 }
                },
                order: [['id', 'ASC']]
            });
            return availableItems;
        } catch (error) {
            console.error('Error fetching available items:', error);
            throw error;
        }
    },

    // Get all services (jasa)
    getAllServices: async () => {
        try {
            const allServices = await Service.findAll({
                order: [['id', 'ASC']]
            });
            return allServices;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    },

    // Get available services only (jasa)
    getAvailableServices: async () => {
        try {
            const availableServices = await Service.findAll({
                where: { 
                    status: 'available',
                    quantity: { [Op.gt]: 0 }
                },
                order: [['id', 'ASC']]
            });
            return availableServices;
        } catch (error) {
            console.error('Error fetching available services:', error);
            throw error;
        }
    },

    // Check item (alat) availability
    checkItemAvailability: async (id, requestedQuantity) => {
        try {
            const item = await Item.findByPk(id);
            if (!item) {
                return { available: false, message: 'Item not found' };
            }
            if (item.status !== 'available') {
                return { available: false, message: 'Item is not available' };
            }
            if (item.quantity < requestedQuantity) {
                return { available: false, message: `Only ${item.quantity} items available` };
            }
            return { available: true, item };
        } catch (error) {
            console.error('Error checking item availability:', error);
            throw error;
        }
    },

    // Check service (jasa) availability
    checkServiceAvailability: async (id, requestedQuantity = 1) => {
        try {
            const service = await Service.findByPk(id);
            if (!service) {
                return { available: false, message: 'Service not found' };
            }
            if (service.status !== 'available') {
                return { available: false, message: 'Service is not available' };
            }
            if (service.quantity < requestedQuantity) {
                return { available: false, message: `Only ${service.quantity} services available` };
            }
            return { available: true, service };
        } catch (error) {
            console.error('Error checking service availability:', error);
            throw error;
        }
    },

    // Get single item by ID (alat)
    getItemById: async (id) => {
        try {
            const item = await Item.findByPk(id);
            return item;
        } catch (error) {
            console.error('Error fetching item by ID:', error);
            throw error;
        }
    },

    // Get single service by ID (jasa)
    getServiceById: async (id) => {
        try {
            const service = await Service.findByPk(id);
            return service;
        } catch (error) {
            console.error('Error fetching service by ID:', error);
            throw error;
        }
    },
};

module.exports = barangController;
