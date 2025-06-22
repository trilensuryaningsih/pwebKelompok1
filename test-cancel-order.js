const { Order, Item, Service } = require('./src/models');

async function testCancelOrder() {
    try {
        console.log('=== Testing Cancel Order Functionality ===');
        
        // Find a pending order
        const pendingOrder = await Order.findOne({
            where: { status: 'pending' }
        });
        
        if (!pendingOrder) {
            console.log('No pending orders found for testing');
            return;
        }
        
        console.log('Found pending order:', {
            id: pendingOrder.id,
            itemType: pendingOrder.itemType,
            itemId: pendingOrder.itemId,
            quantity: pendingOrder.quantity,
            status: pendingOrder.status
        });
        
        // Get current quantity before cancellation
        let currentQuantity;
        if (pendingOrder.itemType === 'item') {
            const item = await Item.findByPk(pendingOrder.itemId);
            currentQuantity = item.quantity;
            console.log(`Current item quantity: ${currentQuantity}`);
        } else if (pendingOrder.itemType === 'service') {
            const service = await Service.findByPk(pendingOrder.itemId);
            currentQuantity = service.quantity;
            console.log(`Current service quantity: ${currentQuantity}`);
        }
        
        // Simulate cancellation
        const transaction = await Order.sequelize.transaction();
        
        try {
            // Update order status to cancelled
            await pendingOrder.update({ status: 'cancelled' }, { transaction });
            
            // Return quantity
            if (pendingOrder.itemType === 'item') {
                const item = await Item.findByPk(pendingOrder.itemId, { transaction });
                const newQuantity = item.quantity + pendingOrder.quantity;
                await item.update({ 
                    quantity: newQuantity,
                    status: newQuantity > 0 ? 'available' : 'unavailable'
                }, { transaction });
                console.log(`Item quantity updated: ${item.quantity} + ${pendingOrder.quantity} = ${newQuantity}`);
            } else if (pendingOrder.itemType === 'service') {
                const service = await Service.findByPk(pendingOrder.itemId, { transaction });
                const newQuantity = service.quantity + pendingOrder.quantity;
                await service.update({ 
                    quantity: newQuantity,
                    status: newQuantity > 0 ? 'available' : 'unavailable'
                }, { transaction });
                console.log(`Service quantity updated: ${service.quantity} + ${pendingOrder.quantity} = ${newQuantity}`);
            }
            
            await transaction.commit();
            console.log('Transaction committed successfully');
            
            // Verify final quantity
            if (pendingOrder.itemType === 'item') {
                const finalItem = await Item.findByPk(pendingOrder.itemId);
                console.log(`Final item quantity: ${finalItem.quantity}`);
                console.log(`Expected quantity: ${currentQuantity + pendingOrder.quantity}`);
                console.log(`Quantity restored correctly: ${finalItem.quantity === (currentQuantity + pendingOrder.quantity)}`);
            } else if (pendingOrder.itemType === 'service') {
                const finalService = await Service.findByPk(pendingOrder.itemId);
                console.log(`Final service quantity: ${finalService.quantity}`);
                console.log(`Expected quantity: ${currentQuantity + pendingOrder.quantity}`);
                console.log(`Quantity restored correctly: ${finalService.quantity === (currentQuantity + pendingOrder.quantity)}`);
            }
            
        } catch (error) {
            await transaction.rollback();
            console.error('Error in test:', error);
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testCancelOrder().then(() => {
    console.log('Test completed');
    process.exit(0);
}).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
}); 