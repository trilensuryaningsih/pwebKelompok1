# 🎯 Halaman Pesanan & Denda - Admin Panel

## ✅ **FUNGSIONALITAS LENGKAP SUDAH DIPINDAHKAN KE `/admin/pesanan`**

### 📍 **Lokasi Baru**: `/admin/pesanan`

Halaman ini menggabungkan **kedua fungsionalitas** yang diminta:
1. ✅ **Admin mengupdate status denda** - Admin dapat memperbarui status denda dari user
2. ✅ **Admin melihat riwayat denda** - Admin dapat melihat riwayat denda

## 🔧 **IMPLEMENTASI TEKNIS**

### 1. **Controller Baru** (`src/controllers/admin/pesanan.js`)

#### **Fungsi Utama**:
- `showPesananPage()` - Render halaman pesanan dengan data orders dan fines
- `updateFineStatus()` - Update status denda
- `getFineHistory()` - API endpoint untuk riwayat denda

#### **Data yang Ditampilkan**:
- ✅ **Orders**: Semua pesanan dengan detail user
- ✅ **Fines**: Semua denda dengan detail order dan user
- ✅ **Statistics**: Dashboard statistik lengkap
- ✅ **Item/Service Details**: Detail item atau layanan untuk setiap denda

### 2. **View Baru** (`src/views/admin/pesanan.ejs`)

#### **Layout Halaman**:
- ✅ **Header**: Judul "Manajemen Pesanan & Denda"
- ✅ **Statistics Cards**: 5 kartu statistik (Total Pesanan, Menunggu, Aktif, Total Denda, Nilai Denda)
- ✅ **Orders Table**: Tabel lengkap semua pesanan
- ✅ **Fines Table**: Tabel lengkap semua denda dengan update status

#### **Fitur Interface**:
- ✅ **Responsive Design**: Mobile-friendly
- ✅ **Status Badges**: Warna berbeda untuk setiap status
- ✅ **Update Dropdown**: Dropdown untuk update status denda
- ✅ **SweetAlert**: Notifikasi untuk feedback
- ✅ **Links**: Link ke detail order

### 3. **Routes Baru** (`src/routes/admin.js`)

#### **Routes yang Ditambahkan**:
```javascript
// Pesanan page with fine management
router.get('/pesanan', pesananControllers.showPesananPage);

// Fine management routes (moved to pesanan controller)
router.get('/pesanan/fines/history', pesananControllers.getFineHistory);
router.patch('/pesanan/fines/:fineId/status', pesananControllers.updateFineStatus);
```

#### **Legacy Routes** (tetap tersedia untuk backward compatibility):
```javascript
router.get('/fines/history', statusControllers.getFineHistory);
router.get('/fines/history-page', statusControllers.renderFineHistoryPage);
router.patch('/fines/:fineId/status', statusControllers.updateFineStatus);
```

### 4. **Sidebar Update** (`src/views/admin/partials/sidebar.ejs`)

#### **Menu Baru**:
- ✅ **"Pesanan & Denda"** - Link ke `/admin/pesanan`
- ✅ **Active State** - Menu aktif saat di halaman pesanan
- ✅ **Icon** - Icon file-invoice untuk menu pesanan

## 📊 **FITUR HALAMAN PESANAN**

### **Dashboard Statistics**:
1. **Total Pesanan** - Jumlah semua pesanan
2. **Menunggu** - Pesanan dengan status pending
3. **Aktif** - Pesanan dengan status active
4. **Total Denda** - Jumlah semua denda
5. **Nilai Denda** - Total nilai semua denda

### **Tabel Pesanan**:
- ✅ **Order ID** - Link ke detail order
- ✅ **User** - Nama dan email user
- ✅ **Tipe** - Item atau Layanan
- ✅ **Jumlah** - Total amount pesanan
- ✅ **Status** - Status pesanan dengan badge warna
- ✅ **Tanggal** - Tanggal pembuatan pesanan

