/* =====================================================
   AA-B-I-XES — Enhanced Script
   Three.js 3D · Scroll Animations · Cursor · Typewriter
   Monogram Canvas · Counter · Timeline · Parallax
   ===================================================== */

// ─── PRELOADER ────────────────────────────────────────
const preloader = document.getElementById('preloader');
const fillEl    = document.getElementById('preloaderFill');
const pctEl     = document.getElementById('preloaderPct');
let pct = 0;

const preInterval = setInterval(() => {
  pct += Math.random() * 6 + 2;
  if (pct >= 100) { pct = 100; clearInterval(preInterval); finishPreload(); }
  fillEl.style.width = pct + '%';
  pctEl.textContent  = Math.floor(pct) + '%';
}, 55);

function finishPreload() {
  setTimeout(() => {
    preloader.classList.add('out');
    setTimeout(() => {
      preloader.style.display = 'none';
      startHeroReveal();
    }, 900);
  }, 400);
}

// ─── THREE.JS ─────────────────────────────────────────
const canvas   = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 18);

// Fog
scene.fog = new THREE.FogExp2(0x080706, 0.012);

// Lights
const amb = new THREE.AmbientLight(0x1a120a, 1.0);
scene.add(amb);
const gl1 = new THREE.PointLight(0xb8965a, 3, 70); gl1.position.set(8, 10, 10); scene.add(gl1);
const gl2 = new THREE.PointLight(0x7a6038, 1.8, 55); gl2.position.set(-10, -8, 8); scene.add(gl2);
const gl3 = new THREE.PointLight(0x3d2510, 1.2, 40); gl3.position.set(0, 15, -6); scene.add(gl3);

// Materials
const mGold = new THREE.MeshStandardMaterial({ color: 0xb8965a, metalness: 0.95, roughness: 0.12 });
const mDark = new THREE.MeshStandardMaterial({ color: 0x7a5a30, metalness: 0.9,  roughness: 0.28 });
const mWire = new THREE.MeshBasicMaterial({ color: 0xb8965a, wireframe: true, transparent: true, opacity: 0.055 });
const mObsi = new THREE.MeshStandardMaterial({ color: 0x1c1710, metalness: 0.75, roughness: 0.18 });

// Central Icosahedron
const icoGeo  = new THREE.IcosahedronGeometry(3.0, 1);
const icoMesh = new THREE.Mesh(icoGeo, mGold);
const icoWire = new THREE.Mesh(icoGeo, mWire);
icoWire.scale.setScalar(1.05);
scene.add(icoMesh, icoWire);

// Inner tetrahedron
const tetraGeo  = new THREE.TetrahedronGeometry(1.8, 0);
const tetraMesh = new THREE.Mesh(tetraGeo, mDark);
scene.add(tetraMesh);

// Outer dodecahedron wire
const dodecGeo  = new THREE.DodecahedronGeometry(4.5, 0);
const dodecWire = new THREE.Mesh(dodecGeo, new THREE.MeshBasicMaterial({ color: 0xb8965a, wireframe: true, transparent: true, opacity: 0.03 }));
scene.add(dodecWire);

// Rings
function mkRing(r, thick, segs, color, opacity, tiltX, tiltY) {
  const geo  = new THREE.TorusGeometry(r, thick, 4, segs);
  const mat  = new THREE.MeshStandardMaterial({ color, metalness: 0.92, roughness: 0.1, transparent: true, opacity });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = tiltX;
  mesh.rotation.y = tiltY;
  return mesh;
}
const ringGroup = new THREE.Group();
ringGroup.add(
  mkRing(5.0, 0.055, 128, 0xb8965a, 0.75, Math.PI / 3,    0.3),
  mkRing(6.5, 0.045, 100, 0x7a6038, 0.55, -Math.PI / 4,   0.9),
  mkRing(8.2, 0.035, 80,  0x3d3020, 0.38, Math.PI / 6,   -0.5),
  mkRing(10.0,0.025, 60,  0x2a2010, 0.22, Math.PI / 2.5,  1.2)
);
scene.add(ringGroup);

