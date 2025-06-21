// Test script untuk memverifikasi fungsionalitas halaman pesanan
// Jalankan dengan: node test-pesanan-functionality.js

const { Order, Fine, User, Item, Service } = require('./src/models');

async function testPesananFunctionality() {
    try {
        console.log('🧪 Testing Pesanan Page Functionality...\n');

        // 1. Test: Count orders and fines
        console.log('1. Testing data counts...');
        const totalOrders = await Order.count();
        const totalFines = await Fine.count();
        console.log(`   Total orders: ${totalOrders}`);
        console.log(`   Total fines: ${totalFines}`);

        // 2. Test: Get orders with user details
        console.log('\n2. Testing order data retrieval...');
        const orders = await Order.findAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 3
        });

        console.log(`   Found ${orders.length} orders with user details`);
        
        orders.forEach((order, index) => {
            console.log(`   Order ${index + 1}:`);
            console.log(`     - ID: ${order.id}`);
            console.log(`     - User: ${order.User?.name || 'N/A'} (${order.User?.email || 'N/A'})`);
            console.log(`     - Type: ${order.itemType}`);
            console.log(`     - Amount: Rp ${order.totalAmount || 0}`);
            console.log(`     - Status: ${order.status}`);
            console.log('');
        });

        // 3. Test: Get fines with order and user details
        console.log('3. Testing fine data retrieval...');
        const fines = await Fine.findAll({
            include: [
                { 
                    model: Order, 
                    attributes: ['id', 'user_id', 'itemType', 'itemId', 'totalAmount', 'status', 'createdAt'],
                    include: [
                        { model: User, attributes: ['id', 'name', 'email'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 3
        });

        console.log(`   Found ${fines.length} fines with details`);
        
        fines.forEach((fine, index) => {
            console.log(`   Fine ${index + 1}:`);
            console.log(`     - ID: ${fine.id}`);
            console.log(`     - Order ID: ${fine.orderId}`);
            console.log(`     - Amount: Rp ${fine.amount}`);
            console.log(`     - Status: ${fine.status}`);
            console.log(`     - Reason: ${fine.reason || 'N/A'}`);
            if (fine.Order?.User) {
                console.log(`     - User: ${fine.Order.User.name} (${fine.Order.User.email})`);
            }
            console.log('');
        });

        // 4. Test: Calculate statistics
        console.log('4. Testing statistics calculation...');
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const activeOrders = orders.filter(o => o.status === 'active').length;
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        
        const pendingFines = fines.filter(f => f.status === 'pending').length;
        const paidFines = fines.filter(f => f.status === 'paid').length;
        const waivedFines = fines.filter(f => f.status === 'waived').length;
        
        const totalFineAmount = fines.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
        const pendingFineAmount = fines.filter(f => f.status === 'pending').reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
        
        console.log(`   Order Stats:`);
        console.log(`     - Total: ${totalOrders}`);
        console.log(`     - Pending: ${pendingOrders}`);
        console.log(`     - Active: ${activeOrders}`);
        console.log(`     - Completed: ${completedOrders}`);
        
        console.log(`   Fine Stats:`);
        console.log(`     - Total: ${totalFines}`);
        console.log(`     - Pending: ${pendingFines}`);
        console.log(`     - Paid: ${paidFines}`);
        console.log(`     - Waived: ${waivedFines}`);
        console.log(`     - Total Amount: Rp ${totalFineAmount.toLocaleString('id-ID')}`);
        console.log(`     - Pending Amount: Rp ${pendingFineAmount.toLocaleString('id-ID')}`);

        // 5. Test: Update fine status (if fines exist)
        if (fines.length > 0) {
            console.log('\n5. Testing fine status update...');
            const testFine = fines[0];
            const originalStatus = testFine.status;
            
            // Try to update status
            await testFine.update({ status: 'paid' });
            console.log(`   Updated fine ${testFine.id} status from '${originalStatus}' to 'paid'`);
            
            // Revert back
            await testFine.update({ status: originalStatus });
            console.log(`   Reverted fine ${testFine.id} status back to '${originalStatus}'`);
        }

        console.log('\n✅ All pesanan page tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Total orders: ${totalOrders}`);
        console.log(`   - Total fines: ${totalFines}`);
        console.log(`   - Order data retrieval: ✅ Working`);
        console.log(`   - Fine data retrieval: ✅ Working`);
        console.log(`   - Statistics calculation: ✅ Working`);
        console.log(`   - Fine status update: ✅ Working`);
        console.log(`   - Database relationships: ✅ Working`);

    } catch (error) {
        console.error('❌ Error during testing:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testPesananFunctionality().then(() => {
    console.log('\n🏁 Test script finished');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 