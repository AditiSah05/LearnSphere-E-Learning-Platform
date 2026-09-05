(function () {
  const API_BASE = 'http://localhost:5000/api';

  function token() { return localStorage.getItem('token'); }
  function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }; }

  if (!token()) {
    window.location.href = 'login.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const title = params.get('title');
  const course = (typeof COURSES !== 'undefined' && COURSES.find((c) => c.title === title)) || (typeof COURSES !== 'undefined' ? COURSES[0] : null);

  if (!course) {
    document.getElementById('playerCourseTitle').textContent = 'Course not found';
    return;
  }

  document.title = `LearnSphere : ${course.title}`;
  document.getElementById('playerCourseTitle').textContent = course.title;

  // Generic 4-part curriculum shell — same shape for every course.
  const LECTURES = [
    { name: 'Introduction & Setup', desc: `Get oriented with ${course.title} and set up everything you need.` },
    { name: 'Core Concepts', desc: 'Work through the key ideas and terminology step by step.' },
    { name: 'Hands-on Practice', desc: 'Apply what you learned with a guided practical exercise.' },
    { name: 'Wrap-up & Next Steps', desc: 'Review what you covered and see where to go from here.' },
  ];

  const listEl = document.getElementById('playerLectureList');
  const progressBar = document.getElementById('playerProgressBar');
  const progressLabel = document.getElementById('playerProgressLabel');
  const lectureHeading = document.getElementById('playerLectureHeading');
  const lectureDesc = document.getElementById('playerLectureDesc');
  const lectureTitleOnVideo = document.getElementById('playerLectureTitle');
  const certWrap = document.getElementById('playerCertificateWrap');

  document.getElementById('playerLectureCount').textContent = `${LECTURES.length} lectures`;

  let currentProgress = 0; // 0,25,50,75,100
  let currentIndex = 0;

  async function fetchProgress() {
    try {
      const res = await fetch(`${API_BASE}/enrollment`, { headers: authHeaders() });
      if (!res.ok) return 0;
      const data = await res.json();
      const enrolled = data.enrolled.find((e) => e.title === course.title);
      return enrolled ? enrolled.progress : 0;
    } catch {
      return 0;
    }
  }

  async function bumpProgress() {
    try {
      const res = await fetch(`${API_BASE}/enrollment/${encodeURIComponent(course.title)}/progress`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ amount: 25 }),
      });
      if (!res.ok) return currentProgress;
      const data = await res.json();
      return data.enrollment.progress;
    } catch {
      return currentProgress;
    }
  }

  function render() {
    progressBar.style.width = currentProgress + '%';
    progressLabel.textContent = currentProgress + '%';

    listEl.innerHTML = LECTURES.map((lec, i) => {
      const unlockedAt = i * 25;
      const done = currentProgress > unlockedAt;
      const active = i === currentIndex;
      return `
        <li class="player-lecture-item ${active ? 'active' : ''} ${done ? 'done' : ''}" data-index="${i}">
          <span class="lecture-status">${done ? '<i class="fa fa-check-circle"></i>' : (i + 1)}</span>
          <span class="lecture-name">${lec.name}</span>
        </li>`;
    }).join('');

    const lec = LECTURES[currentIndex];
    lectureHeading.textContent = lec.name;
    lectureDesc.textContent = lec.desc;
    lectureTitleOnVideo.textContent = lec.name;

    const completeBtn = document.getElementById('completeLectureBtn');
    if (currentProgress >= 100) {
      completeBtn.textContent = 'Course Complete';
      completeBtn.disabled = true;
      certWrap.style.display = '';
    } else {
      completeBtn.textContent = 'Mark Complete & Next';
      completeBtn.disabled = false;
      certWrap.style.display = 'none';
    }

    document.getElementById('prevLectureBtn').disabled = currentIndex === 0;
  }

  listEl.addEventListener('click', (e) => {
    const item = e.target.closest('.player-lecture-item');
    if (!item) return;
    currentIndex = Number(item.dataset.index);
    render();
  });

  document.getElementById('prevLectureBtn').addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      render();
    }
  });

  document.getElementById('completeLectureBtn').addEventListener('click', async () => {
    currentProgress = await bumpProgress();
    if (currentIndex < LECTURES.length - 1) currentIndex++;
    render();
  });

  document.getElementById('playerCertificateBtn').addEventListener('click', () => {
    window.generateCertificate(course.title);
  });

  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('playerLayout').classList.toggle('sidebar-collapsed');
  });

  (async () => {
    currentProgress = await fetchProgress();
    currentIndex = Math.min(Math.floor(currentProgress / 25), LECTURES.length - 1);
    render();
  })();
})();
