(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'course-1';
  const course = COURSES.find((c) => c.id === id) || COURSES[0];
  window.CURRENT_COURSE = course;

  document.getElementById('breadcrumbTitle').textContent = course.title;
  document.getElementById('courseTitle').textContent = course.title;
  document.getElementById('courseDesc').textContent =
    `Learn ${course.title} through practical, hands-on lessons designed for ${course.level.toLowerCase()} learners.`;
  document.getElementById('statRating').textContent = course.rating;
  document.getElementById('statLearners').textContent = course.learners;
  document.getElementById('statLevel').textContent = course.level;
  document.getElementById('statDuration').textContent = course.duration;

  document.getElementById('sidebarImg').src = course.img;
  document.getElementById('sidebarPrice').textContent = course.price === 0 ? 'Free' : '₹ ' + course.price;
  document.getElementById('sidebarDuration').textContent = course.duration;
  document.getElementById('sidebarLevel').textContent = course.level;

  const enrollBtn = document.getElementById('enrollNowBtn');
  enrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.LSCart.addToCart({ title: course.title, price: course.price, img: course.img });
    window.location.href = 'cart.html';
  });
})();
