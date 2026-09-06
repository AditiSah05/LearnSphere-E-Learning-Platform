(function () {
  const search = document.getElementById('courseSearch');
  const priceFilter = document.getElementById('priceFilter');
  const levelFilter = document.getElementById('levelFilter');
  const sortFilter = document.getElementById('courseSort');
  const grid = document.getElementById('courseGrid');
  const cards = document.querySelectorAll('.course-card');
  const count = document.getElementById('courseCount');
  const noResults = document.getElementById('noCourseResults');
  const loadMoreBtn = document.getElementById('loadMoreCourses');
  if (!search || !cards.length) return;

  const PAGE_SIZE = 8;
  let limit = PAGE_SIZE;
  const originalOrder = [...cards];

  function numberFromCard(card, selector) {
    const text = card.querySelector(selector)?.closest('small')?.textContent || '';
    return parseFloat(text.replace(/[^\d.]/g, '')) || 0;
  }

  function sortCards() {
    const sort = sortFilter?.value || 'recommended';
    const ordered = [...cards].sort((a, b) => {
      if (sort === 'recommended') return originalOrder.indexOf(a) - originalOrder.indexOf(b);
      if (sort === 'rating') return numberFromCard(b, '.bi-star-fill') - numberFromCard(a, '.bi-star-fill');
      if (sort === 'price-low') return numberFromCard(a, '.fw-bold.fs-6.text-center') - numberFromCard(b, '.fw-bold.fs-6.text-center');
      if (sort === 'price-high') return numberFromCard(b, '.fw-bold.fs-6.text-center') - numberFromCard(a, '.fw-bold.fs-6.text-center');
      return numberFromCard(a, '.bi-clock-fill') - numberFromCard(b, '.bi-clock-fill');
    });
    grid.append(...ordered);
  }

  function apply() {
    sortCards();
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
  sortFilter?.addEventListener('change', resetAndApply);

  loadMoreBtn?.addEventListener('click', () => {
    limit += PAGE_SIZE;
    apply();
  });

  document.getElementById('clearCourseFilters')?.addEventListener('click', () => {
    search.value = '';
    priceFilter.value = 'all';
    levelFilter.value = 'all';
    if (sortFilter) sortFilter.value = 'recommended';
    resetAndApply();
  });

  apply();
})();
