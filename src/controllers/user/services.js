const { Service } = require('../../models');

const servicesController = {
    // Get all services
    getAllServices: async (req, res) => {
        try {
            const services = await Service.findAll({
                order: [['id', 'ASC']]
            });
            res.json({ success: true, data: services });
        } catch (error) {
            console.error('Error fetching services:', error);
            res.status(500).json({ success: false, message: 'Error fetching services' });
        }
    }
};

module.exports = servicesController; 