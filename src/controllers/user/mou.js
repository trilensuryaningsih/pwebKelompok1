const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { Order, Item, Service } = require('../../models');

exports.form = (req, res) => {
    res.render('user/mou', { user: req.session.user });
};

exports.submit = async (req, res) => {
    console.log('=== MOU SUBMIT START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Session user:', req.session.user);
    console.log('Content-Type:', req.get('Content-Type'));
    
    req.session.mouData = req.body;
    try {
        // Ambil data pesanan dari body request
        const { orderData } = req.body;
        console.log('Order data extracted:', orderData);
        
        // Validasi user session
        if (!req.session.user || !req.session.user.id) {
            console.error('User session not found');
            return res.status(401).json({ success: false, message: 'User session tidak ditemukan' });
        }
        
        // Generate PDF file name
        const pdfFileName = `MOU_${req.session.user.id}_${Date.now()}.pdf`;
        const pdfFilePath = path.join(__dirname, '../../public/uploads', pdfFileName);
        
        // Create PDF file
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(pdfFilePath);
        doc.pipe(writeStream);
        
        // Generate PDF content
        this.generatePdfContent(doc, req.body);
        
        // Wait for PDF to be written
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
            doc.end();
        });
        
        console.log('PDF generated successfully:', pdfFileName);
        
        // Jika ada data pesanan, buat order untuk setiap item
        if (orderData && orderData.pesanan && Array.isArray(orderData.pesanan)) {
            console.log('Processing multiple orders:', orderData.pesanan.length);
            
            for (const pesanan of orderData.pesanan) {
                // Pastikan data yang diperlukan ada
                if (!pesanan.id || !pesanan.quantity) {
                    console.error('Invalid pesanan data:', pesanan);
                    continue;
                }
                
                // Konversi ke tipe data yang benar
                const itemId = parseInt(pesanan.id);
                const quantity = parseInt(pesanan.quantity);
                
                // Ambil harga dari database berdasarkan itemId dan tipe
                let actualPrice = 0;
                let itemName = pesanan.name;
                
                if (pesanan.type === 'tool') {
                    const item = await Item.findByPk(itemId);
                    if (item) {
                        actualPrice = parseFloat(item.price || item.harga);
                        itemName = item.name || item.nama;
                        console.log(`Found item in database: ${itemName}, price: ${actualPrice}`);
                    } else {
                        console.error('Item not found with ID:', itemId);
                        continue;
                    }
                } else if (pesanan.type === 'service') {
                    const service = await Service.findByPk(itemId);
                    if (service) {
                        actualPrice = parseFloat(service.price);
                        itemName = service.name;
                        console.log(`Found service in database: ${itemName}, price: ${actualPrice}`);
                    } else {
                        console.error('Service not found with ID:', itemId);
                        continue;
                    }
                }
                
                // Hitung total amount berdasarkan harga dari database
                const totalAmount = actualPrice * quantity;
                
                console.log(`Calculating total for ${itemName}: price=${actualPrice}, quantity=${quantity}, total=${totalAmount}`);
                
                // Persiapkan data order untuk setiap item
                const orderPayload = {
                    user_id: req.session.user.id,
                    itemType: pesanan.type === 'tool' ? 'item' : 'service',
                    itemId: itemId,
                    quantity: quantity,
                    startDate: orderData.startDate || null,
                    endDate: orderData.endDate || null,
                    status: 'pending',
                    notes: orderData.notes || '', // Simpan catatan pemesanan
                    totalAmount: totalAmount,
                    mouFile: `/uploads/${pdfFileName}` // Simpan path PDF
                };
                
                console.log('Creating order for item:', itemName, orderPayload);
                
                // Buat order baru
                const order = await Order.create(orderPayload);
                console.log('Order created successfully with ID:', order.id, 'Total Amount:', order.totalAmount);

                // Kurangi stok berdasarkan tipe item
                if (pesanan.type === 'tool') {
                    console.log('Processing stock reduction for tool:', pesanan.id);
                    const item = await Item.findByPk(pesanan.id);
                    if (item) {
                        console.log('Current stock:', item.quantity, 'Requested:', pesanan.quantity);
                        const newQuantity = item.quantity - parseInt(pesanan.quantity);
                        if (newQuantity >= 0) {
                            await item.update({ quantity: newQuantity });
                            console.log('Tool stock updated successfully to:', newQuantity);
                        } else {
                            // Jika stok tidak cukup, hapus order yang baru dibuat
                            await order.destroy();
                            console.log('Insufficient tool stock, order deleted');
                            return res.status(400).json({ 
                                success: false, 
                                message: `Stok tidak mencukupi untuk ${itemName}` 
                            });
                        }
                    } else {
                        console.log('Item not found with ID:', pesanan.id);
                    }
                } else if (pesanan.type === 'service') {
                    console.log('Processing stock reduction for service:', pesanan.id);
                    const service = await Service.findByPk(pesanan.id);
                    if (service) {
                        console.log('Current service stock:', service.quantity, 'Requested:', pesanan.quantity);
                        const newQuantity = service.quantity - parseInt(pesanan.quantity);
                        if (newQuantity >= 0) {
                            // Update quantity dan status akan diupdate otomatis oleh hook
                            await service.update({ 
                                quantity: newQuantity
                                // Status akan diupdate otomatis oleh hook di model
                            });
                            console.log('Service stock updated successfully to:', newQuantity);
                        } else {
                            // Jika stok tidak cukup, hapus order yang baru dibuat
                            await order.destroy();
                            console.log('Insufficient service stock, order deleted');
                            return res.status(400).json({ 
                                success: false, 
                                message: `Stok jasa tidak mencukupi untuk ${itemName}` 
                            });
                        }
                    } else {
                        console.log('Service not found with ID:', pesanan.id);
                    }
                }
            }
        } else {
            console.log('No orderData or empty pesanan array, creating default order');
            // Buat order default jika tidak ada data pesanan
            const orderPayload = {
                user_id: req.session.user.id,
                itemType: 'item',
                itemId: null,
                quantity: 1,
                startDate: null,
                endDate: null,
                status: 'pending',
                notes: orderData?.notes || '', // Simpan catatan pemesanan
                totalAmount: 0,
                mouFile: `/uploads/${pdfFileName}` // Simpan path PDF
            };
            
            await Order.create(orderPayload);
        }

        console.log('=== MOU SUBMIT SUCCESS ===');
        res.status(200).json({ success: true, pdfFile: `/uploads/${pdfFileName}` });
    } catch (e) {
        console.error('=== MOU SUBMIT ERROR ===');
        console.error('Error message:', e.message);
        console.error('Error stack:', e.stack);
        console.error('Error name:', e.name);
        
        // Berikan pesan error yang lebih spesifik
        let errorMessage = 'Gagal simpan ke database';
        if (e.name === 'SequelizeValidationError') {
            errorMessage = 'Data tidak valid: ' + e.errors.map(err => err.message).join(', ');
        } else if (e.name === 'SequelizeDatabaseError') {
            errorMessage = 'Error database: ' + e.message;
        } else if (e.name === 'SequelizeConnectionError') {
            errorMessage = 'Koneksi database error: ' + e.message;
        }
        
        res.status(500).json({ success: false, message: errorMessage });
    }
};

