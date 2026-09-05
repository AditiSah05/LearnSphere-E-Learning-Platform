(function () {
  const API_BASE = 'http://localhost:5000/api/auth';

  function showMessage(el, text, ok) {
    el.textContent = text;
    el.style.color = ok ? '#198754' : '#dc3545';
    el.style.display = 'block';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        loginForm.classList.add('was-validated');
        if (!loginForm.checkValidity()) return;

        const msg = document.getElementById('loginMessage');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
          const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) return showMessage(msg, data.message || 'Login failed', false);

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          showMessage(msg, 'Login successful! Redirecting...', true);
          setTimeout(() => (window.location.href = 'dashboard.html'), 800);
        } catch {
          showMessage(msg, 'Could not reach server. Is the backend running?', false);
        }
      });
    }

    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        signupForm.classList.add('was-validated');
        if (!signupForm.checkValidity()) return;

        const msg = document.getElementById('signupMessage');
        const name = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
          const res = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!res.ok) return showMessage(msg, data.message || 'Signup failed', false);

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          showMessage(msg, 'Account created! Redirecting...', true);
          setTimeout(() => (window.location.href = 'dashboard.html'), 800);
        } catch {
          showMessage(msg, 'Could not reach server. Is the backend running?', false);
        }
      });
    }
  });
})();
