// Script CLI untuk membuat denda manual
// Jalankan dengan: node create-fine-cli.js

const { Fine, Order } = require('./src/models');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createFineManually() {
    try {
        // Tampilkan semua order yang ada
        const orders = await Order.findAll({
            attributes: ['id', 'user_id', 'itemId', 'startDate', 'endDate', 'status']
        });

        console.log('\n=== DAFTAR ORDER YANG TERSEDIA ===');
        orders.forEach(order => {
            console.log(`ID: ${order.id} | User: ${order.user_id} | Item: ${order.itemId} | Status: ${order.status}`);
        });

        // Input dari user
        const orderId = await question('Masukkan Order ID: ');
        const amount = await question('Masukkan jumlah denda (Rp): ');
        const reason = await question('Masukkan alasan denda: ');

        // Validasi order exists
        const order = await Order.findByPk(orderId);
        if (!order) {
            console.log('❌ Order tidak ditemukan!');
            rl.close();
            return;
        }

        // Cek apakah sudah ada denda untuk order ini
        const existingFine = await Fine.findOne({ where: { orderId } });
        if (existingFine) {
            console.log('⚠️  Sudah ada denda untuk order ini!');
            rl.close();
            return;
        }

        // Buat denda
        const fine = await Fine.create({
            orderId: parseInt(orderId),
            amount: parseFloat(amount),
            reason: reason,
            status: 'pending',
            dueDate: new Date(),
        });

        console.log('\n✅ Denda berhasil dibuat!');
        console.log('📋 Detail denda:');
        console.log(`   - ID Denda: ${fine.id}`);
        console.log(`   - Order ID: ${fine.orderId}`);
        console.log(`   - Jumlah: Rp ${fine.amount.toLocaleString('id-ID')}`);
        console.log(`   - Alasan: ${fine.reason}`);
        console.log(`   - Status: ${fine.status}`);
        console.log(`   - Tanggal: ${fine.createdAt.toLocaleString('id-ID')}`);

        console.log('\n🌐 Lihat denda di:');
        console.log(`   http://localhost:3000/user/orders/${orderId}`);
        console.log(`   http://localhost:3000/user/pembayaran`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Jalankan script
createFineManually(); 