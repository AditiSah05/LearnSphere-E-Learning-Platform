(function () {
  const WISHLIST_KEY = 'ls_wishlist';

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; } catch { return []; }
  }
  function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    updateBadge();
  }
  function toggleWishlist(course) {
    const list = getWishlist();
    const idx = list.findIndex((c) => c.title === course.title);
    if (idx === -1) {
      list.push(course);
      saveWishlist(list);
      return true;
    }
    list.splice(idx, 1);
    saveWishlist(list);
    return false;
  }
  function removeFromWishlist(title) {
    saveWishlist(getWishlist().filter((c) => c.title !== title));
  }
  function updateBadge() {
    const badge = document.getElementById('wishlistCount');
    if (badge) badge.textContent = getWishlist().length;
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateBadge();

    // Wire heart buttons on courses.html
    const grid = document.getElementById('courseGrid');
    if (grid) {
      const wishlist = getWishlist();
      grid.querySelectorAll('.course-card').forEach((card) => {
        const btn = card.querySelector('.wishlist-btn');
        const title = card.querySelector('h5').textContent.trim();
        if (wishlist.some((c) => c.title === title)) {
          btn.classList.remove('far');
          btn.classList.add('fas');
        }
      });

      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.wishlist-btn');
        if (!btn) return;
        e.preventDefault();
        const card = btn.closest('.course-card');
        const title = card.querySelector('h5').textContent.trim();
        const priceText = card.querySelector('.fw-bold.fs-6.text-center').textContent.trim();
        const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
        const img = card.querySelector('img').getAttribute('src');
        const saved = toggleWishlist({ title, price, img });
        btn.classList.toggle('fas', saved);
        btn.classList.toggle('far', !saved);
      });
    }

    // Render wishlist.html
    const wishlistList = document.getElementById('wishlistList');
    if (wishlistList) {
      function render() {
        const list = getWishlist();
        const empty = document.getElementById('wishlistEmpty');
        wishlistList.innerHTML = '';

        if (!list.length) {
          empty.style.display = '';
          return;
        }
        empty.style.display = 'none';

        list.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'd-flex align-items-center justify-content-between border-bottom py-3';
          row.innerHTML = `
            <div class="d-flex align-items-center">
              <img src="${item.img}" alt="" style="width:70px;height:50px;object-fit:cover;" class="rounded me-3">
              <span>${item.title}</span>
            </div>
            <div class="d-flex align-items-center">
              <span class="fw-bold me-4">${item.price === 0 ? 'Free' : '₹ ' + item.price}</span>
              <button class="btn btn-sm btn-primary me-2 move-to-cart" data-title="${item.title}" data-price="${item.price}" data-img="${item.img}">Add to Cart</button>
              <button class="btn btn-sm btn-outline-danger remove-item" data-title="${item.title}">Remove</button>
            </div>`;
          wishlistList.appendChild(row);
        });
      }

      wishlistList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-item');
        if (removeBtn) {
          removeFromWishlist(removeBtn.dataset.title);
          render();
          return;
        }
        const cartBtn = e.target.closest('.move-to-cart');
        if (cartBtn) {
          window.LSCart.addToCart({ title: cartBtn.dataset.title, price: Number(cartBtn.dataset.price), img: cartBtn.dataset.img });
          cartBtn.textContent = 'Added ✓';
          setTimeout(() => { cartBtn.textContent = 'Add to Cart'; }, 1200);
        }
      });

      render();
    }
  });
})();
