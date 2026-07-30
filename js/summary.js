// js/summary.js

const MOOD_ORDER = ['happy', 'stressed', 'tired', 'neutral', 'sad'];
const MOOD_LABEL = {
  happy: 'มีความสุข', stressed: 'เครียด', tired: 'เหนื่อย', neutral: 'เฉยๆ', sad: 'เศร้า'
};
const MOOD_SEG_CLASS = {
  happy: 'seg-happy', stressed: 'seg-stressed', tired: 'seg-tired', neutral: 'seg-neutral', sad: 'seg-sad'
};

function switchTab(tab) {
  const overallBtn = document.getElementById('tabOverallBtn');
  const facultyBtn = document.getElementById('tabFacultyBtn');
  const overallView = document.getElementById('overallView');
  const facultyView = document.getElementById('facultyView');

  if (tab === 'overall') {
    overallBtn.classList.add('active'); overallBtn.classList.remove('inactive');
    facultyBtn.classList.add('inactive'); facultyBtn.classList.remove('active');
    overallView.style.display = 'block';
    facultyView.style.display = 'none';
  } else {
    facultyBtn.classList.add('active'); facultyBtn.classList.remove('inactive');
    overallBtn.classList.add('inactive'); overallBtn.classList.remove('active');
    facultyView.style.display = 'block';
    overallView.style.display = 'none';
  }
}

function countByMood(moods) {
  const counts = { happy: 0, stressed: 0, tired: 0, neutral: 0, sad: 0 };
  moods.forEach(m => {
    if (counts.hasOwnProperty(m.moodType)) counts[m.moodType]++;
  });
  return counts;
}

function renderOverall(moods) {
  const total = moods.length;
  const counts = countByMood(moods);

  MOOD_ORDER.forEach(mood => {
    const pct = total > 0 ? Math.round((counts[mood] / total) * 100) : 0;
    document.getElementById(`pct-${mood}`).innerText = `${pct}%`;
  });
}

function renderByFaculty(moods) {
  const container = document.getElementById('facultyRows');

  if (moods.length === 0) {
    container.innerHTML = '<p class="empty-msg">ยังไม่มีข้อมูล</p>';
    return;
  }

  // จัดกลุ่มตามคณะ
  const byFaculty = {};
  moods.forEach(m => {
    const fac = m.faculty || 'ไม่ระบุคณะ';
    if (!byFaculty[fac]) byFaculty[fac] = [];
    byFaculty[fac].push(m);
  });

  container.innerHTML = Object.entries(byFaculty).map(([faculty, facMoods]) => {
    const total = facMoods.length;
    const counts = countByMood(facMoods);

    // หาอารมณ์ที่เด่นที่สุดของคณะนี้
    let topMood = MOOD_ORDER[0];
    MOOD_ORDER.forEach(mood => {
      if (counts[mood] > counts[topMood]) topMood = mood;
    });
    const topPct = total > 0 ? Math.round((counts[topMood] / total) * 100) : 0;

    const segments = MOOD_ORDER.map(mood => {
      const pct = total > 0 ? (counts[mood] / total) * 100 : 0;
      return `<div class="${MOOD_SEG_CLASS[mood]}" style="width:${pct}%"></div>`;
    }).join('');

    return `
      <div class="faculty-row">
        <div class="faculty-label">
          <span class="name">${faculty}</span>
          <span class="top">${MOOD_LABEL[topMood]}สูงสุด ${topPct}%</span>
        </div>
        <div class="bar">${segments}</div>
      </div>
    `;
  }).join('');
}

async function loadSummary() {
  try {
    const result = await fetchMoods({ limit: 1000 });
    const moods = result.moods || result;

    renderOverall(moods);
    renderByFaculty(moods);
  } catch (error) {
    console.error('Load summary error:', error);
    document.getElementById('facultyRows').innerHTML = '<p class="empty-msg">โหลดข้อมูลไม่สำเร็จ</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadSummary);