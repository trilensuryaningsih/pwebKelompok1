-- Script SQL untuk membuat denda manual
-- Jalankan di MySQL Workbench atau phpMyAdmin

-- 1. Lihat order yang tersedia
SELECT id, user_id, itemId, startDate, endDate, status FROM Orders;

-- 2. Buat denda untuk order ID 1 (ganti dengan order ID yang valid)
INSERT INTO Fines (
    orderId, 
    amount, 
    reason, 
    status, 
    dueDate, 
    createdAt, 
    updatedAt
) VALUES (
    1,                           -- Order ID (ganti sesuai kebutuhan)
    50000,                       -- Jumlah denda (Rp 50.000)
    'Keterlambatan pengembalian barang',  -- Alasan denda
    'pending',                   -- Status: pending, paid, waived
    NOW(),                       -- Tanggal jatuh tempo
    NOW(),                       -- Created at
    NOW()                        -- Updated at
);

-- 3. Lihat denda yang sudah dibuat
SELECT 
    f.id,
    f.orderId,
    f.amount,
    f.reason,
    f.status,
    f.dueDate,
    f.createdAt,
    o.user_id,
    o.itemId
FROM Fines f
JOIN Orders o ON f.orderId = o.id
ORDER BY f.createdAt DESC;

-- 4. Update status denda (opsional)
-- UPDATE Fines SET status = 'paid' WHERE id = 1; 