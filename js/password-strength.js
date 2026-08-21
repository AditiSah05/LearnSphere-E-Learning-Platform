(function () {
  const input = document.getElementById('password');
  const wrap = document.getElementById('pwStrengthWrap');
  if (!input || !wrap) return;

  const bar = document.getElementById('pwStrengthBar');
  const label = document.getElementById('pwStrengthLabel');

  const LEVELS = [
    { min: 0, text: 'Very Weak', color: '#dc3545', width: 20 },
    { min: 2, text: 'Weak', color: '#fd7e14', width: 40 },
    { min: 3, text: 'Fair', color: '#ffc107', width: 60 },
    { min: 4, text: 'Good', color: '#0dcaf0', width: 80 },
    { min: 5, text: 'Strong', color: '#198754', width: 100 },
  ];

  function score(pw) {
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  }

  input.addEventListener('input', () => {
    const pw = input.value;
    if (!pw) {
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = 'block';
    const s = score(pw);
    const level = LEVELS.slice().reverse().find((l) => s >= l.min) || LEVELS[0];
    bar.style.width = level.width + '%';
    bar.style.backgroundColor = level.color;
    label.textContent = level.text;
    label.style.color = level.color;
  });
})();