### **Tabel Denda**:
- ✅ **Order ID** - Link ke detail order
- ✅ **User** - Nama dan email user
- ✅ **Item/Layanan** - Detail item atau layanan
- ✅ **Jumlah** - Jumlah denda
- ✅ **Alasan** - Alasan denda
- ✅ **Status** - Status denda dengan badge warna
- ✅ **Tanggal Dibuat** - Tanggal pembuatan denda
- ✅ **Aksi** - Dropdown update status + tombol update

## 🎯 **FUNGSIONALITAS UPDATE STATUS DENDA**

### **Status yang Dapat Diupdate**:
- `pending` → Menunggu
- `paid` → Dibayar
- `waived` → Dibebaskan

### **Proses Update**:
1. Admin pilih status dari dropdown
2. Klik tombol "Update"
3. API call ke `/admin/pesanan/fines/:fineId/status`
4. SweetAlert notifikasi sukses/error
5. Halaman refresh untuk data terbaru

### **JavaScript Function**:
```javascript
async function updateFineStatus(fineId) {
  const status = document.getElementById(`status-${fineId}`).value;
  
  try {
    const res = await fetch(`/admin/pesanan/fines/${fineId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    const result = await res.json();
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Status denda berhasil diperbarui',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: result.message || 'Gagal update status denda'
      });
    }
  } catch (error) {
    console.error('Error updating fine status:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Terjadi kesalahan saat update status'
    });
  }
}
```

## 🧪 **TESTING**

### **Test Script** (`test-pesanan-functionality.js`):
- ✅ Count orders and fines
- ✅ Retrieve order data with user details
- ✅ Retrieve fine data with order and user details
- ✅ Calculate statistics
- ✅ Test fine status update
- ✅ Verify database relationships

### **Cara Test**:
```bash
node test-pesanan-functionality.js
```

## 🔄 **MIGRASI DARI HALAMAN SEBELUMNYA**

### **Yang Berubah**:
- ✅ **Lokasi**: Dari `/admin/status` dan `/admin/fines/history-page` → `/admin/pesanan`
- ✅ **Controller**: Dari `statusControllers` → `pesananControllers`
- ✅ **View**: Dari `status.ejs` dan `riwayat-denda.ejs` → `pesanan.ejs`
- ✅ **Routes**: Routes baru untuk pesanan page

### **Yang Tetap Sama**:
- ✅ **Database**: Model dan relationships tidak berubah
- ✅ **API Endpoints**: Legacy routes tetap tersedia
- ✅ **Functionality**: Semua fitur tetap sama, hanya lokasi yang berubah

## 🎉 **KEUNTUNGAN HALAMAN BARU**

### **1. Konsolidasi Data**:
- Semua data pesanan dan denda dalam satu halaman
- Tidak perlu pindah antar halaman
- Dashboard statistik yang lengkap

### **2. User Experience**:
- Interface yang lebih clean dan terorganisir
- Update status denda langsung dari tabel
- Notifikasi yang konsisten

### **3. Maintenance**:
- Code yang lebih terorganisir
- Controller yang dedicated untuk pesanan
- Testing yang lebih mudah

## 📋 **CARA MENGGUNAKAN**

### **1. Akses Halaman**:
- Login sebagai admin
- Klik "Pesanan & Denda" di sidebar
- Atau akses langsung: `/admin/pesanan`

### **2. Lihat Data**:
- Dashboard statistik di bagian atas
- Tabel pesanan di bagian tengah
- Tabel denda di bagian bawah

### **3. Update Status Denda**:
- Pilih status dari dropdown di kolom "Aksi"
- Klik tombol "Update"
- Tunggu notifikasi sukses

### **4. Navigasi**:
- Klik Order ID untuk lihat detail order
- Gunakan sidebar untuk navigasi ke halaman lain

## 🎯 **STATUS**: 🟢 **READY TO USE**

**Halaman pesanan sudah siap dengan kedua fungsionalitas**:
1. ✅ **Admin mengupdate status denda** - Implementasi lengkap
2. ✅ **Admin melihat riwayat denda** - Tabel lengkap dengan statistik

**Lokasi**: `/admin/pesanan` - Semua fitur sudah dipindahkan dan berfungsi! 🎉 