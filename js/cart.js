(function () {
  const CART_KEY = 'ls_cart';
  const ENROLLED_KEY = 'ls_enrolled';

  function getEnrolled() {
    try { return JSON.parse(localStorage.getItem(ENROLLED_KEY)) || []; } catch { return []; }
  }
  function enroll(items) {
    const enrolled = getEnrolled();
    items.forEach((item) => {
      if (!enrolled.some((c) => c.title === item.title)) {
        enrolled.push({ title: item.title, img: item.img, progress: 0 });
      }
    });
    localStorage.setItem(ENROLLED_KEY, JSON.stringify(enrolled));
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBadge();
  }
  function addToCart(course) {
    const cart = getCart();
    if (cart.some((c) => c.title === course.title)) return false;
    cart.push(course);
    saveCart(cart);
    return true;
  }
  function removeFromCart(title) {
    saveCart(getCart().filter((c) => c.title !== title));
  }
  function cartTotal(cart) {
    return cart.reduce((sum, c) => sum + c.price, 0);
  }
  function updateBadge() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = getCart().length;
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateBadge();

    // Wire "Enroll Now" buttons on courses.html
    const grid = document.getElementById('courseGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.enroll-btn');
        if (!btn) return;
        e.preventDefault();
        const card = btn.closest('.course-card');
        const title = card.querySelector('h5').textContent.trim();
        const priceText = card.querySelector('.fw-bold.fs-6.text-center').textContent.trim();
        const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
        const img = card.querySelector('img').getAttribute('src');
        const originalHTML = btn.innerHTML;
        const added = addToCart({ title, price, img });
        btn.textContent = added ? 'Added ✓' : 'Already in cart';
        setTimeout(() => { btn.innerHTML = originalHTML; }, 1200);
      });
    }

    // Render cart.html
    const cartList = document.getElementById('cartList');
    if (cartList) {
      function render() {
        const cart = getCart();
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
          row.className = 'd-flex align-items-center justify-content-between border-bottom py-3';
          row.innerHTML = `
            <div class="d-flex align-items-center">
              <img src="${item.img}" alt="" style="width:70px;height:50px;object-fit:cover;" class="rounded me-3">
              <span>${item.title}</span>
            </div>
            <div class="d-flex align-items-center">
              <span class="fw-bold me-4">${item.price === 0 ? 'Free' : '₹ ' + item.price}</span>
              <button class="btn btn-sm btn-outline-danger remove-item" data-title="${item.title}">Remove</button>
            </div>`;
          cartList.appendChild(row);
        });

        totalEl.textContent = '₹ ' + cartTotal(cart);
      }

      cartList.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-item');
        if (!btn) return;
        removeFromCart(btn.dataset.title);
        render();
      });

      render();
    }

    // Render checkout.html
    const checkoutSummary = document.getElementById('checkoutSummary');
    if (checkoutSummary) {
      const cart = getCart();
      if (!cart.length) {
        window.location.href = 'cart.html';
        return;
      }
      checkoutSummary.innerHTML = cart
        .map((item) => `<div class="d-flex justify-content-between py-1"><span>${item.title}</span><span>${item.price === 0 ? 'Free' : '₹ ' + item.price}</span></div>`)
        .join('');
      document.getElementById('checkoutTotal').textContent = '₹ ' + cartTotal(cart);

      const form = document.getElementById('checkoutForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        enroll(cart);
        saveCart([]);
        document.getElementById('checkoutFormWrap').style.display = 'none';
        document.getElementById('checkoutSuccess').style.display = '';
      });
    }

    // Render dashboard.html
    const dashboardList = document.getElementById('dashboardList');
    if (dashboardList) {
      function renderDashboard() {
        const enrolled = getEnrolled();
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
          row.className = 'd-flex align-items-center border-bottom py-3';
          row.innerHTML = `
            <img src="${course.img}" alt="" style="width:90px;height:60px;object-fit:cover;" class="rounded me-3">
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between">
                <span>${course.title}</span>
                <span class="fw-bold">${course.progress}%</span>
              </div>
              <div class="progress mt-1" style="height:8px;">
                <div class="progress-bar" role="progressbar" style="width:${course.progress}%; background-color:#fb873f;"></div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-primary ms-3 mark-progress" data-title="${course.title}"
              ${course.progress >= 100 ? 'disabled' : ''}>${course.progress >= 100 ? 'Completed' : 'Mark +10%'}</button>`;
          dashboardList.appendChild(row);
        });
      }

      dashboardList.addEventListener('click', (e) => {
        const btn = e.target.closest('.mark-progress');
        if (!btn) return;
        const enrolled = getEnrolled();
        const course = enrolled.find((c) => c.title === btn.dataset.title);
        if (course) course.progress = Math.min(100, course.progress + 10);
        localStorage.setItem(ENROLLED_KEY, JSON.stringify(enrolled));
        renderDashboard();
      });

      renderDashboard();
    }
  });
})();
