const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

    res.status(201).json({
      _id: user._id,
      username: user.username,
      preferences: user.preferences
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

    res.status(200).json({
      _id: user._id,
      username: user.username,
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Giriş Hatası:", error);
    res.status(500).json({ error: error.message });
  }
});

// ── PROFİL GÜNCELLE ─────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;

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

module.exports = router;
