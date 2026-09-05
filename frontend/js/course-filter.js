(function () {
  const search = document.getElementById('courseSearch');
  const priceFilter = document.getElementById('priceFilter');
  const levelFilter = document.getElementById('levelFilter');
  const cards = document.querySelectorAll('.course-card');
  const count = document.getElementById('courseCount');
  const noResults = document.getElementById('noCourseResults');
  if (!search || !cards.length) return;

  function apply() {
    const q = search.value.trim().toLowerCase();
    const price = priceFilter.value;
    const level = levelFilter.value;
    let visible = 0;

    cards.forEach((card) => {
      const title = card.querySelector('h5').textContent.trim().toLowerCase();
      const badge = card.querySelector('.image div').textContent.trim().toLowerCase();
      const levelText = card.querySelector('.bi-person-fill')?.parentElement.textContent.trim().toLowerCase() || '';

      const matchesQuery = !q || title.includes(q);
      const matchesPrice = price === 'all' || badge === price;
      const matchesLevel = level === 'all' || levelText.includes(level);
      const show = matchesQuery && matchesPrice && matchesLevel;

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    count.textContent = `${visible} course${visible === 1 ? '' : 's'}`;
    noResults.style.display = visible === 0 ? '' : 'none';
  }

  search.addEventListener('input', apply);
  priceFilter.addEventListener('change', apply);
  levelFilter.addEventListener('change', apply);

  document.getElementById('clearCourseFilters')?.addEventListener('click', () => {
    search.value = '';
    priceFilter.value = 'all';
    levelFilter.value = 'all';
    apply();
  });

  apply();
})();
