const { Order, Item, Service } = require('../../models');

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

        // Update order status to cancelled first
        await order.update({ status: 'cancelled' });
        console.log(`Order ${orderId} status updated to cancelled`);
        
        // Return quantity to Item or Service
        if (order.itemType === 'item') {
            console.log(`Processing item with ID: ${order.itemId}`);
            const item = await Item.findByPk(order.itemId);
            if (item) {
                const oldQuantity = item.quantity;
                const newQuantity = oldQuantity + order.quantity;
                console.log(`Item ${item.name}: ${oldQuantity} + ${order.quantity} = ${newQuantity}`);
                
                await item.update({ 
                    quantity: newQuantity,
                    status: newQuantity > 0 ? 'available' : 'unavailable'
                });
                
                console.log(`Item ${item.name} quantity updated successfully`);
                
                // Verify the update
                const updatedItem = await Item.findByPk(order.itemId);
                console.log(`Verification - Item ${item.name} quantity after update: ${updatedItem.quantity}`);
            } else {
                console.log(`Item with ID ${order.itemId} not found`);
            }
        } else if (order.itemType === 'service') {
            console.log(`Processing service with ID: ${order.itemId}`);
            const service = await Service.findByPk(order.itemId);
            if (service) {
                const oldQuantity = service.quantity;
                const newQuantity = oldQuantity + order.quantity;
                console.log(`Service ${service.name}: ${oldQuantity} + ${order.quantity} = ${newQuantity}`);
                
                await service.update({ 
                    quantity: newQuantity,
                    status: newQuantity > 0 ? 'available' : 'unavailable'
                });
                
                console.log(`Service ${service.name} quantity updated successfully`);
                
                // Verify the update
                const updatedService = await Service.findByPk(order.itemId);
                console.log(`Verification - Service ${service.name} quantity after update: ${updatedService.quantity}`);
            } else {
                console.log(`Service with ID ${order.itemId} not found`);
            }
        } else {
            console.log(`Unknown itemType: ${order.itemType}`);
        }
        
        // Final verification
        if (order.itemType === 'item') {
            const finalItem = await Item.findByPk(order.itemId);
            console.log(`Final verification - Item quantity in database: ${finalItem.quantity}`);
        } else if (order.itemType === 'service') {
            const finalService = await Service.findByPk(order.itemId);
            console.log(`Final verification - Service quantity in database: ${finalService.quantity}`);
        }
        
        res.json({ 
            success: true, 
            message: 'Pesanan berhasil dibatalkan dan quantity telah dikembalikan' 
        });
        
    } catch (e) {
        console.error('Error cancelling order:', e);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal membatalkan pesanan' 
        });
    }
}; 