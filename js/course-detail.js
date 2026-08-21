(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'course-1';
  const course = COURSES.find((c) => c.id === id) || COURSES[0];
  window.CURRENT_COURSE = course;

  document.title = `LearnSphere : ${course.title}`;
  const metaDesc = document.getElementById('metaDescription');
  if (metaDesc) {
    metaDesc.setAttribute('content', `Learn ${course.title} on LearnSphere — ${course.level} level, ${course.duration}, rated ${course.rating}/5. ${course.price === 0 ? 'Free' : '₹' + course.price} to enroll.`);
  }

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

  const shareBtn = document.getElementById('shareCourseBtn');
  shareBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: course.title, text: `Check out ${course.title} on LearnSphere`, url: shareUrl }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      const original = shareBtn.textContent;
      shareBtn.textContent = ' Link copied!';
      setTimeout(() => { shareBtn.textContent = original; }, 1500);
    } catch {
      prompt('Copy this link:', shareUrl);
    }
  });
})();
