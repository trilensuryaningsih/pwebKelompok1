const { Order, User, Item, Service } = require('../../models');
const { Op } = require('sequelize');

const ordersController = {
    // Get all orders for a user
    getUserOrders: async (req, res) => {
        try {
            const user_id = req.session.user.id;
            
            const orders = await Order.findAll({
                where: { user_id: user_id },
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['name', 'email']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.json({ 
                success: true, 
                data: orders 
            });
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching orders' 
            });
        }
    },

    // Get order by ID
    getOrderById: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.session.user.id;

            const order = await Order.findOne({
                where: { 
                    id: id,
                    user_id: user_id 
                },
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['name', 'email']
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Order not found' 
                });
            }

            // Get item or service details
            let itemDetails = null;
            if (order.itemType === 'item') {
                const { Item } = require('../../models');
                itemDetails = await Item.findByPk(order.itemId);
            } else {
                const { Service } = require('../../models');
                itemDetails = await Service.findByPk(order.itemId);
            }

            // Add item/service details to response
            const orderData = order.toJSON();
            orderData.itemDetails = itemDetails;

            return res.json({ 
                success: true, 
                data: orderData
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching order' 
            });
        }
    },

    // Get orders by status
    getOrdersByStatus: async (req, res) => {
        try {
            const { status } = req.params;
            const user_id = req.session.user.id;

            const orders = await Order.findAll({
                where: { 
                    status: status,
                    user_id: user_id 
                },
                include: [
                    {
                        model: User,
                        as: 'User',
                        attributes: ['name', 'email']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.json({ 
                success: true, 
                data: orders 
            });
        } catch (error) {
            console.error('Error fetching orders by status:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Error fetching orders' 
            });
        }
    },

    // Create new order
    createOrder: async (req, res) => {
        try {
            const {
                itemType,
                itemId,
                quantity,
                startDate,
                endDate,
                notes
            } = req.body;

            const user_id = req.session.user.id;

            // Validate required fields
            if (!itemType || !itemId || !quantity || !startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Validate itemType
            if (!['item', 'service'].includes(itemType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid item type. Must be "item" or "service"'
                });
            }

            // Check if item exists and is available
            let item;
            if (itemType === 'item') {
                item = await Item.findByPk(itemId);
            } else {
                // For service, you might need to import Service model
                const { Service } = require('../../models');
                item = await Service.findByPk(itemId);
            }

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found'
                });
            }

            if (item.status !== 'available' || item.quantity < quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Item is not available in requested quantity'
                });
            }

            // Calculate total amount
            const totalAmount = item.price * quantity;

            // Create order
            const order = await Order.create({
                user_id: user_id,
                itemType: itemType,
                itemId: itemId,
                quantity: quantity,
                startDate: startDate,
                endDate: endDate,
                status: 'pending',
                notes: notes || null,
                totalAmount: totalAmount
            });

            return res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });
        } catch (error) {
            console.error('Error creating order:', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating order'
            });
        }
    },

    // Update order status
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const user_id = req.session.user.id;

            const order = await Order.findOne({
                where: { 
                    id: id,
                    user_id: user_id 
                }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Validate status transition
            const validStatuses = ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            await order.update({ status: status });

            return res.json({
                success: true,
                message: 'Order status updated successfully',
                data: order
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            return res.status(500).json({
                success: false,
                message: 'Error updating order status'
            });
        }
    },

    // Cancel order
    cancelOrder: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.session.user.id;

            console.log(`Cancelling order ${id} for user ${user_id}`);

            // Find order first
            const order = await Order.findOne({
                where: { 
                    id: id,
                    user_id: user_id 
                }
            });

            if (!order) {
                console.log(`Order ${id} not found for user ${user_id}`);
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            console.log(`Found order:`, {
                id: order.id,
                itemType: order.itemType,
                itemId: order.itemId,
                quantity: order.quantity,
                status: order.status
            });

            // Only allow cancellation of pending orders
            if (order.status !== 'pending') {
                console.log(`Order ${id} cannot be cancelled - status: ${order.status}`);
                return res.status(400).json({
                    success: false,
                    message: 'Only pending orders can be cancelled'
                });
            }

            // Start transaction to ensure data consistency
            const transaction = await Order.sequelize.transaction();
            
            try {
                console.log(`Starting transaction for order ${id}`);
                
                // Update order status to cancelled
                await order.update({ status: 'cancelled' }, { transaction });
                console.log(`Order ${id} status updated to cancelled`);
                
                // Return quantity to Item or Service
                if (order.itemType === 'item') {
                    console.log(`Processing item with ID: ${order.itemId}`);
                    const item = await Item.findByPk(order.itemId, { transaction });
                    if (item) {
                        const oldQuantity = item.quantity;
                        const newQuantity = oldQuantity + order.quantity;
                        console.log(`Item ${item.name}: ${oldQuantity} + ${order.quantity} = ${newQuantity}`);
                        
                        await item.update({ 
                            quantity: newQuantity,
                            status: newQuantity > 0 ? 'available' : 'unavailable'
                        }, { transaction });
                        
                        console.log(`Item ${item.name} quantity updated successfully`);
                    } else {
                        console.log(`Item with ID ${order.itemId} not found`);
                    }
                } else if (order.itemType === 'service') {
                    console.log(`Processing service with ID: ${order.itemId}`);
                    const service = await Service.findByPk(order.itemId, { transaction });
                    if (service) {
                        const oldQuantity = service.quantity;
                        const newQuantity = oldQuantity + order.quantity;
                        console.log(`Service ${service.name}: ${oldQuantity} + ${order.quantity} = ${newQuantity}`);
                        
                        await service.update({ 
                            quantity: newQuantity,
                            status: newQuantity > 0 ? 'available' : 'unavailable'
                        }, { transaction });
                        
                        console.log(`Service ${service.name} quantity updated successfully`);
                    } else {
                        console.log(`Service with ID ${order.itemId} not found`);
                    }
                } else {
                    console.log(`Unknown itemType: ${order.itemType}`);
                }
                
                // Commit transaction
                await transaction.commit();
                console.log(`Transaction committed successfully for order ${id}`);

                return res.json({
                    success: true,
                    message: 'Order cancelled successfully and quantity returned',
                    data: order
                });
                
            } catch (error) {
                // Rollback transaction on error
                console.error(`Error in transaction for order ${id}:`, error);
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            return res.status(500).json({
                success: false,
                message: 'Error cancelling order'
            });
        }
    },

    // Get order statistics for user
    getOrderStats: async (req, res) => {
        try {
            const user_id = req.session.user.id;

            const stats = await Order.findAll({
                where: { user_id: user_id },
                attributes: [
                    'status',
                    [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
                ],
                group: ['status']
            });

            const totalOrders = await Order.count({
                where: { user_id: user_id }
            });

            return res.json({
                success: true,
                data: {
                    stats: stats,
                    totalOrders: totalOrders
                }
            });
        } catch (error) {
            console.error('Error fetching order stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching order statistics'
            });
        }
    }
};

module.exports = ordersController; 