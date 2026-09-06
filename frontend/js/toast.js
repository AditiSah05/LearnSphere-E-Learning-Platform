function showToast(message, type) {
  const MAX_TOASTS = 3;
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = 1080;
    document.body.appendChild(container);
  }

  while (container.children.length >= MAX_TOASTS) {
    container.firstElementChild.remove();
  }

  const colors = { success: '#198754', error: '#dc3545', info: '#b85c24' };
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-white border-0';
  toastEl.style.backgroundColor = colors[type] || colors.info;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 2000 });
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  toast.show();
}
