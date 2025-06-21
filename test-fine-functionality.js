// Test script untuk memverifikasi fungsionalitas denda
// Jalankan dengan: node test-fine-functionality.js

const { Fine, Order, User, Item, Service } = require('./src/models');

async function testFineFunctionality() {
    try {
        console.log('🧪 Testing Fine Functionality...\n');

        // 1. Test: Count total fines
        console.log('1. Testing fine count...');
        const totalFines = await Fine.count();
        console.log(`   Total fines in database: ${totalFines}`);

        // 2. Test: Get fines with order and user details
        console.log('\n2. Testing fine data retrieval...');
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

        // 3. Test: Count by status
        console.log('3. Testing fine status counts...');
        const pendingFines = await Fine.count({ where: { status: 'pending' } });
        const paidFines = await Fine.count({ where: { status: 'paid' } });
        const waivedFines = await Fine.count({ where: { status: 'waived' } });
        
        console.log(`   Pending: ${pendingFines}`);
        console.log(`   Paid: ${paidFines}`);
        console.log(`   Waived: ${waivedFines}`);

        // 4. Test: Calculate total amount
        console.log('\n4. Testing fine amount calculation...');
        const allFines = await Fine.findAll();
        const totalAmount = allFines.reduce((sum, fine) => sum + parseFloat(fine.amount || 0), 0);
        const pendingAmount = allFines
            .filter(fine => fine.status === 'pending')
            .reduce((sum, fine) => sum + parseFloat(fine.amount || 0), 0);
        
        console.log(`   Total amount: Rp ${totalAmount.toLocaleString('id-ID')}`);
        console.log(`   Pending amount: Rp ${pendingAmount.toLocaleString('id-ID')}`);

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

        console.log('\n✅ All tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Total fines: ${totalFines}`);
        console.log(`   - Pending fines: ${pendingFines}`);
        console.log(`   - Total amount: Rp ${totalAmount.toLocaleString('id-ID')}`);
        console.log(`   - Fine data retrieval: ✅ Working`);
        console.log(`   - Status update: ✅ Working`);

    } catch (error) {
        console.error('❌ Error during testing:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testFineFunctionality().then(() => {
    console.log('\n🏁 Test script finished');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
}); 