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

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanici adi ve sifre zorunludur.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Sifre en az 6 karakter olmalidir.' });
    }
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Bu kullanici adi zaten alinmis.' });
    }
    const user = new User({ username, password });
    await user.save();
    const token = signToken(user);
    res.status(201).json({ _id: user._id, username: user.username, preferences: user.preferences, token });
  } catch (error) {
    console.error('Kayit Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanici adi ve sifre zorunludur.' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Kullanici adi veya sifre hatali.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Kullanici adi veya sifre hatali.' });
    }
    const token = signToken(user);
    res.status(200).json({ _id: user._id, username: user.username, preferences: user.preferences, token });
  } catch (error) {
    console.error('Giris Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;
    if (req.user.userId.toString() !== id.toString()) return res.status(403).json({ error: 'Yetkiniz yok.' });
    if (!username) {
      return res.status(400).json({ error: 'Kullanici adi zorunludur.' });
    }
    const existing = await User.findOne({ username, _id: { $ne: id } });
    if (existing) {
      return res.status(409).json({ error: 'Bu kullanici adi baska bir kullanici tarafindan kullaniliyor.' });
    }
    const user = await User.findByIdAndUpdate(id, { username }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    }
    res.status(200).json({ _id: user._id, username: user.username, preferences: user.preferences });
  } catch (error) {
    console.error('Guncelleme Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/password/:id', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;
    if (req.user.userId.toString() !== id.toString()) return res.status(403).json({ error: 'Yetkiniz yok.' });
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mevcut sifre ve yeni sifre zorunludur.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni sifre en az 6 karakter olmalidir.' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mevcut sifreniz hatali.' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Sifreniz basariyla guncellendi.' });
  } catch (error) {
    console.error('Sifre Guncelleme Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
