
const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware untuk membaca JSON
app.use(express.json());

// Menampilkan halaman website dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// =====================================
// 1. POST /api/readings
// Menerima dan menyimpan data sensor
// =====================================

app.post('/api/readings', (req, res) => {
    const { device_id, suhu, kelembapan } = req.body;

    // Validasi data
    if (
        typeof suhu !== 'number' ||
        !Number.isFinite(suhu) ||
        typeof kelembapan !== 'number' ||
        !Number.isFinite(kelembapan)
    ) {
        return res.status(400).json({
            error: 'Suhu dan kelembapan harus berupa angka.'
        });
    }

    if (suhu < -40 || suhu > 80) {
        return res.status(400).json({
            error: 'Suhu harus berada antara -40 sampai 80 derajat Celsius.'
        });
    }

    if (kelembapan < 0 || kelembapan > 100) {
        return res.status(400).json({
            error: 'Kelembapan harus berada antara 0 sampai 100 persen.'
        });
    }

    if (typeof device_id !== 'string' || !device_id.trim()) {
        return res.status(400).json({
            error: 'Device ID harus diisi.'
        });
    }

    // Simpan data ke database
    const result = db.prepare(`
        INSERT INTO readings (device_id, suhu, kelembapan)
        VALUES (?, ?, ?)
    `).run(device_id.trim(), suhu, kelembapan);

    // Ambil data yang baru disimpan
    const savedData = db.prepare(`
        SELECT * FROM readings WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({
        message: 'Data sensor berhasil disimpan.',
        data: savedData
    });
});

// =====================================
// 2. GET /api/readings/latest
// Mengambil data sensor terbaru
// =====================================

app.get('/api/readings/latest', (req, res) => {
    const data = db.prepare(`
        SELECT * FROM readings
        ORDER BY id DESC
        LIMIT 1
    `).get();

    res.status(200).json(data || null);
});

// =====================================
// 3. GET /api/readings?limit=20
// Mengambil riwayat data sensor
// =====================================

app.get('/api/readings', (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 20;

    if (limit < 1 || limit > 1000) {
        return res.status(400).json({
            error: 'Limit harus antara 1 sampai 1000.'
        });
    }

    const data = db.prepare(`
        SELECT * FROM readings
        ORDER BY id DESC
        LIMIT ?
    `).all(limit);

    res.status(200).json(data);
});

// =====================================
// 4. GET /api/stats
// Mengambil statistik sensor
// =====================================

app.get('/api/stats', (req, res) => {
    const stats = db.prepare(`
        SELECT
            AVG(suhu) AS rata_rata_suhu,
            MIN(suhu) AS minimum_suhu,
            MAX(suhu) AS maksimum_suhu,
            AVG(kelembapan) AS rata_rata_kelembapan,
            MIN(kelembapan) AS minimum_kelembapan,
            MAX(kelembapan) AS maksimum_kelembapan
        FROM readings
    `).get();

    res.status(200).json(stats);
});

// =====================================
// Menjalankan server
// =====================================

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
