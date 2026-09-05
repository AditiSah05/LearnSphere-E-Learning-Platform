(function () {
  const token = localStorage.getItem('token');
  const banner = document.getElementById('continueLearningBanner');
  if (!token || !banner) return;

  fetch('http://localhost:5000/api/enrollment', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return;
      const inProgress = data.enrolled
        .filter((c) => c.progress > 0 && c.progress < 100)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
      if (!inProgress) return;

      document.getElementById('continueCourseTitle').textContent = `${inProgress.title} — ${inProgress.progress}% complete`;
      document.getElementById('continueCourseBtn').href = `learn.html?title=${encodeURIComponent(inProgress.title)}`;
      banner.style.display = '';
    })
    .catch(() => {});
})();
