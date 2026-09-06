(function () {
  const search = document.getElementById('courseSearch');
  const priceFilter = document.getElementById('priceFilter');
  const levelFilter = document.getElementById('levelFilter');
  const cards = document.querySelectorAll('.course-card');
  const count = document.getElementById('courseCount');
  const noResults = document.getElementById('noCourseResults');
  const loadMoreBtn = document.getElementById('loadMoreCourses');
  if (!search || !cards.length) return;

  const PAGE_SIZE = 8;
  let limit = PAGE_SIZE;

  function apply() {
    const q = search.value.trim().toLowerCase();
    const price = priceFilter.value;
    const level = levelFilter.value;
    const filtering = !!q || price !== 'all' || level !== 'all';
    let matched = 0;

    cards.forEach((card) => {
      const title = card.querySelector('h5').textContent.trim().toLowerCase();
      const badge = card.querySelector('.image div').textContent.trim().toLowerCase();
      const levelText = card.querySelector('.bi-person-fill')?.parentElement.textContent.trim().toLowerCase() || '';

      const matchesQuery = !q || title.includes(q);
      const matchesPrice = price === 'all' || badge === price;
      const matchesLevel = level === 'all' || levelText.includes(level);
      const matches = matchesQuery && matchesPrice && matchesLevel;

      if (matches) matched++;
      const show = matches && (filtering || matched <= limit);
      card.style.display = show ? '' : 'none';
    });

    count.textContent = `${matched} course${matched === 1 ? '' : 's'}`;
    noResults.style.display = matched === 0 ? '' : 'none';
    if (loadMoreBtn) loadMoreBtn.style.display = !filtering && matched > limit ? '' : 'none';
  }

  function resetAndApply() {
    limit = PAGE_SIZE;
    apply();
  }

  search.addEventListener('input', resetAndApply);
  priceFilter.addEventListener('change', resetAndApply);
  levelFilter.addEventListener('change', resetAndApply);

  loadMoreBtn?.addEventListener('click', () => {
    limit += PAGE_SIZE;
    apply();
  });

  document.getElementById('clearCourseFilters')?.addEventListener('click', () => {
    search.value = '';
    priceFilter.value = 'all';
    levelFilter.value = 'all';
    resetAndApply();
  });

  apply();
})();
