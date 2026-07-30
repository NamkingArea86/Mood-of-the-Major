const jwt = require('jsonwebtoken');

// 1. ตรวจสอบการ Login และ Token
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // รองรับโครงสร้าง Payload ทั้งแบบห่อ user และไม่ห่อ
      req.user = decoded.user || decoded;

      return next();
    } catch (error) {
      console.error('JWT Error:', error.message);
      return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'ไม่มี Token, สิทธิ์การเข้าถึงถูกปฏิเสธ' });
  }
};

// 2. ตรวจสอบสิทธิ์ Admin (เพิ่มส่วนนี้)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'สิทธิ์ไม่ถูกต้อง (สำหรับ Admin เท่านั้น)' });
  }
};

// 3. Export ทั้งคู่ ออกไปใช้งาน
module.exports = { protect, adminOnly };