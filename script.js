/* ===== Helpers ===== */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* ===== 1. Loading screen ===== */
window.addEventListener('load', () => setTimeout(() => $('#loader').classList.add('hide'), 1300));

/* ===== 2. Typing animation ===== */
const words = ['Software Engineer', 'Web Developer', 'Frontend Developer', 'Junior Backend Developer', 'Problem Solver'];
let w = 0, c = 0, deleting = false;
function type() {
  const word = words[w];
  c += deleting ? -1 : 1;
  $('#typing').textContent = word.slice(0, c);
  let delay = deleting ? 50 : 100;
  if (!deleting && c === word.length) { deleting = true; delay = 1400; }
  else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
  setTimeout(type, delay);
}
type();

/* ===== 3. Mobile navigation ===== */
const burger = $('#burger'), menu = $('#menu');
function toggleMenu(open) {
  menu.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
}
burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
$$('#menu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

/* ===== 4. Scroll effects: navbar, progress bar, back-to-top, active link ===== */
const sections = $$('main section[id]');
const links = $$('#menu a');
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  $('#nav').classList.toggle('scrolled', y > 50);
  $('#progress').style.width = (y / max * 100) + '%';
  $('#top').classList.toggle('show', y > 600);
  let current = 'home';
  sections.forEach(s => { if (y >= s.offsetTop - 140) current = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
$('#top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== 5. Scroll reveal, skill bars, counters, timeline ===== */
function countUp(el) {
  const target = +el.dataset.target;
  let n = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const timer = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n;
    if (n >= target) clearInterval(timer);
  }, 25);
}
$$('.skill i').forEach(bar => bar.style.setProperty('--w', bar.dataset.level + '%'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('show');
    $$('.count', e.target).forEach(countUp);
    observer.unobserve(e.target);
  });
}, { threshold: 0.2 });
$$('.reveal').forEach(el => observer.observe(el));

// Timeline steps appear one after another
const stepObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.step').forEach((s, i) => setTimeout(() => s.classList.add('show'), i * 350));
    stepObserver.disconnect();
  });
}, { threshold: 0.3 });
stepObserver.observe($('.timeline'));

/* ===== 6. Project filtering ===== */
const filters = $$('.filter'), projects = $$('.project');
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  projects.forEach(p => {
    const match = f === 'all' || p.dataset.cat.split(' ').includes(f);
    if (match) {
      p.style.display = '';
      requestAnimationFrame(() => p.classList.remove('hide'));
    } else {
      p.classList.add('hide');
      setTimeout(() => { if (p.classList.contains('hide')) p.style.display = 'none'; }, 400);
    }
  });
}));

/* ===== 7. 3D tilt on service cards ===== */
$$('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-10px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

/* ===== 8. Contact form validation ===== */
const form = $('#form'), msg = $('#formMsg');
const rules = {
  name: v => v.trim().length >= 2 || 'Enter your name (at least 2 characters).',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
  subject: v => v.trim().length >= 3 || 'Enter a subject (at least 3 characters).',
  message: v => v.trim().length >= 10 || 'Write a message of at least 10 characters.'
};
form.addEventListener('submit', e => {
  e.preventDefault();
  let ok = true;
  Object.keys(rules).forEach(id => {
    const input = $('#' + id), label = input.parentElement;
    const result = rules[id](input.value);
    label.classList.toggle('invalid', result !== true);
    $('.err', label).textContent = result === true ? '' : result;
    if (result !== true) ok = false;
  });
  msg.className = ok ? 'ok' : 'bad';
  if (ok) {
    // To send real emails, connect a service such as Formspree here.
    msg.textContent = 'Message sent. Thank you, I will reply soon.';
    form.reset();
  } else {
    msg.textContent = 'Please fix the highlighted fields and send again.';
  }
});

/* ===== 9. Particles background ===== */
const canvas = $('#particles'), ctx = canvas.getContext('2d');
let dots = [];
function resize() {
  canvas.width = innerWidth; canvas.height = innerHeight;
  dots = Array.from({ length: Math.min(60, innerWidth / 20) }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + .5, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3
  }));
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dots.forEach(d => {
    d.x = (d.x + d.vx + canvas.width) % canvas.width;
    d.y = (d.y + d.vy + canvas.height) % canvas.height;
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7);
    ctx.fillStyle = 'rgba(212,175,55,.5)'; ctx.fill();
  });
  requestAnimationFrame(draw);
}
resize(); draw();
window.addEventListener('resize', resize);

/* ===== 10. Cursor glow ===== */
const glow = $('#cursorGlow');
window.addEventListener('mousemove', e => {
  glow.style.opacity = 1;
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

/* ===== 11. Footer year ===== */
$('#year').textContent = new Date().getFullYear();