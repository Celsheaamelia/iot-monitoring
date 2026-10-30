
const Database = require('better-sqlite3');
const path = require('path');

// Membuat atau membuka database SQLite
const db = new Database(
    path.join(__dirname, 'iot_monitoring.db')
);

// Membuat tabel readings
db.exec(`
    CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        suhu REAL NOT NULL,
        kelembapan REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('Database SQLite berhasil dibuat!');
console.log('Tabel readings berhasil disiapkan.');

module.exports = db;
