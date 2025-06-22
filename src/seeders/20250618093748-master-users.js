'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hash passwords using bcrypt
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('123', 10);
    const pjPassword = await bcrypt.hash('pj123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        name: 'Administrator',
        email: 'admin@umc.com',
        password: adminPassword,
        role: 'admin',
        phone_number: '081234567890',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Penanggung Jawab',
        email: 'pj@umc.com',
        password: pjPassword,
        role: 'pj',
        phone_number: '081234567891',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Farhan Arva Amanta',
        email: 'farhanarvaamanta@gmail.com',
        password: userPassword,
        role: 'user',
        phone_number: '081234567892',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane@umc.com',
        password: userPassword,
        role: 'user',
        phone_number: '081234567893',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Wilson',
        email: 'bob@umc.com',
        password: userPassword,
        role: 'user',
        phone_number: '081234567894',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admin Demo',
        email: 'admin@example.com',
        password: '$2b$10$NonF5ewvVK1hnHOJSmHAqOFsjdp9rDTS9NetJLdIEAVXKKGmo63fm', // admin123
        role: 'admin',
        phone_number: '081234567890',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'PJ Demo',
        email: 'pj@example.com',
        password: '$2b$10$qg0UgoDoQaUdDcaYRxe66.8Tdyqae5yiB1E2XkhhCjTvyJGI0.zB6', // pj123
        role: 'pj',
        phone_number: '081234567891',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 