// Hexagon site: language switch, copy button, 3D pointer tilt, scroll reveals and the process line.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

// language switch: the thumb slides, then the other page loads
document.querySelectorAll('.lang').forEach(a => a.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || still) return;
  e.preventDefault(); a.classList.add('is-going'); setTimeout(() => { location.href = a.href; }, 340);
}));
addEventListener('pageshow', () => document.querySelectorAll('.lang.is-going').forEach(a => a.classList.remove('is-going')));

// copy the email address
document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const st = b.parentElement.querySelector('[data-copy-status]'), t = b.textContent;
  try { await navigator.clipboard.writeText(b.dataset.copy); } catch { return; }
  b.textContent = b.dataset.done; if (st) st.textContent = b.dataset.done;
  setTimeout(() => { b.textContent = t; if (st) st.textContent = ''; }, 1600);
}));

// hero: the hexagon world turns toward the pointer
const world = document.querySelector('.hx-world'), hero = document.querySelector('.hx-hero');
if (world && hero && finePointer && !still) {
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const step = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    world.style.setProperty('--rx', `${cy.toFixed(2)}deg`); world.style.setProperty('--ry', `${cx.toFixed(2)}deg`);
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(step) : 0;
  };
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 30; ty = -((e.clientY - r.top) / r.height - 0.5) * 18;
    if (!raf) raf = requestAnimationFrame(step);
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(step); });
}

// service cards tilt toward the pointer, a light follows it
if (finePointer && !still) document.querySelectorAll('[data-tilt]').forEach(c => {
  c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.classList.add('is-tilting');
    c.style.setProperty('--ty', `${((x - 0.5) * 12).toFixed(2)}deg`); c.style.setProperty('--tx', `${(-(y - 0.5) * 12).toFixed(2)}deg`);
    c.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`); c.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  });
  c.addEventListener('pointerleave', () => { c.classList.remove('is-tilting'); c.style.setProperty('--tx', '0deg'); c.style.setProperty('--ty', '0deg'); });
});

// reveals: each [data-rise] lifts in once, siblings one after another
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-rise]').forEach(el => {
  const sibs = [...el.parentElement.children].filter(s => s.hasAttribute('data-rise'));
  el.style.setProperty('--i', sibs.indexOf(el));
  io.observe(el);
});

// process: the line fills as the list scrolls through the middle of the screen
const proc = document.querySelector('.proc');
if (proc) {
  const steps = [...proc.children];
  const update = () => {
    const r = proc.getBoundingClientRect(), span = Math.max(r.height, innerHeight * 0.35);
    const p = still ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / span));
    proc.style.setProperty('--p', p.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle('is-lit', p >= (steps.length > 1 ? i / (steps.length - 1) : 1) - 0.02));
  };
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
}
