// api.js
const BASE_URL = 'http://localhost:5000/api';

// ดึง Token จาก LocalStorage
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ==================== AUTH ====================

// 1. สมัครสมาชิก (Register)
// รับ object ก้อนเดียว { studentId, faculty, year, password } ให้ตรงกับที่ 1-register.html เรียกใช้
async function registerUser({ studentId, faculty, year, password }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, faculty, year, password })
  });
  return await res.json();
}

// 2. เข้าสู่ระบบ (Login)
async function loginUser(studentId, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    // เก็บข้อมูล user ไว้ด้วย (faculty, role) เพื่อใช้ auto-fill ตอนโพสต์
    // และเช็คว่าจะโชว์ปุ่ม Admin panel ไหม
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }
  return data;
}

// 3. ดึงข้อมูล user ที่ login อยู่ตอนนี้ (จาก localStorage)
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// 4. Logout
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '2-login.html';
}

// ==================== MOODS ====================

// 5. ดึงรายการ Mood ทั้งหมด (รองรับ filter: mood, faculty, from, to)
async function fetchMoods(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/moods${params ? '?' + params : ''}`);
  return await res.json();
}

// 6. ดึงเฉพาะโพสต์ของตัวเอง (สำหรับหน้า Profile)
// หมายเหตุ: backend ยังไม่มี endpoint /moods/mine แยกต่างหาก
// เลยดึงโพสต์ทั้งหมดมาแล้วกรองเฉพาะของ user ปัจจุบันด้วย JS แทน
async function fetchMyMoods() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  const res = await fetch(`${BASE_URL}/moods?limit=100`);
  const data = await res.json();
  const allMoods = data.moods || data;

  if (!Array.isArray(allMoods)) return [];
  return allMoods.filter(m => m.user === currentUser.id || (m.user && m.user._id === currentUser.id));
}

// 7. โพสต์ Mood ใหม่ (ไม่ต้องส่ง faculty เพราะ backend ดึงจาก token เอง)
// รับ object { moodType, content } ให้ตรงกับที่ post.js เรียกใช้
async function createMood({ moodType, content }) {
  const res = await fetch(`${BASE_URL}/moods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ moodType, content })
  });
  return await res.json();
}

// 8. แก้ไขโพสต์ของตัวเอง
// รับ object { moodType, content } เพื่อให้เรียกใช้แบบเดียวกับ createMood
async function updateMood(id, { moodType, content }) {
  const res = await fetch(`${BASE_URL}/moods/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ moodType, content })
  });
  return await res.json();
}

// 9. ลบโพสต์ของตัวเอง
async function deleteMood(id) {
  const res = await fetch(`${BASE_URL}/moods/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  return await res.json();
}

// ==================== SUMMARY ====================

// 10. ดึงสรุปอารมณ์ภาพรวม
async function fetchSummaryOverall() {
  const res = await fetch(`${BASE_URL}/moods/summary/overall`);
  return await res.json();
}

// 11. ดึงสรุปอารมณ์แยกตามคณะ
async function fetchSummaryByFaculty() {
  const res = await fetch(`${BASE_URL}/moods/summary/faculty`);
  return await res.json();
}

// ==================== ADMIN ====================

// 12. ลบโพสต์ของคนอื่น (Admin เท่านั้น)
async function adminDeleteMood(id) {
  const res = await fetch(`${BASE_URL}/admin/moods/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  return await res.json();
}

// 13. เลื่อนขั้นผู้ใช้เป็น Admin (Admin เท่านั้น)
async function promoteUser(studentId) {
  const res = await fetch(`${BASE_URL}/admin/users/promote`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ studentId })
  });
  return await res.json();
}

// ตัวอย่างการสั่งแสดงปุ่ม Admin ใน js/profile.js
const userStr = localStorage.getItem('user');
if (userStr) {
  const user = JSON.parse(userStr);
  const adminBtn = document.getElementById('adminPanelBtn'); // ID ของปุ่ม Admin
  
  if (adminBtn) {
    if (user.role === 'admin') {
      adminBtn.style.display = 'block'; // หรือ 'inline-block'
    } else {
      adminBtn.style.display = 'none';
    }
  }
}