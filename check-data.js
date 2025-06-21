// Script untuk mengecek data user dan order
// Jalankan dengan: node check-data.js

const { User, Order, Fine } = require('./src/models');

async function checkData() {
    try {
        const [results, metadata] = await Fine.sequelize.query(`
            SELECT 
                F.orderId,
                O.user_id,
                U.name AS user_name,
                U.email AS user_email
            FROM Fines AS F
            JOIN Orders AS O ON F.orderId = O.id
            JOIN Users AS U ON O.user_id = U.id
            ORDER BY F.createdAt DESC
            LIMIT 1
        `);

        if (results.length === 0) {
            console.log('\n❌ Tidak ada denda yang ditemukan di database.');
            console.log('   Silakan jalankan script "create-fine-example.js" terlebih dahulu.');
            return;
        }

        const fineInfo = results[0];

        console.log('\n✅ Denda ditemukan!');
        console.log('--------------------------------------------------');
        console.log(`Denda untuk Order ID: ${fineInfo.orderId}`);
        console.log(`Milik User ID: ${fineInfo.user_id}`);
        console.log(`Nama User: ${fineInfo.user_name}`);
        console.log(`Email User: ${fineInfo.user_email}`);
        console.log('--------------------------------------------------');

        // 2. Tampilkan semua user yang ada
        const [allUsers, userMetadata] = await User.sequelize.query("SELECT id, name, email, role FROM Users");

        console.log('\n👥 Daftar Semua User di Database:');
        allUsers.forEach(user => {
            console.log(`   - ID: ${user.id} | Nama: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
        });
        console.log('--------------------------------------------------');
        
        console.log('\n📌 KESIMPULAN:');
        console.log(`Untuk melihat denda, silakan LOGIN dengan user:`);
        console.log(`   Email: ${fineInfo.user_email}`);
        console.log('Setelah login, buka kembali halaman:');
        console.log('   http://localhost:3000/user/pembayaran');


    } catch (error) {
        console.error('\n❌ Terjadi kesalahan saat mengecek data:', error);
    } finally {
        // Pastikan koneksi ditutup jika perlu
        await Fine.sequelize.close();
    }
}

checkData(); 