// js/profile.js

const MOOD_META = {
  happy:    { emoji: '😊', label: 'มีความสุข', color: '#EF9F27' },
  stressed: { emoji: '😰', label: 'เครียด',     color: '#7F77DD' },
  tired:    { emoji: '😴', label: 'เหนื่อย',     color: '#B4B2A9' },
  neutral:  { emoji: '😐', label: 'เฉยๆ',       color: '#888780' },
  sad:      { emoji: '😢', label: 'เศร้า',       color: '#378ADD' }
};

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderMyPosts(moods) {
  const container = document.getElementById('myPostsList');

  if (!Array.isArray(moods) || moods.length === 0) {
    container.innerHTML = '<p class="empty-msg">คุณยังไม่มีโพสต์</p>';
    return;
  }

  // เรียงใหม่สุดขึ้นก่อน
  const sorted = [...moods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = sorted.map(mood => {
    const meta = MOOD_META[mood.moodType] || MOOD_META.neutral;
    return `
      <div class="post-row">
        <span class="text">${meta.emoji} ${escapeHtml(mood.content)}</span>
        <span class="icons">
          <span onclick="location.href='5-edit.html?id=${mood._id}'">✏️</span>
          <span onclick="handleDeleteMyPost('${mood._id}')">🗑️</span>
        </span>
      </div>
    `;
  }).join('');

  // ตั้งกรอบสีตามอารมณ์ล่าสุด (โพสต์แรกหลัง sort คือล่าสุด)
  const latestMeta = MOOD_META[sorted[0].moodType] || MOOD_META.neutral;
  document.getElementById('avatarRing').style.borderColor = latestMeta.color;
  document.getElementById('subInfoText').innerText =
    `${sorted[0].faculty || '-'} · อารมณ์ล่าสุด: ${latestMeta.label}`;
}

async function handleDeleteMyPost(id) {
  if (!confirm('ต้องการลบโพสต์นี้ใช่ไหม?')) return;
  try {
    await deleteMood(id);
    loadProfile();
  } catch (error) {
    console.error('Delete error:', error);
    alert('ลบโพสต์ไม่สำเร็จ');
  }
}

async function loadProfile() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById('studentIdText').innerText = `นักศึกษารหัส ${user.studentId}`;
  document.getElementById('subInfoText').innerText = `${user.faculty} · อารมณ์ล่าสุด: เฉยๆ`;

  // ถ้าเป็น Admin โชว์ปุ่มไปหน้า Admin panel
  if (user.role === 'admin') {
    document.getElementById('adminBtnSlot').innerHTML =
      `<a href="8-admin.html" class="btn-admin">⚙️ Admin Panel</a>`;
  }

  try {
    const myMoods = await fetchMyMoods();
    renderMyPosts(myMoods);
  } catch (error) {
    console.error('Load profile error:', error);
    document.getElementById('myPostsList').innerHTML = '<p class="empty-msg">โหลดข้อมูลไม่สำเร็จ</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    window.location.href = '2-login.html';
    return;
  }
  loadProfile();
});

function handleLogout() {
  // ล้าง Token และ User จาก LocalStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // ส่งกลับไปหน้า Login
  alert('ออกจากระบบเรียบร้อย');
  window.location.href = '2-login.html';
}