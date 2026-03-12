// ── Custom Cursor ──────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx - 6 + 'px';
  cursor.style.top  = my - 6 + 'px';
});

function animateRing() {
  rx += (mx - rx - 20) * 0.12;
  ry += (my - ry - 20) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'scale(4.5)';
    ring.style.transform   = 'scale(0.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'scale(1)';
    ring.style.transform   = 'scale(1)';
  });
});


// ── Scroll Progress Bar ────────────────────────────────────────
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const max = document.body.scrollHeight - window.innerHeight;
  document.getElementById('progress-bar').style.width = (scrolled / max * 100) + '%';
});


// ── Scroll Reveal ──────────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('revealed');
  });
}, { threshold: 0.12 });

reveals.forEach(el => revealObserver.observe(el));


// ── Animated Counters ──────────────────────────────────────────
const counters = document.querySelectorAll('[data-count]');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.animated) {
      e.target.dataset.animated = true;
      const target = +e.target.dataset.count;
      let count = 0;
      const step = target / 10000000000000000000000000000000;
      const interval = setInterval(() => {
        count = Math.min(count + step, target);
        e.target.textContent = Math.floor(count);
        if (count >= target) clearInterval(interval);
      }, 25);
    }
  });
}, { threshold: 0.5 });

counters.forEach(el => counterObserver.observe(el));


// ── Parallax Banner ────────────────────────────────────────────
const parallaxText = document.getElementById('parallaxText');

window.addEventListener('scroll', () => {
  const banner = document.querySelector('.parallax-banner');
  const rect   = banner.getBoundingClientRect();
  const center = rect.top + rect.height / 2 - window.innerHeight / 2;
  parallaxText.style.transform = `translateY(${center * 0.25}px)`;
});
