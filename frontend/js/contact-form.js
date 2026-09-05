(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('contactMessage');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        msg.textContent = 'Message sent! We\'ll get back to you soon.';
        msg.style.color = '#28a745';
        form.reset();
      } else {
        throw new Error('Send failed');
      }
    } catch {
      msg.textContent = 'Could not send message. Please try again later.';
      msg.style.color = '#dc3545';
    }
    msg.style.display = 'block';
    submitBtn.disabled = false;
  });
})();
