(function () {
  const btn = document.getElementById('shareCourseBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const title = document.getElementById('courseTitle')?.textContent.trim() || 'this course';
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: `LearnSphere: ${title}`, url });
      } catch {}
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      if (typeof showToast === 'function') showToast('Course link copied to clipboard!', 'success');
    } catch {
      if (typeof showToast === 'function') showToast('Could not copy link.', 'error');
    }
  });
})();
