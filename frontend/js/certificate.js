window.generateCertificate = function (courseTitle) {
  const name = prompt('Enter your name for the certificate:', 'LearnSphere Learner');
  if (name === null) return;
  const learnerName = name.trim() || 'LearnSphere Learner';

  const canvas = document.createElement('canvas');
  canvas.width = 1100;
  canvas.height = 780;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#fdfaf6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer border
  ctx.strokeStyle = '#b85c24';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Inner border
  ctx.strokeStyle = '#181d38';
  ctx.lineWidth = 2;
  ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

  ctx.textAlign = 'center';

  // Brand
  ctx.fillStyle = '#b85c24';
  ctx.font = 'bold 32px Georgia, serif';
  ctx.fillText('LearnSphere', canvas.width / 2, 140);

  // Title
  ctx.fillStyle = '#181d38';
  ctx.font = 'bold 46px Georgia, serif';
  ctx.fillText('Certificate of Completion', canvas.width / 2, 220);

  // Subtitle
  ctx.font = '22px Georgia, serif';
  ctx.fillText('This certifies that', canvas.width / 2, 300);

  // Name
  ctx.fillStyle = '#b85c24';
  ctx.font = 'italic bold 44px Georgia, serif';
  ctx.fillText(learnerName, canvas.width / 2, 370);

  // Body
  ctx.fillStyle = '#181d38';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('has successfully completed the course', canvas.width / 2, 430);

  // Course title
  ctx.font = 'bold 30px Georgia, serif';
  wrapText(ctx, courseTitle, canvas.width / 2, 480, 900, 38);

  // Date
  const date = new Date().toISOString().split('T')[0];
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Issued on ${date}`, canvas.width / 2, 600);

  // Seal
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 670, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#b85c24';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText('✓', canvas.width / 2, 683);

  showCertificatePreview(canvas, courseTitle);
};

function showCertificatePreview(canvas, courseTitle) {
  let modalEl = document.getElementById('certificatePreviewModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'certificatePreviewModal';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Your Certificate</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <img id="certificatePreviewImg" class="img-fluid border" alt="Certificate preview">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn text-light" id="certificateDownloadBtn">Download</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modalEl);
  }

  const dataUrl = canvas.toDataURL('image/png');
  modalEl.querySelector('#certificatePreviewImg').src = dataUrl;
  modalEl.querySelector('#certificateDownloadBtn').onclick = () => {
    const link = document.createElement('a');
    link.download = `LearnSphere-Certificate-${courseTitle.replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  };

  new bootstrap.Modal(modalEl).show();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  words.forEach((word) => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word + ' ';
    } else {
      line = test;
    }
  });
  lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, startY + i * lineHeight));
}
