(function () {
  const ratingWidget = document.getElementById('courseRating');
  if (!ratingWidget) return;

  const API_BASE = 'http://localhost:5000/api';
  const COURSE_ID = (window.CURRENT_COURSE && window.CURRENT_COURSE.id) || 'course-1';
  let selectedRating = 0;

  function token() { return localStorage.getItem('token'); }

  async function getReviews() {
    const res = await fetch(`${API_BASE}/reviews/${COURSE_ID}`);
    if (!res.ok) return [];
    return (await res.json()).reviews;
  }
  function starsHTML(value) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="${i <= value ? 'fas' : 'far'} fa-star"></i>`;
    }
    return html;
  }

  function highlightStars(value) {
    ratingWidget.querySelectorAll('i').forEach((star) => {
      star.classList.toggle('text-warning', Number(star.dataset.value) <= value);
    });
  }

  ratingWidget.querySelectorAll('i').forEach((star) => {
    star.style.cursor = 'pointer';
    star.addEventListener('click', () => {
      selectedRating = Number(star.dataset.value);
      highlightStars(selectedRating);
    });
  });

  async function render() {
    const reviews = await getReviews();
    const list = document.getElementById('reviewList');
    const avgEl = document.getElementById('reviewAverage');
    const avgStars = document.getElementById('reviewAverageStars');
    const countEl = document.getElementById('reviewCount');

    if (!reviews.length) {
      list.innerHTML = '<p class="text-muted">No reviews yet — be the first to leave one.</p>';
      avgEl.textContent = '0.0';
      avgStars.innerHTML = starsHTML(0);
      countEl.textContent = '0 reviews';
      return;
    }

    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    avgEl.textContent = avg.toFixed(1);
    avgStars.innerHTML = starsHTML(Math.round(avg));
    countEl.textContent = `${reviews.length} review${reviews.length === 1 ? '' : 's'}`;

    list.innerHTML = reviews
      .map((r) => `
        <div class="border-bottom py-3">
          <div class="d-flex justify-content-between">
            <strong>${r.name}</strong>
            <span class="text-warning">${starsHTML(r.rating)}</span>
          </div>
          <p class="mb-0 mt-1">${r.comment}</p>
        </div>`)
      .join('');
  }

  document.getElementById('submitReview').addEventListener('click', async () => {
    if (!token()) {
      if (typeof showToast === 'function') showToast('Please login to leave a review', 'info');
      setTimeout(() => (window.location.href = 'login.html'), 600);
      return;
    }
    if (!selectedRating) {
      showToast('Please select a star rating first.', 'info');
      return;
    }
    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) {
      showToast('Please write a short review.', 'info');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/reviews/${COURSE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ rating: selectedRating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Could not submit review.', 'error');
        return;
      }
    } catch {
      showToast("Couldn't reach the server. Please try again.", 'error');
      return;
    }

    document.getElementById('reviewComment').value = '';
    selectedRating = 0;
    highlightStars(0);
    render();
  });

  render();
})();
