require("dotenv").config(); // 🌟 .env dosyasını localde aktif etmek için

const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// Environment'tan gelen SQL Server bağlantı ayarları
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// GET - Tüm kullanıcıları getir
app.get('/api/giris', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT TOP (1000) [ID], [KullaniciAdi], [Sifre], [Rol], [AdSoyad]
            FROM TblGiris
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL Hatası (GET):', err);
        res.status(500).json({ error: 'Veritabanı hatası', detail: err.message });
    }
});

// POST - Giriş kontrolü
app.post('/api/giris-kontrol', async (req, res) => {
    const { kullaniciAdi, sifre } = req.body;

    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT * FROM TblGiris
            WHERE KullaniciAdi = '${kullaniciAdi}' AND Sifre = '${sifre}'
        `);

        if (result.recordset.length > 0) {
            res.json({
                success: true,
                message: "Giriş başarılı",
                user: result.recordset[0]
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Kullanıcı adı veya şifre hatalı"
            });
        }
    } catch (err) {
        console.error('SQL Hatası (POST):', err);
        res.status(500).json({ error: 'Sunucu hatası', detail: err.message });
    }
});

// Test endpoint
app.get('/', (req, res) => {
    res.send('FTS Backend çalışıyor 🚛');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