// Particles
const N = 900;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(N * 3);
for (let i = 0; i < N; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(Math.random() * 2 - 1);
  const r     = 10 + Math.random() * 65;
  pPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
  pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
  pPos[i*3+2] = r * Math.cos(phi);
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
const pMat  = new THREE.PointsMaterial({ color: 0xb8965a, size: 0.055, transparent: true, opacity: 0.5, sizeAttenuation: true });
const parts = new THREE.Points(pGeo, pMat);
scene.add(parts);

// Second particle layer (dimmer, larger)
const p2Geo = new THREE.BufferGeometry();
const p2Pos = new Float32Array(200 * 3);
for (let i = 0; i < 200; i++) {
  p2Pos[i*3]   = (Math.random() - 0.5) * 120;
  p2Pos[i*3+1] = (Math.random() - 0.5) * 120;
  p2Pos[i*3+2] = (Math.random() - 0.5) * 80;
}
p2Geo.setAttribute('position', new THREE.BufferAttribute(p2Pos, 3));
const p2Mat  = new THREE.PointsMaterial({ color: 0xd4af72, size: 0.12, transparent: true, opacity: 0.15, sizeAttenuation: true });
const parts2 = new THREE.Points(p2Geo, p2Mat);
scene.add(parts2);

// Floating gems
const gemsGroup = new THREE.Group();
const gemShapes = [
  new THREE.OctahedronGeometry(1, 0),
  new THREE.TetrahedronGeometry(1, 0),
  new THREE.IcosahedronGeometry(1, 0),
];
for (let i = 0; i < 22; i++) {
  const size = Math.random() * 0.32 + 0.08;
  const geo  = gemShapes[Math.floor(Math.random() * gemShapes.length)].clone();
  const mat  = Math.random() > 0.5 ? mGold : mDark;
  const mesh = new THREE.Mesh(geo, mat);
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(Math.random() * 2 - 1);
  const r     = 7 + Math.random() * 14;
  mesh.position.set(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
  mesh.scale.setScalar(size);
  mesh.userData.spd  = Math.random() * 0.5 + 0.1;
  mesh.userData.axis = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
  mesh.userData.orbSpd = (Math.random() - 0.5) * 0.009;
  gemsGroup.add(mesh);
}
scene.add(gemsGroup);

// Spiral line
const spiralPts = [];
for (let i = 0; i < 400; i++) {
  const t = i / 400;
  const angle = t * Math.PI * 16;
  const r = 4 + t * 8;
  spiralPts.push(new THREE.Vector3(
    r * Math.cos(angle),
    (t - 0.5) * 20,
    r * Math.sin(angle)
  ));
}
const spiralGeo = new THREE.BufferGeometry().setFromPoints(spiralPts);
const spiralMat = new THREE.LineBasicMaterial({ color: 0xb8965a, transparent: true, opacity: 0.07 });
const spiral    = new THREE.Line(spiralGeo, spiralMat);
scene.add(spiral);

// ─── SCROLL STATE ─────────────────────────────────────
let scrollY = 0, smoothScrollY = 0;
const getMaxScroll = () => document.body.scrollHeight - window.innerHeight;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  const prog = scrollY / getMaxScroll();
  document.getElementById('scrollProgress').style.width = prog * 100 + '%';
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 60);
  checkReveals();
  checkStats();
  checkTimeline();
  checkDecode();
});

// ─── THREE.JS ANIMATION LOOP ──────────────────────────
const clock = new THREE.Clock();
let mx = 0, my = 0, tmx = 0, tmy = 0;

