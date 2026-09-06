(function () {
  const KEY = 'ls_recently_viewed';
  const MAX = 8;

  function getRecent() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }

  window.trackRecentlyViewed = function (course) {
    let list = getRecent().filter((c) => c.id !== course.id);
    list.unshift({ id: course.id, title: course.title, img: course.img });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  };

  document.addEventListener('DOMContentLoaded', () => {
    const strip = document.getElementById('recentlyViewedStrip');
    const section = document.getElementById('recentlyViewedSection');
    if (!strip || !section) return;

    const list = getRecent();
    if (!list.length) return;
    section.style.display = '';

    strip.innerHTML = list
      .map(
        (c) => `
      <a href="single.html?id=${c.id}" class="text-decoration-none text-dark flex-shrink-0" style="width:160px;">
        <img src="${c.img}" alt="${c.title}" style="width:100%;height:90px;object-fit:cover;" class="rounded mb-1">
        <div class="small">${c.title}</div>
      </a>`
      )
      .join('');
  });
})();
