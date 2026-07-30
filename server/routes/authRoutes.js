const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { studentId, password, faculty, year, avatar } = req.body;

    if (!studentId || !password || !faculty || !year) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    const existingUser = await User.findOne({ studentId });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'รหัสนักศึกษานี้ถูกใช้งานแล้ว' });
    }

    // เข้ารหัสรหัสผ่านก่อนเก็บลง DB (ห้ามเก็บ plain text เด็ดขาด)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      studentId,
      password: hashedPassword,
      faculty,
      year: Number(year),
      avatar: avatar || 'sunflower'
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'สมัครสมาชิกสำเร็จ' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสนักศึกษาและรหัสผ่าน' });
    }

    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(401).json({ success: false, message: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // เทียบรหัสผ่านที่เข้ารหัสไว้ (ไม่เทียบ plain text อีกต่อไป)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง JWT จริง (ไม่ใช่ fake string อีกต่อไป)
    // payload มี faculty ด้วย เพราะ moodRoutes.js ต้องใช้ req.user.faculty ตอนโพสต์
    const token = jwt.sign(
      {
        id: user._id,
        studentId: user.studentId,
        faculty: user.faculty,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // อายุ token 7 วัน ปรับได้ตามต้องการ
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        faculty: user.faculty,
        year: user.year,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

module.exports = router;