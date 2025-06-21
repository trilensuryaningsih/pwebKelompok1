'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update status service berdasarkan quantity yang sudah ada
    await queryInterface.sequelize.query(`
      UPDATE Services 
      SET status = CASE 
        WHEN quantity = 0 THEN 'unavailable'
        WHEN quantity >= 1 THEN 'available'
        ELSE status
      END
      WHERE status IN ('available', 'unavailable')
    `);
  },

  async down(queryInterface, Sequelize) {
    // Tidak ada rollback yang diperlukan untuk migration ini
    console.log('Migration update-service-status-based-quantity has no rollback');
  }
}; 