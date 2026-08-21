(function () {
  const ratingWidget = document.getElementById('courseRating');
  if (!ratingWidget) return;

  const COURSE_KEY = (window.CURRENT_COURSE && window.CURRENT_COURSE.id) || 'course-1';
  const REVIEWS_KEY = 'ls_reviews_' + COURSE_KEY;
  let selectedRating = 0;

  function getReviews() {
    try { return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || []; } catch { return []; }
  }
  function saveReviews(reviews) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
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

  function render() {
    const reviews = getReviews();
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
      .slice()
      .reverse()
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

  document.getElementById('submitReview').addEventListener('click', () => {
    if (!selectedRating) {
      alert('Please select a star rating first.');
      return;
    }
    const name = document.getElementById('reviewName').value.trim() || 'Anonymous';
    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) {
      alert('Please write a short review.');
      return;
    }
    const reviews = getReviews();
    reviews.push({ name, rating: selectedRating, comment });
    saveReviews(reviews);

    document.getElementById('reviewName').value = '';
    document.getElementById('reviewComment').value = '';
    selectedRating = 0;
    highlightStars(0);
    render();
  });

  render();
})();
