(function () {
  const API_BASE = 'http://localhost:5000/api/auth';

  function showMessage(el, text, ok) {
    el.textContent = text;
    el.style.color = ok ? '#198754' : '#dc3545';
    el.style.display = 'block';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetForm');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const msg = document.getElementById('resetMessage');

    if (!token) {
      showMessage(msg, 'This reset link is missing its token. Request a new one.', false);
      form.querySelector('button[type="submit"]').disabled = true;
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        document.getElementById('confirmPassword').setCustomValidity('mismatch');
      } else {
        document.getElementById('confirmPassword').setCustomValidity('');
      }
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;

      try {
        const res = await fetch(`${API_BASE}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();
        showMessage(msg, data.message || 'Request failed.', res.ok);
        if (res.ok) setTimeout(() => (window.location.href = 'login.html'), 1200);
      } catch {
        showMessage(msg, 'Could not reach server. Is the backend running?', false);
      }
    });
  });
})();
