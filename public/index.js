const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:'); // Geçici hafıza, istersen dosya açabilirsin

// Orta katmanlar
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'gizli-kod',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('public')); // public klasörü aktif

// Veritabanı tablosu
db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT
)`);

// Ana sayfa
app.get('/', (req, res) => {
    if(req.session.userId){
        db.get('SELECT username FROM users WHERE id = ?', [req.session.userId], (err, row) => {
            if(row){
                res.send(`<h1>Hoşgeldin, ${row.username}!</h1><a href="/logout">Çıkış Yap</a>`);
            } else {
                res.send('<h1>Ana Sayfa</h1><a href="/register">Kayıt Ol</a> | <a href="/login">Giriş Yap</a>');
            }
        });
    } else {
        res.send('<h1>Ana Sayfa</h1><a href="/register">Kayıt Ol</a> | <a href="/login">Giriş Yap</a>');
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Kayıt sayfası
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

// Kayıt işlemi
app.post('/register', async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    if(password !== confirm_password){
        return res.send('Şifreler uyuşmuyor! <a href="/register">Geri dön</a>');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function(err) {
            if (err) {
                return res.send('Hata: Kullanıcı zaten kayıtlı olabilir. <a href="/register">Geri dön</a>');
            }
            res.send('Kayıt başarılı! <a href="/login">Giriş Yap</a>');
        }
    );
});

// Giriş sayfası
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Giriş işlemi
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
        if (!row) return res.send('Kullanıcı bulunamadı. <a href="/login">Geri dön</a>');

        const match = await bcrypt.compare(password, row.password);
        if (match) {
            req.session.userId = row.id;
            // ✅ Giriş başarılı → otomatik ana sayfaya yönlendir
            res.redirect('/');
        } else {
            res.send('Şifre yanlış. <a href="/login">Geri dön</a>');
        }
    });
});

// Server başlat
app.listen(3000, () => console.log('Sunucu 3000 portunda çalışıyor'));
