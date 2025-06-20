const { Item, Service, Repair, User } = require('../../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate comprehensive report
exports.generateReport = async (req, res) => {
  try {
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 30
    });
    
    const fileName = `laporan_pj_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Pipe PDF directly to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('LAPORAN PENANGGUNG JAWAB UMC', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
    doc.moveDown(2);

    try {
      // Get all data with error handling
      const items = await Item.findAll({ order: [['name', 'ASC']] }).catch(() => []);
      const services = await Service.findAll({ order: [['name', 'ASC']] }).catch(() => []);
      const repairs = await Repair.findAll({
        include: [
          { model: Item },
          { model: User, as: 'Requester', attributes: ['name', 'email'] },
          { model: User, as: 'Verifier', attributes: ['name', 'email'] }
        ],
        order: [['requestDate', 'DESC']]
      }).catch(() => []);

      // Statistics
      const totalItems = items.length;
      const totalServices = services.length;
      const totalRepairs = repairs.length;
      const pendingRepairs = repairs.filter(r => r.status === 'approved').length;
      const inProgressRepairs = repairs.filter(r => r.status === 'in_progress').length;
      const completedRepairs = repairs.filter(r => r.status === 'completed').length;
      const rejectedRepairs = repairs.filter(r => r.status === 'rejected').length;

      // Add statistics section
      doc.fontSize(16).text('STATISTIK UMUM', { underline: true });
      doc.moveDown();
      
      // Create statistics table
      const statsData = [
        ['Total Alat', totalItems.toString()],
        ['Total Jasa', totalServices.toString()],
        ['Total Perbaikan', totalRepairs.toString()],
        ['Menunggu Verifikasi', pendingRepairs.toString()],
        ['Sedang Diperbaiki', inProgressRepairs.toString()],
        ['Selesai', completedRepairs.toString()],
        ['Ditolak', rejectedRepairs.toString()]
      ];
      
      drawTable(doc, ['Kategori', 'Jumlah'], statsData, 100);
      doc.moveDown(2);

      // Add items section
      doc.addPage();
      doc.fontSize(16).text('DAFTAR ALAT', { underline: true });
      doc.moveDown();
      
      if (items.length === 0) {
        doc.fontSize(12).text('Tidak ada data alat', { color: 'gray' });
      } else {
        const itemsData = items.map(item => [
          item.name,
          item.category,
          getStatusText(item.status),
          item.quantity.toString(),
          item.location || 'N/A'
        ]);
        
        drawTable(doc, ['Nama Alat', 'Kategori', 'Status', 'Jumlah', 'Lokasi'], itemsData, 100);
      }

      // Add services section
      doc.addPage();
      doc.fontSize(16).text('DAFTAR JASA', { underline: true });
      doc.moveDown();
      
      if (services.length === 0) {
        doc.fontSize(12).text('Tidak ada data jasa', { color: 'gray' });
      } else {
        const servicesData = services.map(service => [
          service.name,
          service.category,
          service.price ? `Rp ${service.price.toLocaleString('id-ID')}` : 'N/A',
          service.description.length > 50 ? service.description.substring(0, 50) + '...' : service.description
        ]);
        
        drawTable(doc, ['Nama Jasa', 'Kategori', 'Harga', 'Deskripsi'], servicesData, 100);
      }

      // Add repairs section
      doc.addPage();
      doc.fontSize(16).text('DAFTAR PERBAIKAN', { underline: true });
      doc.moveDown();
      
      if (repairs.length === 0) {
        doc.fontSize(12).text('Tidak ada data perbaikan', { color: 'gray' });
      } else {
        const repairsData = repairs.map(repair => [
          repair.Item ? repair.Item.name : 'N/A',
          getStatusText(repair.status),
          repair.Requester ? repair.Requester.name : 'N/A',
          repair.requestDate ? repair.requestDate.toLocaleDateString('id-ID') : '-',
          repair.reason.length > 30 ? repair.reason.substring(0, 30) + '...' : repair.reason
        ]);
        
        drawTable(doc, ['Alat', 'Status', 'Pengaju', 'Tanggal', 'Alasan'], repairsData, 100);
      }

      // Add verification summary
      doc.addPage();
      doc.fontSize(16).text('RINGKASAN VERIFIKASI', { underline: true });
      doc.moveDown();
      
      const verificationSummary = {
        'Menunggu Verifikasi': repairs.filter(r => r.status === 'approved'),
        'Sedang Diperbaiki': repairs.filter(r => r.status === 'in_progress'),
        'Selesai': repairs.filter(r => r.status === 'completed'),
        'Ditolak': repairs.filter(r => r.status === 'rejected')
      };

      Object.entries(verificationSummary).forEach(([status, repairList]) => {
        doc.fontSize(14).text(status, { underline: true });
        doc.moveDown(0.5);
        
        if (repairList.length === 0) {
          doc.fontSize(10).text('Tidak ada data', { color: 'gray' });
        } else {
          const summaryData = repairList.map((repair, index) => [
            (index + 1).toString(),
            repair.Item ? repair.Item.name : 'N/A',
            repair.Requester ? repair.Requester.name : 'N/A',
            repair.requestDate ? repair.requestDate.toLocaleDateString('id-ID') : '-'
          ]);
          
          drawTable(doc, ['No', 'Alat', 'Pengaju', 'Tanggal'], summaryData, 80);
        }
        doc.moveDown();
      });

    } catch (dataError) {
      console.error('Error fetching data:', dataError);
      doc.fontSize(16).text('ERROR: Gagal mengambil data', { color: 'red' });
      doc.fontSize(12).text('Silakan coba lagi nanti atau hubungi administrator.');
    }

    // Finalize PDF
    doc.end();

  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).send('Gagal membuat laporan.');
  }
};

// Helper function to draw tables
function drawTable(doc, headers, data, startY) {
  const tableLeft = 30;
  const tableWidth = doc.page.width - 60;
  const colCount = headers.length;
  // Lebar kolom proporsional
  const colWidths = Array(colCount).fill(tableWidth / colCount);
  if (colCount === 5) {
    colWidths[0] = tableWidth * 0.25; // Nama/Alat
    colWidths[1] = tableWidth * 0.20; // Kategori/Status
    colWidths[2] = tableWidth * 0.18; // Status/Pengaju
    colWidths[3] = tableWidth * 0.12; // Jumlah/Tanggal
    colWidths[4] = tableWidth * 0.25; // Lokasi/Alasan/Deskripsi
  }
  // Atur khusus untuk tabel jasa
  if (
    colCount === 4 &&
    headers[0] === 'Nama Jasa' &&
    headers[1] === 'Kategori' &&
    headers[2] === 'Harga' &&
    headers[3] === 'Deskripsi'
  ) {
    colWidths[0] = tableWidth * 0.35; // Nama Jasa
    colWidths[1] = tableWidth * 0.15; // Kategori
    colWidths[2] = tableWidth * 0.15; // Harga
    colWidths[3] = tableWidth * 0.35; // Deskripsi
  } else if (colCount === 4) {
    colWidths[0] = tableWidth * 0.08; // No (lebih sempit)
    colWidths[1] = tableWidth * 0.52; // Alat (jauh lebih lebar)
    colWidths[2] = tableWidth * 0.20; // Pengaju
    colWidths[3] = tableWidth * 0.20; // Tanggal (lebih sempit)
  }
  let y = startY + 10; // Tambah margin atas sebelum tabel agar tidak menimpa judul

  // Helper untuk membungkus teks
  function getLines(text, width, fontSize = 10) {
    const words = String(text).split(' ');
    let lines = [];
    let line = '';
    words.forEach(word => {
      const testLine = line ? line + ' ' + word : word;
      const testWidth = doc.widthOfString(testLine, { size: fontSize });
      if (testWidth > width - 8 && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  // Draw header
  doc.font('Helvetica-Bold').fontSize(11);
  let x = tableLeft;
  let headerHeight = 24;
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], headerHeight).fillAndStroke('#f0f0f0', 'black');
    doc.fillColor('black').text(header, x, y + 7, {
      width: colWidths[i],
      align: 'center',
      continued: false
    });
    x += colWidths[i];
  });
  y += headerHeight;

  doc.font('Helvetica').fontSize(10);
  data.forEach((row, rowIndex) => {
    // Hitung jumlah baris terbanyak di baris ini
    const lineCounts = row.map((cell, colIndex) => getLines(cell, colWidths[colIndex]).length);
    const maxLines = Math.max(...lineCounts);
    const rowHeight = maxLines * 14 + 8;
    // Auto page break jika melebihi halaman
    if (y + rowHeight > doc.page.height - 40) {
      doc.addPage();
      y = 40;
      // Redraw header di halaman baru
      x = tableLeft;
      doc.font('Helvetica-Bold').fontSize(11);
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], headerHeight).fillAndStroke('#f0f0f0', 'black');
        doc.fillColor('black').text(header, x, y + 7, {
          width: colWidths[i],
          align: 'center',
          continued: false
        });
        x += colWidths[i];
      });
      y += headerHeight;
      doc.font('Helvetica').fontSize(10);
    }
    x = tableLeft;
    row.forEach((cell, colIndex) => {
      // Atur alignment: Nama & Lokasi kiri, Jumlah kanan, lain tengah
      let align = 'center';
      if (colCount === 5 && (colIndex === 0 || colIndex === 4)) align = 'left';
      if (colCount === 5 && colIndex === 3) align = 'right';
      if (colCount === 4 && colIndex === 1) align = 'left';
      if (colCount === 4 && colIndex === 0) align = 'center';
      // Draw cell border
      doc.rect(x, y, colWidths[colIndex], rowHeight).stroke();
      // Draw wrapped text, rata tengah vertikal
      const lines = getLines(cell, colWidths[colIndex]);
      const totalLineHeight = lines.length * 14;
      let yText = y + 6 + ((rowHeight - 8 - totalLineHeight) / 2); // tengah vertikal
      lines.forEach((line) => {
        doc.fillColor('black').text(line, x + 4, yText, {
          width: colWidths[colIndex] - 8,
          align
        });
        yText += 14;
      });
      x += colWidths[colIndex];
    });
    y += rowHeight;
  });
  doc.moveDown(2);
}

// Helper functions
function getStatusText(status) {
  const statusMap = {
    'available': 'Tersedia',
    'maintenance': 'Sedang Diperbaiki',
    'damaged': 'Rusak',
    'borrowed': 'Dipinjam',
    'approved': 'Disetujui',
    'in_progress': 'Sedang Diperbaiki',
    'completed': 'Selesai',
    'rejected': 'Ditolak'
  };
  return statusMap[status] || status;
}

function getStatusColor(status) {
  const colorMap = {
    'available': 'green',
    'maintenance': 'orange',
    'damaged': 'red',
    'borrowed': 'blue',
    'approved': 'blue',
    'in_progress': 'orange',
    'completed': 'green',
    'rejected': 'red'
  };
  return colorMap[status] || 'black';
} 