document.addEventListener('mousemove', e => {
  tmx = (e.clientX / window.innerWidth  - 0.5) * 2;
  tmy = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  clock.getDelta();

  mx += (tmx - mx) * 0.035;
  my += (tmy - my) * 0.035;
  smoothScrollY += (scrollY - smoothScrollY) * 0.055;

  const sn = smoothScrollY / getMaxScroll();

  // Camera
  camera.position.x = Math.sin(sn * Math.PI * 2) * 5 + mx * 1.8;
  camera.position.y = -sn * 8 + my * 1.5;
  camera.position.z = 18 - sn * 7 + Math.sin(t * 0.15) * 0.5;
  camera.fov = 60 + sn * 18;
  camera.updateProjectionMatrix();
  camera.lookAt(scene.position);

  // Central objects
  icoMesh.rotation.x = t * 0.1 + sn * Math.PI * 1.2;
  icoMesh.rotation.y = t * 0.16 + sn * Math.PI * 0.5;
  icoWire.rotation.copy(icoMesh.rotation);

  tetraMesh.rotation.x = -t * 0.2;
  tetraMesh.rotation.y =  t * 0.3 + sn * 2;

  dodecWire.rotation.x = t * 0.05;
  dodecWire.rotation.y = t * 0.07 + sn * 1.5;

  const pulse = 1 + Math.sin(t * 0.9) * 0.03;
  icoMesh.scale.setScalar(pulse);
  icoWire.scale.setScalar(pulse * 1.05);

  // Rings
  ringGroup.rotation.y = t * 0.055 + sn * Math.PI * 0.7;
  ringGroup.rotation.x = t * 0.035 + my * 0.18;
  ringGroup.children[0].rotation.z =  t * 0.14;
  ringGroup.children[1].rotation.z = -t * 0.1;
  ringGroup.children[2].rotation.z =  t * 0.08;
  ringGroup.children[3].rotation.z = -t * 0.06;

  // Particles
  parts.rotation.y  = t * 0.012;
  parts.rotation.x  = sn * 1.4;
  parts2.rotation.y = -t * 0.008;
  parts2.rotation.z = t * 0.005;
  pMat.opacity = Math.max(0.2, 0.5 - sn * 0.25);

  // Gems
  gemsGroup.children.forEach(g => {
    g.rotation.x += g.userData.spd * 0.013;
    g.rotation.y += g.userData.spd * 0.011;
    g.position.applyAxisAngle(g.userData.axis, g.userData.orbSpd);
  });

  // Spiral
  spiral.rotation.y = t * 0.04;
  spiralMat.opacity = 0.07 + Math.sin(t * 0.5) * 0.03;

  // Lights dance
  gl1.position.x = Math.sin(t * 0.28) * 12;
  gl1.position.z = Math.cos(t * 0.28) * 12;
  gl2.position.x = Math.cos(t * 0.22) * 10;
  gl2.position.y = Math.sin(t * 0.18) * 10;

  // Fog color shift with scroll
  const fr = 0.012 + sn * 0.008;
  scene.fog.density = fr;

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── CUSTOM CURSOR ────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let cx = 0, cy = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });

(function moveCursor() {
  requestAnimationFrame(moveCursor);
  rx += (cx - rx) * 0.14;
  ry += (cy - ry) * 0.14;
  dot.style.left  = cx + 'px';
  dot.style.top   = cy + 'px';
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
})();

// Hover state
document.querySelectorAll('a, button, .vision-card, .stat-card, .etrio-card, .nav-cta').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ─── HERO REVEAL ──────────────────────────────────────
function startHeroReveal() {
  const items = document.querySelectorAll('.reveal-up[data-delay]');
  items.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay);
  });
  startTypewriter();
  startCounters();
}

// ─── TYPEWRITER ───────────────────────────────────────
const words  = ['architects.', 'artisans.', 'visionaries.', 'icons.', 'legends.', 'AA-B-I-XES.'];
let wi = 0, ci = 0, deleting = false;
const twEl = document.getElementById('twWord');

