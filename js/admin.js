let allUsersData = []; // เก็บผู้ใช้ทั้งหมดไว้ทำ Filter ช่องค้นหา

const moodEmojiMap = {
  happy: '😄',
  stressed: '😖',
  tired: '😴',
  neutral: '😐',
  sad: '😢'
};

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  loadAllPosts();
  loadAllUsers();
});

// 1. ตรวจสอบสิทธิ์ Admin
function checkAdminAuth() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
    window.location.href = '2-login.html';
    return;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      window.location.href = '3-feed.html';
    }
  } catch (error) {
    window.location.href = '2-login.html';
  }
}

// 2. ดึงโพสต์ทั้งหมดมาแสดงฝั่งซ้าย
async function loadAllPosts() {
  const container = document.getElementById('postsListContainer');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://127.0.0.1:5000/api/moods?limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('ไม่สามารถดึงโพสต์ได้');

    const data = await response.json();
    // /api/moods คืนค่าเป็น { moods: [...], pagination: {...} }
    const posts = data.moods || data;

    if (!posts || posts.length === 0) {
      container.innerHTML = `<p class="empty-msg">ไม่มีโพสต์ในระบบ</p>`;
      return;
    }

    container.innerHTML = posts.map(p => {
      const faculty = p.user?.faculty || p.faculty || 'ไม่ระบุคณะ';
      const studentId = p.user?.studentId || 'ผู้ใช้';
      const emoji = moodEmojiMap[p.moodType] || p.moodType || '😶';

      return `
        <div class="report-row">
          <div>
            <p class="meta">${studentId} (${faculty}) · ${emoji}</p>
            <p class="text">${p.content || ''}</p>
          </div>
          <button class="btn-danger" onclick="handleAdminDeletePost('${p._id}')">ลบ</button>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="empty-msg" style="color: red;">เกิดข้อผิดพลาดในการโหลดโพสต์</p>`;
  }
}

// 3. ฟังก์ชันลบโพสต์ผ่าน API ของ Admin
async function handleAdminDeletePost(postId) {
  if (!confirm('คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้เนื่องจากไม่เหมาะสม?')) return;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://127.0.0.1:5000/api/admin/moods/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'ลบไม่สำเร็จ');

    alert('ลบโพสต์เรียบร้อยแล้ว');
    loadAllPosts(); // รีโหลดโพสต์ใหม่
  } catch (error) {
    alert(`เกิดข้อผิดพลาด: ${error.message}`);
  }
}

// 4. ดึงผู้ใช้ทั้งหมดมาแสดงฝั่งขวา
async function loadAllUsers() {
  const container = document.getElementById('usersListContainer');
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://127.0.0.1:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    allUsersData = await response.json();

    renderUsersList(allUsersData);
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="empty-msg" style="color: red;">เกิดข้อผิดพลาดในการโหลดผู้ใช้</p>`;
  }
}

// Render รายชื่อผู้ใช้
function renderUsersList(users) {
  const container = document.getElementById('usersListContainer');

  if (!users || users.length === 0) {
    container.innerHTML = `<p class="empty-msg">ไม่พบผู้ใช้ที่ค้นหา</p>`;
    return;
  }

  container.innerHTML = users.map(u => {
    const studentId = u.studentId || u.username || 'ไม่มีรหัส';
    const isRoleAdmin = u.role === 'admin';
    const targetRole = isRoleAdmin ? 'user' : 'admin';
    const btnText = isRoleAdmin ? 'ปรับเป็น User' : 'เลื่อนเป็น Admin';

    return `
      <div class="promote-row">
        <p>${studentId} · role: <strong>${u.role}</strong></p>
        <button class="btn-outline" onclick="toggleUserRole('${u._id}', '${targetRole}')">${btnText}</button>
      </div>
    `;
  }).join('');
}

// 5. ระบบ ค้นหารหัสนักศึกษา (Filter Real-time)
function filterUsers() {
  const query = document.getElementById('userSearchInput').value.trim().toLowerCase();
  const filtered = allUsersData.filter(u => {
    const sId = (u.studentId || u.username || '').toLowerCase();
    return sId.includes(query);
  });
  renderUsersList(filtered);
}

// 6. ฟังก์ชันเลื่อนขั้น / สลับ Role
async function toggleUserRole(userId, newRole) {
  if (!confirm(`คุณต้องการเปลี่ยนสิทธิ์ผู้ใช้นี้เป็น ${newRole} ใช่หรือไม่?`)) return;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (!response.ok) throw new Error('อัปเดตสิทธิ์ไม่สำเร็จ');

    alert('อัปเดตสิทธิ์เรียบร้อยแล้ว!');
    loadAllUsers(); // รีโหลดรายชื่อใหม่
  } catch (error) {
    alert(`เกิดข้อผิดพลาด: ${error.message}`);
  }
}