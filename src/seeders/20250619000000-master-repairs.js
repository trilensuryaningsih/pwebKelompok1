'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Repairs', [
      {
        itemId: 1, // Pastikan ID item ini ada di database
        requestedBy: 1, // Pastikan ID user ini ada di database
        verifiedBy: null,
        reason: 'Lensa kamera mengalami goresan dan perlu perbaikan',
        quantity: 1,
        notes: 'Perlu penggantian lensa',
        status: 'pending',
        requestDate: new Date(),
        verificationDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        itemId: 2, // Pastikan ID item ini ada di database
        requestedBy: 1, // Pastikan ID user ini ada di database
        verifiedBy: 1,
        reason: 'Drone tidak bisa terbang dengan stabil',
        quantity: 1,
        notes: 'Perlu kalibrasi sensor',
        status: 'in_progress',
        requestDate: new Date('2024-01-15'),
        verificationDate: new Date('2024-01-16'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        itemId: 3, // Pastikan ID item ini ada di database
        requestedBy: 1, // Pastikan ID user ini ada di database
        verifiedBy: 1,
        reason: 'Tripod kaki ketiga patah',
        quantity: 1,
        notes: 'Perlu penggantian kaki tripod',
        status: 'completed',
        requestDate: new Date('2024-01-10'),
        verificationDate: new Date('2024-01-12'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Repairs', null, {});
  }
}; 