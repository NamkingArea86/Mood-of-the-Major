// js/feed.js

const MOOD_META = {
  happy:    { emoji: '😊', label: 'มีความสุข',  class: 'mood-happy' },
  stressed: { emoji: '😰', label: 'เครียด',      class: 'mood-stressed' },
  tired:    { emoji: '😴', label: 'เหนื่อย',      class: 'mood-tired' },
  neutral:  { emoji: '😐', label: 'เฉยๆ',        class: 'mood-neutral' },
  sad:      { emoji: '😢', label: 'เศร้า',        class: 'mood-sad' }
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'เมื่อสักครู่';
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

function renderMoodCards(moods) {
  const grid = document.getElementById('moodGrid');

  if (!Array.isArray(moods) || moods.length === 0) {
    grid.innerHTML = '<p class="empty-msg">ยังไม่มีโพสต์ในขณะนี้</p>';
    return;
  }

  grid.innerHTML = moods.map(mood => {
    const meta = MOOD_META[mood.moodType] || MOOD_META.neutral;
    return `
      <div class="card ${meta.class}">
        <p class="meta">${mood.faculty || 'ไม่ระบุคณะ'} · ${timeAgo(mood.createdAt)}</p>
        <p class="emoji">${meta.emoji}</p>
        <p class="text">${escapeHtml(mood.content)}</p>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadFeed() {
  const grid = document.getElementById('moodGrid');
  grid.innerHTML = '<p class="empty-msg">กำลังโหลด...</p>';

  const filters = {};
  const moodVal = document.getElementById('filterMood').value;
  const facultyVal = document.getElementById('filterFaculty').value;
  if (moodVal) filters.moodType = moodVal;
  if (facultyVal) filters.faculty = facultyVal;

  try {
    const result = await fetchMoods(filters);
    // backend ส่งกลับมาเป็น { moods: [...], pagination: {...} }
    const moods = result.moods || result;
    renderMoodCards(moods);
  } catch (error) {
    console.error('Load feed error:', error);
    grid.innerHTML = '<p class="empty-msg">โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadFeed();
  document.getElementById('filterMood').addEventListener('change', loadFeed);
  document.getElementById('filterFaculty').addEventListener('change', loadFeed);
});