// Helper function to generate PDF content
exports.generatePdfContent = (doc, mouData) => {
    // Path logo
    const logoUnandPath = path.join(__dirname, '../../public/images/logo_unand.png');
    const logoUmcPath = path.join(__dirname, '../../public/images/logo_umc.png');
    const toniSignaturePath = path.join(__dirname, '../../public/images/Toni.jpg');

    // Kop header
    const kopY = 50;
    const kopHeight = 60;
    try {
        doc.image(logoUnandPath, 50, kopY, { width: 60, height: kopHeight, align: 'left' });
    } catch (e) {}
    try {
        doc.image(logoUmcPath, 500, kopY, { width: 60, height: kopHeight, align: 'right' });
    } catch (e) {}
    const kopTextX = 140;
    doc.font('Times-Roman').fontSize(18).text('TIM CREATIVE KEMAHASISWAAN', kopTextX, kopY, { align: 'left' });
    doc.font('Times-Roman').fontSize(18).text('UNIVERSAL MULTIMEDIA CREATIVE (UMC)', kopTextX, doc.y, { align: 'left' });
    doc.font('Times-Roman').fontSize(18).text('UNIVERSITAS ANDALAS', kopTextX, doc.y, { align: 'left' });
    doc.font('Times-Roman').fontSize(12).text('Gedung PKM, Kampus Limau manis, Padang – 25163', kopTextX, doc.y, { align: 'left' });
    doc.moveTo(50, kopY + kopHeight + 20).lineTo(545, kopY + kopHeight + 20).stroke();
    doc.moveDown(2);

    // Helper untuk baris baru
    const addSpace = (lines = 1) => {
        for (let i = 0; i < lines; i++) doc.moveDown();
    };

    // Mulai isi dokumen setelah kop, beri margin kiri/kanan/bawah
    const contentMarginLeft = 60;
    const contentWidth = 545 - contentMarginLeft - (595-545) - 10;
    doc.moveDown(2);
    doc.x = contentMarginLeft;
    doc.fontSize(14).font('Times-Bold').text('SURAT PERJANJIAN KERJASAMA', contentMarginLeft, doc.y, { width: contentWidth, align: 'center' });
    doc.fontSize(12).font('Times-Roman').text('Memorandum of Understanding', contentMarginLeft, doc.y, { width: contentWidth, align: 'center' });
    addSpace(2);
    doc.fontSize(11).font('Times-Roman').text(
        `Pada tanggal ${mouData.tanggal || '-'} bulan ${mouData.bulan || '-'} tahun ${mouData.tahun || '-'}, kami yang bertanda tangan di bawah ini:`,
        contentMarginLeft, doc.y, { width: contentWidth, align: 'left' }
    );
    addSpace();
    doc.font('Times-Bold').text('Pihak I');
    doc.font('Times-Roman').text('Nama: Toni Windra');
    doc.text('Instansi: Universal Multimedia Creative');
    doc.text('Jabatan: CEO');
    doc.text('Kontak: 085174461775');
    addSpace();
    doc.font('Times-Bold').text('Pihak II');
    doc.font('Times-Roman').text(`Nama: ${mouData.nama2 || '-'}`);
    doc.text(`Instansi: ${mouData.instansi2 || '-'}`);
    doc.text(`Jabatan: ${mouData.jabatan2 || '-'}`);
    doc.text(`Kontak: ${mouData.kontak2 || '-'}`);
    addSpace();
    doc.font('Times-Bold').text('Nama Kegiatan:', { continued: true }).font('Times-Roman').text(` ${mouData.namaKegiatan || '-'}`);
    doc.font('Times-Bold').text('Hari/Tanggal:', { continued: true }).font('Times-Roman').text(` ${mouData.hariTanggal || '-'}`);
    doc.font('Times-Bold').text('Tempat:', { continued: true }).font('Times-Roman').text(` ${mouData.tempat || '-'}`);
    addSpace();
    doc.font('Times-Bold').text('Tanggal Penandatanganan:', { continued: true }).font('Times-Roman').text(` ${mouData.tanggalPenandatanganan || '-'}`);
    addSpace(2);
    doc.font('Times-Bold').text('Pasal 1');
    doc.font('Times-Bold').text('NAMA DAN WAKTU PELAKSANAAN');
    doc.font('Times-Roman').text('Pihak I dan Pihak II telah sepakat kerja sama dalam kegiatan yang telah disebutkan di atas.');
    addSpace();
    doc.font('Times-Bold').text('Pasal 2');
    doc.font('Times-Bold').text('PERATURAN KERJA SAMA');
    doc.font('Times-Roman').text('PENYEDIAAN BARANG DAN JASA');
    doc.list([
        'Barang yang dipinjamkan oleh Pihak I meliputi, perlengkapan yang diperlukan untuk kegiatan fotografi atau videografi.',
        'Jasa yang disediakan oleh Pihak I meliputi, tim produksi visual sesuai kebutuhan Pihak II.',
        'Pihak II wajib memberikan informasi yang jelas mengenai spesifikasi dan jumlah barang yang diperlukan serta jadwal penggunaan jasa fotografi atau videografi.',
        'Pihak II bertanggung jawab atas keamanan barang yang dipinjamkan selama masa peminjaman dan akan mengganti barang yang rusak atau hilang sesuai kesepakatan harga.',
        'Pihak I akan menyediakan barang dan jasa sesuai dengan spesifikasi yang telah disepakati dan dalam kondisi yang baik pada waktu peminjaman.',
        'Pihak II bertanggung jawab untuk menggunakan barang dan jasa sesuai dengan ketentuan yang telah disepakati dan tidak melakukan tindakan yang merusak atau mengubah barang tersebut tanpa izin dari Pihak I.',
        'Pembayaran sewa barang dan jasa akan dilakukan oleh Pihak II sesuai dengan tarif yang telah disepakati sebelum kegiatan dimulai.',
        'Pihak II wajib menyerahkan bukti pemesanan atau pembayaran setelah menerima barang atau menggunakan jasa untuk keperluan administrasi Pihak I.'
    ]);
    addSpace();
    doc.font('Times-Bold').text('Pasal 3');
    doc.font('Times-Bold').text('PENYELESAIAN PERSELISIHAN');
    doc.font('Times-Roman').text('Apabila terjadi suatu perselisihan antara Pihak I dan Pihak II sehubungan dengan pelaksanaan perjanjian kerjasama ini akan diselesaikan secara musyawarah mufakat oleh kedua belah pihak.');
    addSpace();
    doc.font('Times-Bold').text('Pasal 4');
    doc.font('Times-Bold').text('HAK CIPTA DAN PENGGUNAAN KONTEN');
    doc.font('Times-Roman').text('Semua hasil rekaman dan dokumentasi yang dihasilkan selama kegiatan, termasuk foto dan video, dapat digunakan oleh kedua belah pihak untuk keperluan promosi, dokumentasi, dan publikasi dengan tetap mencantumkan kredit kepada masing-masing pihak sesuai kontribusi.');
    addSpace();
    doc.font('Times-Bold').text('Pasal 5');
    doc.font('Times-Bold').text('KETENTUAN LAIN');
    doc.font('Times-Roman').text('Hal-hal lain yang berkenaan dengan perjanjian ini dan hal-hal lain yang belum diatur pada perjanjian ini akan dimusyawarahkan kedua belah pihak.');
    addSpace(2);
    doc.font('Times-Roman').text('Dengan ini Surat Perjanjian Kerjasama ini dibuat serta ditandatangani oleh kedua belah pihak.');
    addSpace(2);
    doc.text(`Padang, ${mouData.tanggalPenandatanganan || '-'}`);
    addSpace(2);
    doc.text('Pihak I,', { continued: true, width: 200 });
    doc.text('Pihak II,', { align: 'right' });
    addSpace(3);
    
    // Add Toni's signature image
    try {
        doc.image(toniSignaturePath, 60, doc.y, { width: 60, height: 40 });
    } catch (e) {
        // If image fails to load, draw a line instead
        doc.moveTo(60, doc.y).lineTo(120, doc.y).stroke();
    }
    
    // Add Pihak II signature if available
    if (mouData.ttdPihak2) {
        try {
            // For base64 images, we need to handle them differently
            // This is a simplified approach - in a real implementation you might want to decode base64
            doc.moveTo(400, doc.y).lineTo(460, doc.y).stroke();
        } catch (e) {
            doc.moveTo(400, doc.y).lineTo(460, doc.y).stroke();
        }
    } else {
        doc.moveTo(400, doc.y).lineTo(460, doc.y).stroke();
    }
    
    addSpace(2);
    doc.text('Toni Windra', { continued: true, width: 200 });
    doc.text(mouData.nama3 || '-', { align: 'right' });
    doc.text('NIM.2111517002', { continued: true, width: 200 });
    doc.text(`NIM.${mouData.nim || '-'}`, { align: 'right' });
};

exports.cetak = (req, res) => {
    const mouData = req.session.mouData || {};
    res.render('user/cetak-mou', { user: req.session.user, mouData });
};

exports.downloadPdf = (req, res) => {
    const mouData = req.session.mouData || {};
    const doc = new PDFDocument({ margin: 50 });
    let filename = `MOU_${(mouData.nama2 || 'user').replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    // Generate PDF content
    this.generatePdfContent(doc, mouData);
    doc.pipe(res);
    doc.end();
};