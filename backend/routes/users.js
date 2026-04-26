const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Basit Login/Register (Sadece isme göre)
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Kullanıcı adı gerekli' });
    }

    // Kullanıcı var mı kontrol et, yoksa oluştur
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