function typeStep() {
  if (!twEl) return;
  const word = words[wi];
  if (!deleting) {
    twEl.textContent = word.slice(0, ci + 1);
    ci++;
    if (ci === word.length) { deleting = true; setTimeout(typeStep, 1800); return; }
    setTimeout(typeStep, 90 + Math.random() * 40);
  } else {
    twEl.textContent = word.slice(0, ci - 1);
    ci--;
    if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(typeStep, 300); return; }
    setTimeout(typeStep, 45);
  }
}
function startTypewriter() { setTimeout(typeStep, 600); }

// ─── SCROLL REVEAL ────────────────────────────────────
const revEls = document.querySelectorAll('.reveal-up');
function checkReveals() {
  revEls.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
      const d = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), d);
    }
  });
}
setTimeout(checkReveals, 200);

// ─── HERO PARALLAX ────────────────────────────────────
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const ht = document.querySelector('.hero-title');
  const hs = document.querySelector('.hero-subtitle');
  const si = document.querySelector('.scroll-indicator');
  if (ht) { ht.style.transform = `translateY(${sy * 0.14}px)`; ht.style.opacity = 1 - sy / window.innerHeight * 1.4; }
  if (hs) { hs.style.transform = `translateY(${sy * 0.09}px)`; }
  if (si) { si.style.opacity = 1 - sy / 180; }
});

// ─── HERO COUNTERS ────────────────────────────────────
let countersRan = false;
function startCounters() {
  if (countersRan) return;
  countersRan = true;
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let cur = 0;
    const step = target / 60;
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur);
      if (cur >= target) clearInterval(id);
    }, 25);
  });
}

// ─── STAT COUNTERS + BARS ─────────────────────────────
let statsRan = false;
function checkStats() {
  const statsSection = document.getElementById('stats');
  if (!statsSection || statsRan) return;
  const rect = statsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.8) {
    statsRan = true;
    document.querySelectorAll('.sc-val[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = target / 80;
      const id = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.floor(cur) + suffix;
        if (cur >= target) clearInterval(id);
      }, 20);
    });
    document.querySelectorAll('.sc-fill[data-pct]').forEach(el => {
      const pct = el.dataset.pct;
      setTimeout(() => { el.style.width = pct + '%'; }, 200);
    });
  }
}

// ─── TIMELINE ─────────────────────────────────────────
let tlRan = false;
const tlPoints = document.querySelectorAll('.tl-pt');
function checkTimeline() {
  const tl = document.querySelector('.timeline-wrap');
  if (!tl) return;
  const rect = tl.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.8 && !tlRan) {
    tlRan = true;
    const fill = document.getElementById('tlProgress');
    if (fill) setTimeout(() => { fill.style.width = '100%'; }, 300);
    tlPoints.forEach((pt, i) => {
      setTimeout(() => pt.classList.add('active'), 300 + i * 280);
    });
  }
}

tlPoints.forEach((pt, i) => {
  pt.addEventListener('mouseenter', () => {
    tlPoints.forEach(p => p.classList.remove('active'));
    pt.classList.add('active');
    const fill = document.getElementById('tlProgress');
    if (fill) fill.style.width = ((i / (tlPoints.length - 1)) * 100) + '%';
  });
});

// ─── DECODE ROWS ──────────────────────────────────────
let decodeRan = false;
function checkDecode() {
  const dec = document.getElementById('nameDecode');
  if (!dec || decodeRan) return;
  if (dec.getBoundingClientRect().top < window.innerHeight * 0.85) {
    decodeRan = true;
    document.querySelectorAll('.dr').forEach(row => {
      const d = parseInt(row.dataset.delay || 0);
      setTimeout(() => row.classList.add('visible'), d);
    });
  }
}

