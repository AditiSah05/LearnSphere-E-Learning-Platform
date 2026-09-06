(function () {
  const API_BASE = 'http://localhost:5000/api';

  function token() { return localStorage.getItem('token'); }
  function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }; }
  function requireLogin() {
    if (token()) return true;
    if (typeof showToast === 'function') showToast('Please login to continue', 'info');
    setTimeout(() => (window.location.href = 'login.html'), 600);
    return false;
  }

  async function getWishlist() {
    try {
      const res = await fetch(`${API_BASE}/wishlist`, { headers: authHeaders() });
      if (!res.ok) return null;
      return (await res.json()).items;
    } catch {
      return null;
    }
  }
  async function toggleWishlist(course) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(course) });
    const data = await res.json();
    updateBadge(data.saved);
    return data.saved;
  }
  async function removeFromWishlist(title) {
    await fetch(`${API_BASE}/wishlist/${encodeURIComponent(title)}`, { method: 'DELETE', headers: authHeaders() });
    updateBadge();
  }
  async function updateBadge(pulse) {
    const badge = document.getElementById('wishlistCount');
    if (!badge) return;
    badge.textContent = token() ? (await getWishlist() || []).length : 0;
    if (pulse) {
      badge.classList.remove('badge-pulse');
      void badge.offsetWidth;
      badge.classList.add('badge-pulse');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateBadge();

    // Wire heart buttons on courses.html
    const grid = document.getElementById('courseGrid');
    if (grid) {
      (async () => {
        if (!token()) return;
        const wishlist = await getWishlist();
        if (!wishlist) return;
        grid.querySelectorAll('.course-card').forEach((card) => {
          const btn = card.querySelector('.wishlist-btn');
          const title = card.querySelector('h5').textContent.trim();
          btn.setAttribute('aria-label', `Add ${title} to wishlist`);
          if (wishlist.some((c) => c.title === title)) {
            btn.classList.remove('bi-heart');
            btn.classList.add('bi-heart-fill');
            btn.setAttribute('aria-label', `Remove ${title} from wishlist`);
          }
        });
      })();

      grid.addEventListener('click', async (e) => {
        const btn = e.target.closest('.wishlist-btn');
        if (!btn) return;
        e.preventDefault();
        if (!requireLogin()) return;
        const card = btn.closest('.course-card');
        const title = card.querySelector('h5').textContent.trim();
        const priceText = card.querySelector('.fw-bold.fs-6.text-center').textContent.trim();
        const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
        const img = card.querySelector('img').getAttribute('src');
        const saved = await toggleWishlist({ title, price, img });
        btn.classList.toggle('bi-heart-fill', saved);
        btn.classList.toggle('bi-heart', !saved);
        btn.setAttribute('aria-label', saved ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`);
      });
    }

    // Render wishlist.html
    const wishlistList = document.getElementById('wishlistList');
    if (wishlistList) {
      if (!requireLogin()) return;

      async function render() {
        const list = await getWishlist();
        const empty = document.getElementById('wishlistEmpty');
        const errorEl = document.getElementById('wishlistError');
        wishlistList.innerHTML = '';

        if (list === null) {
          errorEl.style.display = '';
          empty.style.display = 'none';
          return;
        }
        errorEl.style.display = 'none';

        if (!list.length) {
          empty.style.display = '';
          return;
        }
        empty.style.display = 'none';

        list.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'd-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom py-3';
          row.innerHTML = `
            <div class="d-flex align-items-center">
              <img src="${item.img}" alt="${item.title}" style="width:70px;height:50px;object-fit:cover;" class="rounded me-3">
              <span>${item.title}</span>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2">
              <span class="fw-bold me-4">${item.price === 0 ? 'Free' : '₹ ' + item.price}</span>
              <button class="btn btn-sm btn-primary me-2 move-to-cart" data-title="${item.title}" data-price="${item.price}" data-img="${item.img}">Add to Cart</button>
              <button class="btn btn-sm btn-outline-danger remove-item" data-title="${item.title}">Remove</button>
            </div>`;
          wishlistList.appendChild(row);
        });
      }

      wishlistList.addEventListener('click', async (e) => {
        const removeBtn = e.target.closest('.remove-item');
        if (removeBtn) {
          await removeFromWishlist(removeBtn.dataset.title);
          render();
          return;
        }
        const cartBtn = e.target.closest('.move-to-cart');
        if (cartBtn) {
          await window.LSCart.addToCart({ title: cartBtn.dataset.title, price: Number(cartBtn.dataset.price), img: cartBtn.dataset.img });
          showToast(`${cartBtn.dataset.title} added to cart`, 'success');
        }
      });

      document.getElementById('wishlistRetryBtn')?.addEventListener('click', render);

      render();
    }
  });
})();
