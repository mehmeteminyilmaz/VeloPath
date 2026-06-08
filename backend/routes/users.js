const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'velopath_super_secret_key_2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || (JWT_SECRET + '_refresh');

const signAccessToken = (user) =>
  jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '15m' });

const signRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, REFRESH_SECRET, { expiresIn: '30d' });

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Kullanici adi ve sifre zorunludur.' });
    if (password.length < 6) return res.status(400).json({ error: 'Sifre en az 6 karakter olmalidir.' });

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'Bu kullanici adi zaten alinmis.' });

    const user = new User({ username, password, ...(req.body.email ? { email: req.body.email } : {}) });
    const refreshToken = signRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      preferences: user.preferences,
      token: signAccessToken(user),
      refreshToken,
    });
  } catch (error) {
    console.error('Kayit Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Kullanici adi ve sifre zorunludur.' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Kullanici adi veya sifre hatali.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Kullanici adi veya sifre hatali.' });

    const refreshToken = signRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      preferences: user.preferences,
      token: signAccessToken(user),
      refreshToken,
    });
  } catch (error) {
    console.error('Giris Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

// ME — Token dogrulama (mobil uygulama baslangiç kontrolü için)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshToken');
    if (!user) return res.status(404).json({ error: 'Kullanici bulunamadi.' });
    res.json({ _id: user._id, username: user.username, preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token gerekli.' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (_) {
      return res.status(401).json({ error: 'Gecersiz veya suresi dolmus refresh token.' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Token gecersiz veya iptal edilmis.' });
    }

    // Rotate: yeni refresh token da ver
    const newRefreshToken = signRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      token: signAccessToken(user),
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

// LOGOUT — refresh token'i iptal et
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Cikis yapildi.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH username
router.patch('/:id', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const { id } = req.params;
    if (req.user.userId.toString() !== id.toString()) return res.status(403).json({ error: 'Yetkiniz yok.' });
    if (!username) return res.status(400).json({ error: 'Kullanici adi zorunludur.' });

    const existing = await User.findOne({ username, _id: { $ne: id } });
    if (existing) return res.status(409).json({ error: 'Bu kullanici adi baska biri tarafindan kullaniliyor.' });

    const user = await User.findByIdAndUpdate(id, { username }, { new: true });
    if (!user) return res.status(404).json({ error: 'Kullanici bulunamadi.' });

    res.status(200).json({ _id: user._id, username: user.username, preferences: user.preferences });
  } catch (error) {
    console.error('Guncelleme Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH password
router.patch('/password/:id', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;
    if (req.user.userId.toString() !== id.toString()) return res.status(403).json({ error: 'Yetkiniz yok.' });
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Mevcut sifre ve yeni sifre zorunludur.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Yeni sifre en az 6 karakter olmalidir.' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Kullanici bulunamadi.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: 'Mevcut sifreniz hatali.' });

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Sifreniz basariyla guncellendi.' });
  } catch (error) {
    console.error('Sifre Guncelleme Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

// FORGOT PASSWORD — sifre sifirlama linki gonder
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-posta adresi gerekli.' });

    const user = await User.findOne({ email });
    // Guvenlik: kullanici bulunamasa da basari mesaji goster (kullanici enumeration onle)
    if (!user) return res.json({ message: 'E-posta adresinize sifirlama linki gonderildi.' });

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExp = new Date(Date.now() + 60 * 60 * 1000); // 1 saat
    await user.save();

    const SMTP_HOST = process.env.SMTP_HOST;
    if (SMTP_HOST) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      const resetUrl = (process.env.CLIENT_URL || 'http://localhost:3000') + '/reset-password?token=' + resetToken;
      await transporter.sendMail({
        from: '"VeloPath" <' + (process.env.SMTP_USER || 'noreply@velopath.com') + '>',
        to: user.email,
        subject: 'VeloPath - Sifre Sifirlama',
        html: '<p>Merhaba ' + user.username + ',</p><p>Sifrenizi sifirlamak icin asagidaki linke tiklayin (1 saat gecerli):</p><p><a href="' + resetUrl + '">' + resetUrl + '</a></p><p>Bu istegi siz yapmadiysa bu e-postayı gormezden gelebilirsiniz.</p>',
      });
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV] Reset token:', resetToken);
      }
    }

    res.json({ message: 'E-posta adresinize sifirlama linki gonderildi.' });
  } catch (error) {
    console.error('Forgot Password Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

// RESET PASSWORD — yeni sifre belirle
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token ve yeni sifre gerekli.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Sifre en az 6 karakter olmalidir.' });

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExp: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Gecersiz veya suresi dolmus sifirlama linki.' });

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExp = null;
    user.refreshToken = null; // Tum aktif oturumları gecersiz kil
    await user.save();

    res.json({ message: 'Sifreniz basariyla guncellendi. Giris yapabilirsiniz.' });
  } catch (error) {
    console.error('Reset Password Hatasi:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
