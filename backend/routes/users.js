const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'velopath_super_secret_key_2026';
const signToken = (user) => jwt.sign(
  { userId: user._id, username: user.username },
  JWT_SECRET,
  { expiresIn: '30d' }
);

// ── KAYIT OL ──────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
    }

    const user = new User({ username, password });
    await user.save();

    const token = signToken(user);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      preferences: user.preferences,
      token,
    });
  } catch (error) {
    console.error("Kayıt Hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// ── GİRİŞ YAP ────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }

    const token = signToken(user);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      preferences: user.preferences,
      token,
    });
  } catch (error) {
    console.error("Giriş Hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// ── PRofİL GÜNCELLE (ŞİFRE KORUMALI) ───────────────────────
router.patch('/:id', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;

    if (req.user.userId !== id) return res.status(403).json({ error: 'Yetkiniz yok.' });

    if (!username) {
      return res.status(400).json({ error: 'Kullanıcı adı zorunludur.' });
    }

    const existing = await User.findOne({ username, _id: { $ne: id } });
    if (existing) {
      return res.status(409).json({ error: 'Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.' });
    }

    const user = await User.findByIdAndUpdate(id, { username }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Güncelleme Hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// ── ŞİFRE DEĞİŞTİR ─────────────────────────────────────────
router.patch('/password/:id', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    if (req.user.userId !== id) return res.status(403).json({ error: 'Yetkiniz yok.' });

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mevcut şifre ve yeni şifre zorunludur.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalıdır.' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mevcut şifreniz hatalı.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Şifreniz başarıyla güncellendi.' });
  } catch (error) {
    console.error("Şifre Güncelleme Hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
