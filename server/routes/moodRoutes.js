const express = require('express');
const router = express.Router();
const Mood = require('../models/Mood');
const { protect } = require('../middlewares/authMiddleware');

// ==========================================
// 1. POST /api/moods (โพสต์อารมณ์ใหม่)
// ต้อง Login ก่อน (ใช้ protect middleware)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { moodType, content } = req.body;

    if (!moodType || !content) {
      return res.status(400).json({ message: 'กรุณาเลือกอารมณ์และใส่ข้อความ' });
    }

    // สร้าง Mood โดยดึง faculty มาจาก Token ของ User ที่ Login อยู่ (Anonymous identity)
    const newMood = new Mood({
      user: req.user.id,
      moodType,
      content,
      faculty: req.user.faculty,
    });

    const savedMood = await newMood.save();
    res.status(201).json(savedMood);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// 2. GET /api/moods (ดึงรายการ Mood ทั้งหมด / มี Filter & Pagination)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { faculty, moodType, page = 1, limit = 10 } = req.query;

    // สร้าง Query Object สำหรับ Filter
    let query = {};
    if (faculty) query.faculty = faculty;
    if (moodType) query.moodType = moodType;

    // คำนวณการแบ่งหน้า (Pagination)
    const skip = (page - 1) * limit;

    const moods = await Mood.find(query)
      .populate('user', 'studentId faculty')
      .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Mood.countDocuments(query);

    res.json({
      moods,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// 3. PUT /api/moods/:id (แก้ไขโพสต์ของตัวเอง)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const { moodType, content } = req.body;
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ message: 'ไม่พบโพสต์นี้' });
    }

    // เช็กว่าเป็นเจ้าของโพสต์หรือไม่
    if (mood.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์แก้ไขโพสต์นี้' });
    }

    if (moodType) mood.moodType = moodType;
    if (content) mood.content = content;

    const updatedMood = await mood.save();
    res.json(updatedMood);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// 4. DELETE /api/moods/:id (ลบโพสต์ของตัวเอง)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const mood = await Mood.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ message: 'ไม่พบโพสต์นี้' });
    }

    // เช็กว่าเป็นเจ้าของโพสต์หรือไม่
    if (mood.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์ลบโพสต์นี้' });
    }

    await mood.deleteOne();
    res.json({ message: 'ลบโพสต์เรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;