// ─── VISION CARD TILT ─────────────────────────────────
document.querySelectorAll('.vision-card').forEach(card => {
  card.style.transformStyle = 'preserve-3d';
  card.style.perspective = '600px';
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 20;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 20;
    card.style.transform = `translateY(-8px) rotateX(${-y * 0.35}deg) rotateY(${x * 0.35}deg)`;
    const glow = card.querySelector('.vc-glow');
    if (glow) {
      glow.style.left = (e.clientX - r.left - 90) + 'px';
      glow.style.top  = (e.clientY - r.top  - 90) + 'px';
    }
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ─── MONOGRAM CANVAS DOTS ─────────────────────────────
(function monoCanvas() {
  const cv = document.getElementById('monoCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = 300, H = 300, cx2 = W / 2, cy2 = H / 2;
  const dots = [];
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 90 + Math.random() * 55;
    dots.push({
      x: cx2 + Math.cos(angle) * r,
      y: cy2 + Math.sin(angle) * r,
      r: Math.random() * 1.5 + 0.3,
      a: angle, speed: (Math.random() - 0.5) * 0.008, radius: r,
      alpha: Math.random() * 0.4 + 0.1
    });
  }
  function drawMono(t) {
    ctx.clearRect(0, 0, W, H);
    dots.forEach(d => {
      d.a += d.speed;
      d.x = cx2 + Math.cos(d.a) * d.radius;
      d.y = cy2 + Math.sin(d.a) * d.radius;
      const pulse = d.alpha + Math.sin(t * 2 + d.a) * 0.15;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184,150,90,${Math.max(0, Math.min(1, pulse))})`;
      ctx.fill();
    });
    // Connect nearby dots
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 40) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(184,150,90,${0.08 * (1 - dist/40)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => drawMono(performance.now() / 1000));
  }
  drawMono(0);
})();

// ─── PARALLAX QUOTE BREAK ─────────────────────────────
window.addEventListener('scroll', () => {
  const pb = document.getElementById('pqBreak');
  if (!pb) return;
  const rect = pb.getBoundingClientRect();
  const bg   = pb.querySelector('.pqb-bg');
  if (bg) bg.style.transform = `translateY(${rect.top * 0.12}px)`;
});

// ─── SMOOTH NAV LINKS ─────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ─── MANIFESTO LINE STAGGER ───────────────────────────
const mfObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const d = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), d);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.mfl').forEach(el => mfObserver.observe(el));

// ─── STATS GRID CANVAS BG ─────────────────────────────
(function statsGrid() {
  const container = document.getElementById('statsGridBg');
  if (!container) return;
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0.4;';
  container.appendChild(cv);
  const ctx = cv.getContext('2d');

  function resize() {
    cv.width  = container.offsetWidth;
    cv.height = container.offsetHeight;
  }
  resize();

  const lines = [];
  for (let i = 0; i < 15; i++) {
    lines.push({
      x: Math.random() * cv.width, y: 0,
      speed: Math.random() * 0.4 + 0.1,
      alpha: Math.random() * 0.06 + 0.02,
      len: Math.random() * 80 + 40,
    });
  }

  function drawGrid() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = 'rgba(184,150,90,0.04)';
    ctx.lineWidth = 1;
    const gs = 60;
    for (let x = 0; x <= cv.width; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke();
    }
    for (let y = 0; y <= cv.height; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke();
    }
    lines.forEach(l => {
      l.y += l.speed;
      if (l.y > cv.height + l.len) { l.y = -l.len; l.x = Math.random() * cv.width; }
      const grad = ctx.createLinearGradient(l.x, l.y - l.len, l.x, l.y);
      grad.addColorStop(0, 'rgba(184,150,90,0)');
      grad.addColorStop(1, `rgba(184,150,90,${l.alpha})`);
      ctx.beginPath();
      ctx.moveTo(l.x, l.y - l.len);
      ctx.lineTo(l.x, l.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    requestAnimationFrame(drawGrid);
  }
  drawGrid();
  window.addEventListener('resize', resize);
})();

// ─── PAGE FADE IN ─────────────────────────────────────
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);
});
