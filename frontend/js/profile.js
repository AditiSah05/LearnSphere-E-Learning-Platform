(function () {
  const API_BASE = 'http://localhost:5000/api/auth';
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('profileForm');
  const message = document.getElementById('profileMessage');
  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const avatar = document.getElementById('profileAvatar');
  const saveButton = document.getElementById('saveProfileBtn');

  function headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `alert alert-${type}`;
  }

  function populate(user) {
    nameInput.value = user.name;
    emailInput.value = user.email;
    avatar.textContent = user.name.trim().charAt(0).toUpperCase();
  }

  async function loadProfile() {
    try {
      const response = await fetch(`${API_BASE}/me`, { headers: headers() });
      if (!response.ok) throw new Error('Could not load your profile.');
      populate((await response.json()).user);
    } catch (error) {
      showMessage(error.message, 'danger');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.classList.add('was-validated');

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!form.checkValidity()) return;
    if (newPassword && newPassword !== confirmPassword) {
      showMessage('New passwords do not match.', 'danger');
      return;
    }
    if (newPassword && !currentPassword) {
      showMessage('Enter your current password to set a new one.', 'danger');
      return;
    }

    saveButton.disabled = true;
    saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Saving...';
    try {
      const response = await fetch(`${API_BASE}/me`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ name: nameInput.value.trim(), currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not save your changes.');

      localStorage.setItem('user', JSON.stringify(data.user));
      populate(data.user);
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
      form.classList.remove('was-validated');
      showMessage('Your profile has been updated.', 'success');
    } catch (error) {
      showMessage(error.message, 'danger');
    } finally {
      saveButton.disabled = false;
      saveButton.innerHTML = '<i class="bi bi-check2 me-2" aria-hidden="true"></i>Save changes';
    }
  });

  loadProfile();
})();
