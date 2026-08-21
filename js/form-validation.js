(function () {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form.needs-validation').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.classList.add('was-validated');
        if (!form.checkValidity()) return;

        const msg = document.getElementById(form.id.replace('Form', '') + 'Message');
        if (msg) {
          msg.textContent = 'Looks good! This is a demo form — connect a backend to enable real accounts.';
          msg.style.color = '#0d6efd';
          msg.style.display = 'block';
        }
      });
    });
  });
})();
