// js/edit.js

let selectedMood = null;
let postId = null;

function getPostIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function selectMoodBtn(el) {
  document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
  el.classList.add('selected');
  selectedMood = el.dataset.mood;
}

async function loadExistingPost() {
  postId = getPostIdFromUrl();

  if (!postId) {
    alert('ไม่พบโพสต์ที่ต้องการแก้ไข');
    window.location.href = '6-profile.html';
    return;
  }

  try {
    // backend ยังไม่มี GET /moods/:id เดี่ยว เลยดึงทั้งหมดมาแล้วหาโพสต์ที่ตรง id เอา
    const allMoods = await fetchMoods({ limit: 100 });
    const moods = allMoods.moods || allMoods;
    const mood = moods.find(m => m._id === postId);

    if (!mood) {
      alert('ไม่พบโพสต์นี้ หรือโพสต์อาจถูกลบไปแล้ว');
      window.location.href = '6-profile.html';
      return;
    }

    document.getElementById('editContent').value = mood.content;
    selectedMood = mood.moodType;

    const btn = document.querySelector(`.mood-btn[data-mood="${mood.moodType}"]`);
    if (btn) btn.classList.add('selected');

  } catch (error) {
    console.error('Load post error:', error);
    alert('โหลดข้อมูลโพสต์ไม่สำเร็จ');
  }
}

async function handleSaveEdit() {
  const content = document.getElementById('editContent').value.trim();
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.style.display = 'none';

  if (!selectedMood || !content) {
    errorMsg.textContent = 'กรุณาเลือกอารมณ์และใส่ข้อความ';
    errorMsg.style.display = 'block';
    return;
  }

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.innerText = 'กำลังบันทึก...';

  try {
    const result = await updateMood(postId, { moodType: selectedMood, content });

    if (result && (result._id || result.success)) {
      window.location.href = '6-profile.html';
    } else {
      errorMsg.textContent = result.message || 'บันทึกไม่สำเร็จ กรุณาลองใหม่';
      errorMsg.style.display = 'block';
    }
  } catch (error) {
    console.error('Update post error:', error);
    errorMsg.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
    errorMsg.style.display = 'block';
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerText = 'บันทึกการแก้ไข';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    window.location.href = '2-login.html';
    return;
  }

  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => selectMoodBtn(btn));
  });

  loadExistingPost();
});