const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // HTML, CSS, JS dosyaların burda olacak

// Veritabanı bağlantısı
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) console.error(err.message);
  console.log("SQLite veritabanına bağlanıldı.");
});

// Kullanıcı tablosu oluştur
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

// Kayıt olma
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, password],
    function (err) {
      if (err) {
        return res.send("Bu kullanıcı adı zaten alınmış!");
      }
      res.send("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    }
  );
});

// Giriş yapma
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (row) {
        res.sendFile(path.join(__dirname, "public/index.html")); // giriş sonrası sayfa
      } else {
        res.send("Kullanıcı adı veya şifre hatalı!");
      }
    }
  );
});

// Server başlat
app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});
