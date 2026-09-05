(function () {
  // Learners/Level/Duration stay visible in normal flow (not hidden behind
  // hover) — just tidied into one compact row instead of two, with the
  // price/enroll row pulled out on its own line below.
  document.querySelectorAll('.course-item').forEach((card) => {
    const rows = card.querySelectorAll(':scope > .d-flex');
    if (rows.length < 2) return;

    const statsRow = rows[0];
    const bottomRow = rows[1];
    const smalls = bottomRow.querySelectorAll(':scope > small');
    if (smalls.length < 3) return;

    const enrollEl = smalls[2];

    statsRow.classList.add('course-stats-row');
    bottomRow.classList.add('course-bottom-row');
    enrollEl.classList.remove('float-end');
  });
})();
