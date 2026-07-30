// js/post.js
window.selectedMood = 'happy';

window.selectMood = function(element, moodType) {
  if (!element) return;
  const allBtns = document.querySelectorAll('.mood-btn');
  allBtns.forEach(btn => btn.classList.remove('selected'));

  element.classList.add('selected');
  window.selectedMood = moodType;
};

window.handleCreatePost = async function() {
  const contentInput = document.getElementById('postContent');
  const content = contentInput ? contentInput.value.trim() : '';

  if (!content) {
    alert('กรุณากรอกข้อความก่อนโพสต์');
    return;
  }

  const postBtn = document.getElementById('submitBtn');
  if (postBtn) {
    postBtn.disabled = true;
    postBtn.innerText = 'กำลังโพสต์...';
  }

  try {
    const result = await createMood({
      moodType: window.selectedMood,
      content: content
    });

    if (result && (result._id || result.success || result.message === 'บันทึกสำเร็จ')) {
      alert('โพสต์อารมณ์เรียบร้อยแล้ว!');
      window.location.href = '3-feed.html';
    } else {
      alert(result.message || 'ไม่สามารถโพสต์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  } catch (error) {
    console.error('Create post error:', error);
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  } finally {
    if (postBtn) {
      postBtn.disabled = false;
      postBtn.innerText = 'โพสต์แบบไม่ระบุตัวตน';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    window.location.href = '2-login.html';
    return;
  }

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const userFacultyText = document.getElementById('userFacultyText');
      if (user.faculty && userFacultyText) {
        userFacultyText.innerText = `โพสต์ในนาม: ${user.faculty} (ดึงจากบัญชีของคุณอัตโนมัติ)`;
      }
    } catch (e) {
      console.error('Parse user error:', e);
    }
  }
});