// ARC2263 — Afini Ubaidah AM2408016800

// ── TOAST ──────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── FADE IN ─────────────────────────────────────
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

// ── SKILL BARS ──────────────────────────────────
const barIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-bar-fill').forEach(b => b.style.width = b.dataset.width);
    }
  });
}, { threshold: 0.3 });
const skills = document.querySelector('#skills');
if (skills) barIO.observe(skills);

// ── ACTIVE NAV ──────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) cur = s.id; });
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
}, { passive: true });

// ── FOOTER YEAR ─────────────────────────────────
const yr = document.getElementById('year');
if (yr) yr.textContent = new Date().getFullYear();

// ── PROJECTS (localStorage) ──────────────────────
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  const projects = JSON.parse(localStorage.getItem('afini_projects') || '[]');
  if (!projects.length) {
    grid.innerHTML = `<div class="no-projects"><span>No projects yet</span>Add your first project from the admin panel</div>`;
    return;
  }
  grid.innerHTML = projects.map((p, i) => `
    <div class="project-card">
      <div class="project-num">_0${i+1}.</div>
      <div class="project-info">
        <div class="project-tag">${p.type || 'Project'}</div>
        <div class="project-name">${p.name}</div>
        <div class="project-desc">${p.desc}</div>
      </div>
      ${p.url ? `<a href="${p.url}" target="_blank" class="project-link">View <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg></a>` : ''}
    </div>
  `).join('');
}
renderProjects();

// ── REVIEWS (Firebase) ───────────────────────────
let selectedStars = 0;

// Star selector
document.querySelectorAll('.star-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedStars = parseInt(btn.dataset.val);
    document.querySelectorAll('.star-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.val) <= selectedStars);
    });
  });
});

function renderReviews(reviews) {
  const list = document.getElementById('reviews-list');
  if (!list) return;
  if (!reviews.length) {
    list.innerHTML = `<div class="no-reviews"><span>No reviews yet</span>Be the first to leave a review below!</div>`;
    return;
  }
  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-name">${r.name}</div>
        <div class="review-date">${r.date}</div>
      </div>
      <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <div class="review-text">${r.text}</div>
    </div>
  `).join('');
}

// Load reviews from Firebase
function loadReviews() {
  try {
    db.collection('reviews').orderBy('timestamp', 'desc').onSnapshot(snap => {
      const reviews = snap.docs.map(d => d.data());
      renderReviews(reviews);
    });
  } catch(e) {
    console.warn('Firebase not configured yet:', e.message);
  }
}
loadReviews();

// Submit review
const submitBtn = document.getElementById('submit-review');
if (submitBtn) {
  submitBtn.addEventListener('click', async () => {
    const name = document.getElementById('rv-name').value.trim();
    const text = document.getElementById('rv-text').value.trim();
    if (!name) return showToast('Please enter your name');
    if (!selectedStars) return showToast('Please select a star rating');
    if (!text) return showToast('Please write a review');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      await db.collection('reviews').add({
        name, text, stars: selectedStars,
        date: new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      document.getElementById('rv-name').value = '';
      document.getElementById('rv-text').value = '';
      selectedStars = 0;
      document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
      showToast('Review submitted! Thank you ✓');
    } catch(e) {
      showToast('Firebase not set up yet. See firebase-config.js');
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit Review`;
  });
}

// ── PARTICLE ANIMATION ───────────────────────
const canvas  = document.getElementById('particle-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.r  = Math.random() * 3 + 1.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 8000);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  animate();
}
