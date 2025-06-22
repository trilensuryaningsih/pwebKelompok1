const { Sequelize, DataTypes } = require('sequelize');
const config = require('./src/config/config.json');

// Buat koneksi database
const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect,
    logging: false
});

// Import models dengan cara yang sama seperti di aplikasi utama
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./src/models/user')(sequelize, DataTypes);
db.Item = require('./src/models/item')(sequelize, DataTypes);
db.Service = require('./src/models/service')(sequelize, DataTypes);
db.Order = require('./src/models/order')(sequelize, DataTypes);
db.Payment = require('./src/models/payment')(sequelize, DataTypes);
db.Fine = require('./src/models/fine')(sequelize, DataTypes);
db.Notification = require('./src/models/notification')(sequelize, DataTypes);
db.Feedback = require('./src/models/feedback')(sequelize, DataTypes);
db.Repair = require('./src/models/repair')(sequelize, DataTypes);
db.Exchange = require('./src/models/exchange')(sequelize, DataTypes);

// Setup associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

async function fixTotalAmount() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Ambil semua orders
        const orders = await db.Order.findAll();
        console.log(`Found ${orders.length} orders to fix.`);

        let fixedCount = 0;
        let errorCount = 0;

        for (const order of orders) {
            try {
                let actualPrice = 0;
                let itemName = 'Unknown';

                // Ambil harga dari database berdasarkan itemType dan itemId
                if (order.itemType === 'item' && order.itemId) {
                    const item = await db.Item.findByPk(order.itemId);
                    if (item) {
                        actualPrice = parseFloat(item.price || item.harga);
                        itemName = item.name || item.nama;
                        console.log(`Found item: ${itemName}, price: ${actualPrice}`);
                    } else {
                        console.log(`Item not found with ID: ${order.itemId}`);
                        continue;
                    }
                } else if (order.itemType === 'service' && order.itemId) {
                    const service = await db.Service.findByPk(order.itemId);
                    if (service) {
                        actualPrice = parseFloat(service.price);
                        itemName = service.name;
                        console.log(`Found service: ${itemName}, price: ${actualPrice}`);
                    } else {
                        console.log(`Service not found with ID: ${order.itemId}`);
                        continue;
                    }
                } else {
                    console.log(`Order ${order.id} has no valid itemId or itemType`);
                    continue;
                }

                // Hitung total amount yang benar
                const correctTotalAmount = actualPrice * order.quantity;
                const oldTotalAmount = order.totalAmount;

                // Update total amount jika berbeda
                if (Math.abs(correctTotalAmount - oldTotalAmount) > 0.01) {
                    await order.update({ totalAmount: correctTotalAmount });
                    console.log(`Fixed order ${order.id}: ${itemName} - Old: ${oldTotalAmount}, New: ${correctTotalAmount}`);
                    fixedCount++;
                } else {
                    console.log(`Order ${order.id}: ${itemName} - Total amount already correct: ${oldTotalAmount}`);
                }

            } catch (error) {
                console.error(`Error fixing order ${order.id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n=== FIX SUMMARY ===');
        console.log(`Total orders processed: ${orders.length}`);
        console.log(`Orders fixed: ${fixedCount}`);
        console.log(`Errors: ${errorCount}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

// Jalankan script
fixTotalAmount(); 