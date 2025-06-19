'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Items', [
      // Elektronik
      {
        category: 'Elektronik',
        name: 'Laptop Dell Inspiron',
        description: 'Laptop Dell Inspiron 15 inch, Intel i5, 8GB RAM, 256GB SSD. Cocok untuk presentasi dan kerja kantor.',
        status: 'available',
        price: 50000.00,
        quantity: 5,
        photo: 'laptop-dell.jpg',
        location: 'Gudang A',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Elektronik',
        name: 'Proyektor Epson',
        description: 'Proyektor Epson 3000 lumens, resolusi HD. Ideal untuk presentasi dan seminar.',
        status: 'available',
        price: 75000.00,
        quantity: 3,
        photo: 'proyektor-epson.jpg',
        location: 'Gudang A',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Elektronik',
        name: 'Speaker Bluetooth JBL',
        description: 'Speaker portable JBL dengan koneksi Bluetooth. Suara jernih untuk acara outdoor.',
        status: 'available',
        price: 25000.00,
        quantity: 8,
        photo: 'speaker-jbl.jpg',
        location: 'Gudang B',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Elektronik',
        name: 'Kamera DSLR Canon',
        description: 'Kamera DSLR Canon EOS 2000D dengan lensa 18-55mm. Untuk dokumentasi acara.',
        status: 'available',
        price: 100000.00,
        quantity: 2,
        photo: 'kamera-canon.jpg',
        location: 'Gudang A',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Peralatan Kantor
      {
        category: 'Peralatan Kantor',
        name: 'Papan Tulis Putih',
        description: 'Papan tulis putih ukuran 120x90cm dengan stand. Untuk presentasi dan meeting.',
        status: 'available',
        price: 15000.00,
        quantity: 10,
        photo: 'papan-tulis.jpg',
        location: 'Gudang C',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Peralatan Kantor',
        name: 'Flipchart Stand',
        description: 'Stand flipchart dengan kertas flipchart. Untuk brainstorming dan presentasi.',
        status: 'available',
        price: 20000.00,
        quantity: 6,
        photo: 'flipchart.jpg',
        location: 'Gudang C',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Peralatan Kantor',
        name: 'Printer HP LaserJet',
        description: 'Printer laser HP untuk cetak dokumen berkualitas tinggi.',
        status: 'available',
        price: 35000.00,
        quantity: 4,
        photo: 'printer-hp.jpg',
        location: 'Gudang A',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Peralatan Olahraga
      {
        category: 'Peralatan Olahraga',
        name: 'Bola Basket',
        description: 'Bola basket ukuran standar untuk latihan dan pertandingan.',
        status: 'available',
        price: 5000.00,
        quantity: 15,
        photo: 'bola-basket.jpg',
        location: 'Gudang D',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Peralatan Olahraga',
        name: 'Bola Voli',
        description: 'Bola voli ukuran standar untuk latihan dan pertandingan.',
        status: 'available',
        price: 4000.00,
        quantity: 12,
        photo: 'bola-voli.jpg',
        location: 'Gudang D',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Peralatan Olahraga',
        name: 'Net Badminton',
        description: 'Net badminton dengan tiang standar untuk latihan.',
        status: 'available',
        price: 8000.00,
        quantity: 8,
        photo: 'net-badminton.jpg',
        location: 'Gudang D',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Peralatan Laboratorium
      {
        category: 'Laboratorium',
        name: 'Mikroskop Digital',
        description: 'Mikroskop digital dengan kamera untuk praktikum biologi.',
        status: 'available',
        price: 120000.00,
        quantity: 3,
        photo: 'mikroskop.jpg',
        location: 'Lab Biologi',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Laboratorium',
        name: 'Multimeter Digital',
        description: 'Multimeter digital untuk praktikum elektronika dan fisika.',
        status: 'available',
        price: 15000.00,
        quantity: 10,
        photo: 'multimeter.jpg',
        location: 'Lab Fisika',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Peralatan Audio Visual
      {
        category: 'Audio Visual',
        name: 'Microphone Wireless',
        description: 'Microphone wireless untuk presentasi dan acara.',
        status: 'available',
        price: 30000.00,
        quantity: 6,
        photo: 'microphone.jpg',
        location: 'Gudang B',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Audio Visual',
        name: 'Tripod Kamera',
        description: 'Tripod kamera dengan tinggi adjustable untuk fotografi.',
        status: 'available',
        price: 12000.00,
        quantity: 5,
        photo: 'tripod.jpg',
        location: 'Gudang B',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Items in maintenance
      {
        category: 'Elektronik',
        name: 'Laptop HP Pavilion',
        description: 'Laptop HP Pavilion dalam perbaikan. Keyboard perlu diganti.',
        status: 'maintenance',
        price: 45000.00,
        quantity: 1,
        photo: 'laptop-hp.jpg',
        location: 'Bengkel',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        category: 'Peralatan Kantor',
        name: 'Scanner Canon',
        description: 'Scanner Canon dengan masalah koneksi USB.',
        status: 'maintenance',
        price: 25000.00,
        quantity: 1,
        photo: 'scanner-canon.jpg',
        location: 'Bengkel',
        type: 'tool',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Items', null, {});
  }
}; 