const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const User = require('../models/User');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// GET /api/admin/users - ดึงผู้ใช้ทั้งหมด
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/users/:id/role - สลับ role
router.put('/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    user.role = role;
    await user.save();
    res.json({ message: 'อัปเดตสิทธิ์เรียบร้อยแล้ว', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/moods/:id
router.delete('/moods/:id', protect, adminOnly, async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);
    if (!mood) return res.status(404).json({ message: 'ไม่พบโพสต์ที่ต้องการลบ' });
    await mood.deleteOne();
    res.json({ message: 'Admin ลบโพสต์ที่ไม่เหมาะสมเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;