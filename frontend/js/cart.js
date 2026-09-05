(function () {
  const API_BASE = 'http://localhost:5000/api';

  function token() { return localStorage.getItem('token'); }
  function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }; }
  function requireLogin() {
    if (token()) return true;
    showToast('Please login to continue', 'info');
    setTimeout(() => (window.location.href = 'login.html'), 600);
    return false;
  }

  async function getCart() {
    const res = await fetch(`${API_BASE}/cart`, { headers: authHeaders() });
    if (!res.ok) return [];
    return (await res.json()).items;
  }
  async function addToCart(course) {
    const res = await fetch(`${API_BASE}/cart`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(course) });
    const data = await res.json();
    updateBadge();
    return data.added;
  }
  async function removeFromCart(title) {
    await fetch(`${API_BASE}/cart/${encodeURIComponent(title)}`, { method: 'DELETE', headers: authHeaders() });
    updateBadge();
  }
  window.LSCart = { addToCart, getCart, requireLogin };

  function cartTotal(cart) {
    return cart.reduce((sum, c) => sum + c.price, 0);
  }
  async function updateBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    badge.textContent = token() ? (await getCart()).length : 0;
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateBadge();

    // Wire "Enroll Now" buttons on courses.html
    const grid = document.getElementById('courseGrid');
    if (grid) {
      grid.addEventListener('click', async (e) => {
        const btn = e.target.closest('.enroll-btn');
        if (!btn) return;
        e.preventDefault();
        if (!requireLogin()) return;
        const card = btn.closest('.course-card');
        const title = card.querySelector('h5').textContent.trim();
        const priceText = card.querySelector('.fw-bold.fs-6.text-center').textContent.trim();
        const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
        const img = card.querySelector('img').getAttribute('src');
        const added = await addToCart({ title, price, img });
        showToast(added ? `${title} added to cart` : `${title} is already in your cart`, added ? 'success' : 'info');
      });
    }

    // Render cart.html
    const cartList = document.getElementById('cartList');
    if (cartList) {
      if (!requireLogin()) return;

      async function render() {
        const cart = await getCart();
        const empty = document.getElementById('cartEmpty');
        const totalEl = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        cartList.innerHTML = '';

        if (!cart.length) {
          empty.style.display = '';
          totalEl.textContent = '₹ 0';
          checkoutBtn.classList.add('disabled');
          return;
        }
        empty.style.display = 'none';
        checkoutBtn.classList.remove('disabled');

        cart.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'd-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom py-3';
          row.innerHTML = `
            <div class="d-flex align-items-center">
              <img src="${item.img}" alt="" style="width:70px;height:50px;object-fit:cover;" class="rounded me-3">
              <span>${item.title}</span>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2">
              <span class="fw-bold me-4">${item.price === 0 ? 'Free' : '₹ ' + item.price}</span>
              <button class="btn btn-sm btn-outline-danger remove-item" data-title="${item.title}">Remove</button>
            </div>`;
          cartList.appendChild(row);
        });

        totalEl.textContent = '₹ ' + cartTotal(cart);
      }

      cartList.addEventListener('click', async (e) => {
        const btn = e.target.closest('.remove-item');
        if (!btn) return;
        await removeFromCart(btn.dataset.title);
        render();
      });

      render();
    }

    // Render checkout.html
    const checkoutSummary = document.getElementById('checkoutSummary');
    if (checkoutSummary) {
      if (!requireLogin()) return;

      (async () => {
        const cart = await getCart();
        if (!cart.length) {
          window.location.href = 'cart.html';
          return;
        }
        checkoutSummary.innerHTML = cart
          .map((item) => `<div class="d-flex justify-content-between py-1"><span>${item.title}</span><span>${item.price === 0 ? 'Free' : '₹ ' + item.price}</span></div>`)
          .join('');
        document.getElementById('checkoutTotal').textContent = '₹ ' + cartTotal(cart);

        const form = document.getElementById('checkoutForm');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
          }
          await fetch(`${API_BASE}/cart/checkout`, { method: 'POST', headers: authHeaders() });
          updateBadge();
          document.getElementById('checkoutFormWrap').style.display = 'none';
          document.getElementById('checkoutSuccess').style.display = '';
        });
      })();
    }

    // Render dashboard.html
    const dashboardList = document.getElementById('dashboardList');
    if (dashboardList) {
      if (!requireLogin()) return;

      async function getEnrolled() {
        const res = await fetch(`${API_BASE}/enrollment`, { headers: authHeaders() });
        if (!res.ok) return [];
        return (await res.json()).enrolled;
      }

      async function renderDashboard() {
        const enrolled = await getEnrolled();
        const empty = document.getElementById('dashboardEmpty');
        const statTotal = document.getElementById('statTotal');
        const statCompleted = document.getElementById('statCompleted');
        const statAvg = document.getElementById('statAvg');
        dashboardList.innerHTML = '';

        if (!enrolled.length) {
          empty.style.display = '';
          statTotal.textContent = '0';
          statCompleted.textContent = '0';
          statAvg.textContent = '0%';
          return;
        }
        empty.style.display = 'none';

        statTotal.textContent = enrolled.length;
        statCompleted.textContent = enrolled.filter((c) => c.progress >= 100).length;
        statAvg.textContent = Math.round(enrolled.reduce((s, c) => s + c.progress, 0) / enrolled.length) + '%';

        enrolled.forEach((course) => {
          const row = document.createElement('div');
          row.className = 'd-flex flex-wrap align-items-center gap-2 border-bottom py-3';
          row.innerHTML = `
            <img src="${course.img}" alt="" style="width:90px;height:60px;object-fit:cover;" class="rounded me-3">
            <div class="flex-grow-1" style="min-width:180px;">
              <div class="d-flex justify-content-between">
                <span>${course.title}</span>
                <span class="fw-bold">${course.progress}%</span>
              </div>
              <div class="progress mt-1" style="height:8px;">
                <div class="progress-bar" role="progressbar" style="width:${course.progress}%; background-color:#fb873f;"></div>
              </div>
            </div>
            <a class="btn btn-sm btn-primary ms-3" href="learn.html?title=${encodeURIComponent(course.title)}">Continue Learning</a>
            <button class="btn btn-sm btn-outline-primary ms-2 mark-progress" data-title="${course.title}"
              ${course.progress >= 100 ? 'disabled' : ''}>${course.progress >= 100 ? 'Completed' : 'Mark +10%'}</button>
            ${course.progress >= 100 ? `<button class="btn btn-sm btn-primary ms-2 download-certificate" data-title="${course.title}">🎓 Certificate</button>` : ''}`;
          dashboardList.appendChild(row);
        });
      }

      dashboardList.addEventListener('click', async (e) => {
        const certBtn = e.target.closest('.download-certificate');
        if (certBtn) {
          window.generateCertificate(certBtn.dataset.title);
          return;
        }
        const btn = e.target.closest('.mark-progress');
        if (!btn) return;
        await fetch(`${API_BASE}/enrollment/${encodeURIComponent(btn.dataset.title)}/progress`, { method: 'PATCH', headers: authHeaders() });
        renderDashboard();
      });

      renderDashboard();
    }
  });
})();
