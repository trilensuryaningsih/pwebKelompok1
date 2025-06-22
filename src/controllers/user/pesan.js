const { User, Item, Service, Order } = require('../../models');

exports.createOrder = async (req, res) => {
    try {
        const { email } = req.session.user;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ success: false, message: 'User not found' });

        const { pesanan, startDate, endDate, notes } = req.body;
        if (!pesanan || !Array.isArray(pesanan) || pesanan.length === 0) {
            return res.status(400).json({ success: false, message: 'Pesanan kosong' });
        }
        const createdOrders = [];
        for (const p of pesanan) {
            let itemType = p.type === 'tool' ? 'item' : 'service';
            let itemId = p.id;
            let quantity = p.quantity;
            let totalAmount = quantity;
            let mouFile = `/user/download-mou-pdf`;
            // Validasi item/service
            if (itemType === 'item') {
                const item = await Item.findByPk(itemId);
                if (!item) continue;
            } else {
                const service = await Service.findByPk(itemId);
                if (!service) continue;
            }
            const order = await Order.create({
                user_id: user.id,
                itemType,
                itemId,
                quantity,
                startDate,
                endDate,
                status: 'pending',
                mouFile,
                notes: notes || null,
                totalAmount
            });
            createdOrders.push(order);
        }
        res.status(201).json({ success: true, data: createdOrders });
    } catch (e) {
        console.error('Order error:', e);
        res.status(500).json({ success: false, message: 'Gagal simpan pesanan', error: e.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orderId = req.params.id;
        
        console.log(`Cancelling order ${orderId} for user ${userId}`);
        
        // Find order first
        const order = await Order.findOne({ 
            where: { id: orderId, user_id: userId }
        });
        
        if (!order) {
            console.log(`Order ${orderId} not found for user ${userId}`);
            return res.status(404).json({ 
                success: false, 
                message: 'Pesanan tidak ditemukan' 
            });
        }
        
        console.log(`Found order:`, {
            id: order.id,
            itemType: order.itemType,
            itemId: order.itemId,
            quantity: order.quantity,
            status: order.status
        });
        
        if (!['pending', 'approved'].includes(order.status)) {
            console.log(`Order ${orderId} cannot be cancelled - status: ${order.status}`);
            return res.status(400).json({ 
                success: false, 
                message: 'Pesanan tidak bisa dibatalkan' 
            });
        }

        // Start transaction to ensure data consistency
        const transaction = await Order.sequelize.transaction();
        
        try {
            console.log(`Starting transaction for order ${orderId}`);
            
            // Update order status to cancelled
            await order.update({ status: 'cancelled' }, { transaction });
            console.log(`Order ${orderId} status updated to cancelled`);
            
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
            console.log(`Transaction committed successfully for order ${orderId}`);
            
            res.json({ 
                success: true, 
                message: 'Pesanan berhasil dibatalkan dan quantity telah dikembalikan' 
            });
            
        } catch (error) {
            // Rollback transaction on error
            console.error(`Error in transaction for order ${orderId}:`, error);
            await transaction.rollback();
            throw error;
        }
        
    } catch (e) {
        console.error('Error cancelling order:', e);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal membatalkan pesanan' 
        });
    }
}; 