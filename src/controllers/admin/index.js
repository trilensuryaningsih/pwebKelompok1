const { Item, Service } = require('../../models');

exports.index = async (req, res) => {
    try {
        // Count items and services
        const itemCount = await Item.count();
        const serviceCount = await Service.count();
        const totalCount = itemCount + serviceCount;
        
        res.render('admin/dashboard/index', {
            stats: {
                totalItems: totalCount,
                totalItemCount: itemCount,
                totalServiceCount: serviceCount
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.render('admin/dashboard/index', {
            stats: {
                totalItems: 0,
                totalItemCount: 0,
                totalServiceCount: 0
            }
        });
    }
}