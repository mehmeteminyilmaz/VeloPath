const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'velopath_super_secret_key_2026';

/**
 * JWT doğrulama middleware'i
 * Authorization: Bearer <token> header'ı beklenir
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Yetkilendirme gerekli. Lütfen giriş yapın.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, username }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum. Lütfen tekrar giriş yapın.' });
  }
};
