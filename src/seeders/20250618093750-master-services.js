'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Services', [
      // Layanan Fotografi
      {
        name: 'Fotografi Acara',
        description: 'Layanan fotografi untuk acara kampus, seminar, workshop, dan kegiatan lainnya. Termasuk editing dan hasil digital.',
        photo: 'fotografi-acara.jpg',
        status: 'available',
        category: 'Fotografi',
        price: 150000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Videografi Dokumentasi',
        description: 'Layanan pembuatan video dokumentasi acara dengan editing profesional. Termasuk highlight video.',
        photo: 'videografi.jpg',
        status: 'available',
        category: 'Fotografi',
        price: 250000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Layanan Desain
      {
        name: 'Desain Banner & Spanduk',
        description: 'Layanan desain grafis untuk banner, spanduk, dan media promosi acara kampus.',
        photo: 'desain-banner.jpg',
        status: 'available',
        category: 'Desain Grafis',
        price: 50000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Desain Logo & Branding',
        description: 'Layanan desain logo dan identitas visual untuk organisasi atau acara kampus.',
        photo: 'desain-logo.jpg',
        status: 'available',
        category: 'Desain Grafis',
        price: 100000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Layanan Teknologi
      {
        name: 'Setup Audio Visual',
        description: 'Layanan setup dan pengaturan peralatan audio visual untuk seminar, presentasi, dan acara.',
        photo: 'setup-av.jpg',
        status: 'available',
        category: 'Teknologi',
        price: 75000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Live Streaming',
        description: 'Layanan live streaming untuk acara kampus dengan kualitas HD dan multi-platform.',
        photo: 'live-streaming.jpg',
        status: 'available',
        category: 'Teknologi',
        price: 200000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Layanan Konsultasi
      {
        name: 'Konsultasi IT',
        description: 'Layanan konsultasi teknologi informasi untuk pengembangan sistem dan website.',
        photo: 'konsultasi-it.jpg',
        status: 'available',
        category: 'Konsultasi',
        price: 100000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Konsultasi Desain',
        description: 'Layanan konsultasi desain grafis dan visual untuk proyek kampus.',
        photo: 'konsultasi-desain.jpg',
        status: 'available',
        category: 'Konsultasi',
        price: 80000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Layanan Maintenance
      {
        name: 'Maintenance Komputer',
        description: 'Layanan perbaikan dan maintenance komputer, laptop, dan perangkat IT.',
        photo: 'maintenance-pc.jpg',
        status: 'available',
        category: 'Maintenance',
        price: 50000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Maintenance Printer',
        description: 'Layanan perbaikan dan maintenance printer, scanner, dan perangkat kantor.',
        photo: 'maintenance-printer.jpg',
        status: 'available',
        category: 'Maintenance',
        price: 40000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Service unavailable
      {
        name: 'Drone Photography',
        description: 'Layanan fotografi menggunakan drone untuk acara outdoor dan dokumentasi kampus.',
        photo: 'drone-photo.jpg',
        status: 'unavailable',
        category: 'Fotografi',
        price: 300000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Services', null, {});
  }
}; 