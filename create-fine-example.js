// Script untuk menambahkan denda contoh ke database
// Jalankan dengan: node create-fine-example.js

const { Fine, Order } = require('./src/models');

async function createExampleFine() {
    try {
        // Cari order yang sudah ada (ganti dengan order ID yang valid)
        const order = await Order.findOne();
        
        if (!order) {
            console.log('Tidak ada order yang ditemukan. Buat order terlebih dahulu.');
            return;
        }

        // Buat denda contoh
        const fine = await Fine.create({
            orderId: order.id,
            amount: 50000, // Rp 50.000
            reason: 'Keterlambatan pengembalian barang',
            status: 'pending',
            dueDate: new Date(),
        });

        console.log('Denda berhasil dibuat:', fine.toJSON());
        console.log('Order ID:', order.id);
        console.log('Sekarang Anda bisa melihat denda di:');
        console.log(`http://localhost:3000/user/orders/${order.id}`);
        
    } catch (error) {
        console.error('Error membuat denda:', error);
    }
}

// Jalankan script
createExampleFine(); 