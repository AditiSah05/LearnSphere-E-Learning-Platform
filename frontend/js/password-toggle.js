(function () {
  function toggle(icon) {
    const input = document.getElementById(icon.dataset.target);
    if (!input) return;
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    icon.classList.toggle('fa-eye', showing);
    icon.classList.toggle('fa-eye-slash', !showing);
    icon.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  }

  document.querySelectorAll('.toggle-password').forEach((icon) => {
    icon.addEventListener('click', () => toggle(icon));
    icon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(icon);
      }
    });
  });
})();
