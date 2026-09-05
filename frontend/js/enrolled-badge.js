(function () {
  const API_BASE = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const grid = document.getElementById('courseGrid');
  if (!token || !grid) return;

  fetch(`${API_BASE}/enrollment`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      const enrolledTitles = new Set(data.enrolled.map((c) => c.title));
      if (!enrolledTitles.size) return;

      grid.querySelectorAll('.course-card').forEach((card) => {
        const titleLink = card.querySelector('h5 a');
        if (!titleLink || !enrolledTitles.has(titleLink.textContent.trim())) return;

        const imageDiv = card.querySelector('.image');
        if (imageDiv && !imageDiv.querySelector('.enrolled-ribbon')) {
          const ribbon = document.createElement('div');
          ribbon.className = 'enrolled-ribbon';
          ribbon.innerHTML = '<i class="fa fa-check-circle me-1"></i>Enrolled';
          imageDiv.appendChild(ribbon);
        }

        const enrollBtn = card.querySelector('.enroll-btn');
        if (enrollBtn) {
          enrollBtn.textContent = 'Continue Learning ';
          enrollBtn.classList.remove('enroll-btn');
          enrollBtn.href = `learn.html?title=${encodeURIComponent(titleLink.textContent.trim())}`;
        }
      });
    })
    .catch(() => {});
})();
