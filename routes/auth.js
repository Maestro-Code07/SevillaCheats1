import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Register
router.post('/register', async (req,res)=>{
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ message:'Kayıt başarılı', user:{ email: user.email } });
  } catch (err){
    res.status(400).json({ error: 'Kayıt sırasında hata oluştu' });
  }
});

// Login
router.post('/login', async (req,res)=>{
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı' });

    const isMatch = await user.comparePassword(password);
    if(!isMatch) return res.status(400).json({ error:'Şifre hatalı' });

    req.session.userId = user._id;
    res.json({ message:'Giriş başarılı', user:{ email:user.email } });
  } catch (err){
    res.status(500).json({ error:'Sunucu hatası' });
  }
});

// Logout
router.post('/logout', (req,res)=>{
  req.session.destroy(err=>{
    if(err) return res.status(500).json({ error:'Çıkış sırasında hata' });
    res.clearCookie('connect.sid');
    res.json({ message:'Çıkış yapıldı' });
  });
});

// Current user
router.get('/me', async (req,res)=>{
  if(!req.session.userId) return res.status(401).json({ error:'Giriş yapılmamış' });
  const user = await User.findById(req.session.userId);
  res.json({ user:{ email:user.email } });
});

export default router;
