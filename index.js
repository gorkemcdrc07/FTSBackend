const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// SQL Server bağlantı ayarları
const dbConfig = {
  user: 'sa',
  password: 'pv0L6dB',
  server: '10.110.50.166',
  database: 'FiloTakip',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// Tüm kullanıcıları çeken GET endpoint
app.get('/api/giris', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query(`
      SELECT TOP (1000) [ID], [KullaniciAdi], [Sifre], [Rol], [AdSoyad]
      FROM [FiloTakip].[dbo].[TblGiris]
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL Hatası:', err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Kullanıcı adı ve şifre ile giriş doğrulayan POST endpoint
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
    console.error('SQL Hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ana test endpoint
app.get('/', (req, res) => {
  res.send('FTS Backend çalışıyor 🚛');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
