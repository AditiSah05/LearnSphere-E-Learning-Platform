(function () {
  const API_BASE = 'http://localhost:5000/api/auth';

  function showMessage(el, text, ok) {
    el.textContent = text;
    el.style.color = ok ? '#198754' : '#dc3545';
    el.style.display = 'block';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;

      const msg = document.getElementById('forgotMessage');
      const email = document.getElementById('email').value.trim();

      try {
        const res = await fetch(`${API_BASE}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        showMessage(msg, data.message || 'Request sent.', res.ok);
        if (res.ok) form.reset();
      } catch {
        showMessage(msg, 'Could not reach server. Is the backend running?', false);
      }
    });
  });
})();
