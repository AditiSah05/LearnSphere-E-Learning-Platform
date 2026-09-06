(function () {
  const API_BASE = 'http://localhost:5000/api';

  function token() { return localStorage.getItem('token'); }
  function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }; }

  if (!token()) {
    window.location.href = 'login.html';
    return;
  }

  // Session expiry: a 401 here means the token is stale/expired, not that
  // the server is down — send the user back to login instead of showing a
  // misleading "couldn't reach server" message.
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    const headers = (init && init.headers) || {};
    const hasAuth = !!(headers.Authorization || headers['Authorization']);
    return originalFetch(input, init).then((res) => {
      if (hasAuth && res.status === 401 && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof showToast === 'function') showToast('Session expired — please log in again.', 'info');
        setTimeout(() => (window.location.href = 'login.html'), 800);
      }
      return res;
    });
  };

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
      if (!res.ok) return null;
      const data = await res.json();
      const enrolled = data.enrolled.find((e) => e.title === course.title);
      return enrolled ? enrolled.progress : 0;
    } catch {
      return null;
    }
  }

  async function bumpProgress() {
    try {
      const res = await fetch(`${API_BASE}/enrollment/${encodeURIComponent(course.title)}/progress`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ amount: 25 }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.enrollment.progress;
    } catch {
      return null;
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
        <li class="player-lecture-item ${active ? 'active' : ''} ${done ? 'done' : ''}" data-index="${i}" tabindex="0" role="button" aria-current="${active ? 'true' : 'false'}">
          <span class="lecture-status">${done ? '<i class="bi bi-check-circle-fill"></i>' : (i + 1)}</span>
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

  listEl.addEventListener('keydown', (e) => {
    const item = e.target.closest('.player-lecture-item');
    if (!item || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
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
    const completeBtn = document.getElementById('completeLectureBtn');
    completeBtn.disabled = true;
    const result = await bumpProgress();
    completeBtn.disabled = false;

    if (result === null) {
      showToast("Couldn't save your progress — check your connection and try again.", 'error');
      return;
    }
    currentProgress = result;
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
    const fetched = await fetchProgress();
    if (fetched === null) {
      showToast("Couldn't load your saved progress — check your connection.", 'error');
      currentProgress = 0;
    } else {
      currentProgress = fetched;
    }
    currentIndex = Math.min(Math.floor(currentProgress / 25), LECTURES.length - 1);
    render();
  })();
})();
