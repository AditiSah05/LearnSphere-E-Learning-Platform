(function () {
  document.querySelectorAll('.course-item').forEach((card) => {
    const rows = card.querySelectorAll(':scope > .d-flex');
    if (rows.length < 2) return;

    const statsRow = rows[0];
    const bottomRow = rows[1];
    const smalls = bottomRow.querySelectorAll(':scope > small');
    if (smalls.length < 3) return;

    const durationEl = smalls[0];
    const enrollEl = smalls[2];

    const imageDiv = card.querySelector('.image');
    if (imageDiv) {
      const overlay = document.createElement('div');
      overlay.className = 'course-hover-info';
      overlay.innerHTML = statsRow.innerHTML + durationEl.outerHTML;
      imageDiv.appendChild(overlay);
    }

    statsRow.remove();
    durationEl.remove();
    bottomRow.classList.add('course-bottom-row');
    enrollEl.classList.remove('float-end');
  });
})();
