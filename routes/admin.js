import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Basit admin kontrol (demo için)
async function isAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Giriş yapılmamış' });

  try {
    const user = await User.findById(req.session.userId);
    if (!user || !user.isAdmin) return res.status(403).json({ error: 'Yetkisiz erişim' });
    next();
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Tüm kullanıcıları listele
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, _id: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı sil
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Kullanıcı silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Silme sırasında hata' });
  }
});

// Şifre resetleme
router.put('/users/:id/reset-password', isAdmin, async (req, res) => {
  try {
    const newPassword = req.body.password;
    if (!newPassword) return res.status(400).json({ error: 'Yeni şifre gerekli' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.params.id, { password: hashed });
    res.json({ message: 'Şifre resetlendi' });
  } catch (err) {
    res.status(500).json({ error: 'Şifre resetleme hatası' });
  }
});

export default router;
