/* Portfolio Melina Kenigsberg — libro que se abre al scrollear.
   Un solo reloj: u = scrollY / innerHeight. Todo se calcula con render(u). */
(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const K = 0.76;                                 // escala de tiempos (más chico = menos scroll)
  const OFF = 1.7;                                // el contenido arranca después de abrir el libro
  const sr = (u, a, b) => clamp((u - a * K) / ((b - a) * K));       // reloj del libro
  const seg = (u, a, b) => sr(u, a + OFF, b + OFF);                  // reloj del contenido

  const world = $('#world'), book = $('#book'), stage = $('#stage'), strip = $('#strip'), shade = $('#shade');
  const cover = $('#cover'), back = $('#back'), form = $('#form'), spacer = $('#spacer');
  const END = 29.9 * K;

  /* ---------- ajuste a la ventana ---------- */
  let S = 1, VH = innerHeight;
  function fit() {
    const vw = innerWidth, vh = innerHeight, sW = vw / 1440, sH = vh / 900;
    const ratio = Math.max(sW, sH) / Math.min(sW, sH);
    S = ratio <= 1.07 ? Math.max(sW, sH) : Math.min(sW, sH);
    const ox = (vw - 1440 * S) / 2, oy = (vh - 900 * S) / 2;
    stage.style.transform = `translate3d(${ox}px,${oy}px,0) scale(${S})`;
    VH = vh;
    spacer.style.height = (END + 1) * vh + 'px';
  }

  /* ---------- páginas ---------- */
  const NP = [2, 3, 4, 5, 6];
  const pages = NP.map((n, i) => {
    const d = document.createElement('div');
    d.className = 'page';
    d.style.top = i * 900 + 'px';
    d.style.backgroundImage = `url(assets/paper_${n}.webp)`;
    strip.appendChild(d);
    return d;
  });

  /* ---------- elementos que aparecen al scrollear ---------- */
  const EL = [];
  function add(pi, layer, r, mode, t0, t1, o = {}) {
    const n = NP[pi], [x, y, w, h] = r;
    const d = document.createElement('div');
    d.className = 'el';
    Object.assign(d.style, {
      left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px',
      backgroundImage: `url(assets/${layer}_${n}.webp)`, backgroundPosition: `${-x}px ${-y}px`, opacity: 0
    });
    pages[pi].appendChild(d);
    EL.push({ d, mode, t0, t1, p: -1, rot: o.rot || 0 });
  }
  const LN = window.LINES;
  const lines = (pi, key, start, step, dur) =>
    LN[key].forEach((l, i) => add(pi, 'ink', [l[0], l[1], l[2] - l[0], l[3] - l[1]], 'wipe', start + step * i, start + step * i + dur));

  /* 1 · "Desde muy chiquita…" */
  lines(0, 2, 1.0, 0.5, 0.6);
  add(0, 'pol', [1036, 73, 355, 450], 'pop', 3.0, 3.7, { rot: -3 });
  /* 2 · carrusel OMA y garabatos */
  add(1, 'ink', [140, 592, 130, 132], 'pop', 5.5, 5.8, { rot: -8 });
  add(1, 'ink', [314, 701, 208, 172], 'wipe', 5.7, 6.3);
  add(1, 'ink', [520, 712, 146, 110], 'pop', 6.2, 6.5, { rot: 10 });
  add(1, 'ink', [1058, 540, 288, 250], 'wipe', 6.4, 7.3);
  /* 3 · ORT / Laika / Segunda abanderada */
  add(2, 'ink', [116, 16, 180, 104], 'fade', 8.9, 9.4);
  lines(2, 4, 9.2, 0.33, 0.45);
  add(2, 'pol', [804, 75, 556, 601], 'pop', 11.5, 12.3, { rot: 2.5 });
  add(2, 'ink', [204, 820, 198, 22], 'wipe', 12.3, 12.7);
  add(2, 'ink', [686, 762, 60, 84], 'fade', 12.6, 13.0);
  add(2, 'ink', [1068, 749, 66, 96], 'fade', 12.7, 13.1);
  /* 4 · adolescencia */
  lines(3, 5, 14.0, 0.19, 0.4);
  add(3, 'ink', [1005, 185, 305, 131], 'wipe', 16.4, 16.9);
  add(3, 'pol', [144, 135, 355, 450], 'pop', 16.8, 17.4, { rot: -3 });
  add(3, 'ink', [298, 643, 135, 128], 'wipe', 17.3, 17.7);
  add(3, 'pol', [1063, 355, 355, 450], 'pop', 17.5, 18.1, { rot: 3 });
  /* 5 · madrija */
  lines(4, 6, 19.4, 0.15, 0.4);
  add(4, 'pol', [743, 98, 645, 750], 'pop', 21.9, 22.9, { rot: 2 });
  add(4, 'ink', [1262, 118, 160, 172], 'fade', 22.5, 23.0);

  /* ---------- OMA: gris → celeste al pasar el mouse ---------- */
  function img(pi, src, x, y, w, h) {
    const i = document.createElement('img');
    i.className = 'img'; i.src = 'assets/' + src; i.alt = ''; i.draggable = false;
    Object.assign(i.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    pages[pi].appendChild(i);
    return i;
  }
  const omaGrey = img(0, 'oma_grey.webp', 360, 660, 800, 220);
  omaGrey.style.opacity = 0;
  const subGrey = img(1, 'sub_grey.webp', 400, 0, 720, 50);
  const blue = [
    img(0, 'oma_blue.png', 378, 678, 558, 182),
    img(0, 'logo_blue.png', 950, 667, 195, 195),
    img(1, 'sub_blue.png', 414, -5, 690, 48)
  ];
  blue.forEach(b => b.style.opacity = 0);
  let hov = 0, hovT = 0;
  [[0, 372, 668, 780, 205], [1, 406, 0, 710, 46]].forEach(([pi, x, y, w, h]) => {
    const hz = document.createElement('div');
    hz.className = 'hit';
    Object.assign(hz.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    hz.addEventListener('pointerenter', () => hovT = 1);
    hz.addEventListener('pointerleave', () => hovT = 0);
    pages[pi].appendChild(hz);
  });
  let omaFade = 0;

  /* ---------- carrusel ---------- */
  const car = document.createElement('div');
  car.id = 'car';
  pages[1].appendChild(car);
  const CARDS = window.CARDS, N = CARDS.length, PITCH = 440, CX = 758 - 96, CY = 330;
  const cards = CARDS.map(c => {
    const b = Math.min(1, 440 / c.h, 400 / c.w);
    const w = c.w * b, h = c.h * b;
    const d = document.createElement('div');
    d.className = 'card';
    d.style.width = w + 'px'; d.style.height = h + 'px';
    const im = new Image(); im.src = c.src; im.alt = c.alt; im.draggable = false;
    d.appendChild(im); car.appendChild(d);
    return { d, w, h };
  });
  let pos = 0, vel = 50, dragging = false, lastX = 0, lastT = 0, carOp = 0;
  const V_BASE = 50, TOTAL = N * PITCH;
  car.addEventListener('pointerdown', e => {
    dragging = true; car.classList.add('drag'); car.setPointerCapture(e.pointerId);
    lastX = e.clientX; lastT = performance.now(); vel = 0;
  });
  car.addEventListener('pointermove', e => {
    if (!dragging) return;
    const now = performance.now(), dt = Math.max(1, now - lastT) / 1000;
    const dx = (e.clientX - lastX) / S;
    pos -= dx;
    const inst = -dx / dt;
    vel = vel * 0.55 + inst * 0.45;
    lastX = e.clientX; lastT = now;
  });
  const release = () => {
    if (!dragging) return;
    dragging = false; car.classList.remove('drag');
    if (performance.now() - lastT > 90) vel = 0;           // lo agarraste quieto → queda frenado
    vel = clamp(vel, -2600, 2600);
  };
  car.addEventListener('pointerup', release);
  car.addEventListener('pointercancel', release);
  car.addEventListener('lostpointercapture', release);

  function drawCarousel() {
    for (let i = 0; i < N; i++) {
      let d = i * PITCH - pos;
      d = ((d + TOTAL / 2) % TOTAL + TOTAL) % TOTAL - TOTAL / 2;
      const k = Math.abs(d) / PITCH;
      const s = 1.12 - 0.17 * Math.min(k, 1) - 0.07 * clamp(k - 1);
      const o = 1 - clamp((k - 1.55) / 0.7);
      const c = cards[i];
      if (o <= 0.001) { c.d.style.visibility = 'hidden'; continue; }
      c.d.style.visibility = 'visible';
      c.d.style.opacity = o;
      c.d.style.zIndex = 100 - Math.round(k * 10);
      c.d.style.transform = `translate3d(${CX + d - c.w / 2}px,${(CY - 56) - c.h / 2}px,0) scale(${s})`;
    }
  }

  /* ---------- casilla de mail ---------- */
  const TO = 'melinakenigsberg@gmail.com';
  const stEl = $('#msgst'), sendBtn = $('#send');
  const say = (t) => { stEl.textContent = t; };
  $('#copy').addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(TO); ok = true; } catch (e) {
      const t = document.createElement('textarea'); t.value = TO; document.body.appendChild(t); t.select();
      try { ok = document.execCommand('copy'); } catch (_) { } t.remove();
    }
    const c = $('#copyt'); c.textContent = ok ? '¡Copiado!' : 'Copiá a mano';
    setTimeout(() => c.textContent = 'Copiar', 1600);
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const from = $('#f-from').value.trim(), subj = $('#f-subj').value.trim(), msg = $('#f-msg').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) { say('Poné tu mail en "De"'); shake(); return; }
    if (!msg) { say('Escribí un mensaje'); shake(); return; }
    sendBtn.disabled = true; say('Enviando…');
    try {
      const r = await fetch('https://formsubmit.co/ajax/' + TO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: from, _subject: subj || 'Mensaje desde tu portfolio', message: msg, _template: 'box', _captcha: 'false' })
      });
      const j = await r.json().catch(() => ({}));
      console.log('[formsubmit]', r.status, j);
      if (!r.ok || String(j.success) === 'false') throw new Error('HTTP ' + r.status + (j.message ? ' · ' + j.message : ''));
      say('¡Mensaje enviado!');
      $('#f-subj').value = ''; $('#f-msg').value = '';
    } catch (err) {
      console.error('[formsubmit] error', err);
      say('Error: ' + String(err && err.message || err).slice(0, 44));
      setTimeout(() => { location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(msg + '\n\n' + from); }, 4000);
    }
    sendBtn.disabled = false;
  });
  function shake() { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }

  /* ---------- render ---------- */
  function flap(el, a, vis = true) {
    el.style.visibility = vis ? 'visible' : 'hidden';
    el.style.transform = a === 0 ? 'none' : `rotateY(${a}deg)`;
    const dk = $('.dark', el); dk.style.opacity = clamp(-a / 95) * 0.9;
  }
  const cast = (el, a) => {
    const x = 1440 * Math.cos(a * Math.PI / 180);
    el.style.left = Math.max(0, x) + 'px';
    el.style.opacity = Math.sin(clamp(-a / 180) * Math.PI) * 0.9;
  };
  function setEl(e, u) {
    const p = seg(u, e.t0, e.t1);
    if (p === e.p) return;
    e.p = p;
    const d = e.d, t = ease(p);
    if (p <= 0) { d.style.opacity = 0; return; }
    if (e.mode === 'wipe') {
      d.style.opacity = 1;
      const m = `linear-gradient(90deg,#000 ${t * 130 - 30}%,transparent ${t * 130}%)`;
      d.style.webkitMaskImage = d.style.maskImage = p >= 1 ? 'none' : m;
    } else if (e.mode === 'fade') {
      d.style.opacity = t;
    } else if (e.mode === 'pop') {
      const q = easeOut(p);
      d.style.opacity = clamp(p * 2.2);
      d.style.transform = p >= 1 ? 'none' : `translateY(${(1 - q) * 28}px) rotate(${e.rot * (1 - q)}deg) scale(${0.9 + 0.1 * q})`;
    }
  }

  let U = 0;
  const S0 = 0.62;                                 // tamaño del libro entero
  const X0 = 24.9, X1 = 26.1, X2 = 27.5, X3 = 28.7; // cierre: aleja → se cierra la contratapa desde la derecha → acerca
  function render(u) {
    U = u;
    // ---- cámara y libro ----
    const open = ease(sr(u, 0, 1.6));
    const zin = ease(sr(u, 1.6, 2.9));
    const zout = ease(sr(u, X0, X1));
    const close = ease(sr(u, X1, X2));
    const zin2 = ease(sr(u, X2, X3));
    let sc = S0, cx = 720 * (1 - open);
    if (u >= X0 * K) {                                   // final
      sc = S0 + (1 - S0) * (1 - zout);
      cx = 720 + 720 * zout;
      if (u >= X1 * K) { sc = S0; cx = 1440 - 720 * close; }
      if (u >= X2 * K) { sc = S0 + (1 - S0) * zin2; cx = 720; }
    } else if (u >= 1.6 * K) { sc = S0 + (1 - S0) * zin; cx = 720 * zin; }
    world.style.transform = `translate3d(${720 - cx * sc}px,${450 - 450 * sc}px,0) scale(${sc})`;
    const tilt = 1 - ease(sr(u, 0.6, 2.9)), tilt2 = zout * (1 - zin2);
    book.style.transform = `rotateX(${9 * (tilt + tilt2)}deg) rotateY(${-15 * tilt + 15 * tilt2}deg)`;
    // tapa
    const fin = u >= X0 * K;
    const aC = fin ? -180 : -180 * open;
    const fadeL = a => 1 - clamp((sc - 0.85) / 0.15) * clamp(-a / 90);   // tapa abierta: no se ve fuera de la hoja
    { const o = fadeL(aC); $('.inside', cover).style.opacity = o; $('.thick', cover).style.opacity = o; }
    flap(cover, aC, !fin);
    cast($('#cast1'), fin ? 0 : aC); $('#cast1').style.display = sc > 0.9 ? 'none' : '';
    shade.style.opacity = fin ? 0 : Math.sin(clamp(-aC / 180) * Math.PI) * 0.9;
    // contratapa: bisagra a la derecha, se cierra sobre las hojas
    const aB = 180 * (1 - close);
    back.style.visibility = fin ? 'visible' : 'hidden';
    { const o = 1 - clamp((sc - 0.85) / 0.15) * clamp(aB / 90); $('.inside', back).style.opacity = o; $('.thick', back).style.opacity = o; }
    back.style.transform = aB === 0 ? 'none' : `rotateY(${aB}deg)`;
    $('.dark', back).style.opacity = clamp(aB / 95) * 0.9;
    const c2 = $('#cast2'); c2.style.opacity = fin ? Math.sin(clamp(aB / 180) * Math.PI) * 0.9 : 0;
    c2.style.left = 1440 - 190 - Math.max(0, 1440 * Math.cos(aB * Math.PI / 180)) + 'px';
    // páginas del cuaderno
    const pos = ease(seg(u, 4.2, 5.3)) + ease(seg(u, 8.2, 9.3)) + ease(seg(u, 13.0, 14.1)) + ease(seg(u, 18.5, 19.6));
    strip.style.transform = `translate3d(0,${-pos * 900}px,0)`;
    // elementos
    for (const e of EL) setEl(e, u);
    omaFade = ease(seg(u, 3.5, 4.1));
    omaGrey.style.opacity = omaFade;
    car.style.opacity = ease(seg(u, 4.3, 5.4));
    car.style.pointerEvents = carOpacityOk(u) ? 'auto' : 'none';
    // mail
    const f = ease(sr(u, X3 + 0.1, X3 + 0.7));
    form.style.opacity = f;
    form.style.transform = `translateY(${(1 - f) * 24}px)`;
    form.classList.toggle('on', f > 0.9);
  }
  const carOpacityOk = u => u > (4.6 + OFF) * K && u < (8.8 + OFF) * K;

  /* ---------- bucle ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    // carrusel: gira solo y se acomoda a lo que hagas con el mouse
    if (!dragging) {
      vel += (V_BASE - vel) * (1 - Math.exp(-dt * 1.4));
      pos += vel * dt;
    }
    drawCarousel();
    // hover OMA
    hov += (hovT - hov) * (1 - Math.exp(-dt * 14));
    const o = hov * omaFade;
    blue.forEach(b => b.style.opacity = o);
    render(scrollY / VH);
    requestAnimationFrame(frame);
  }

  addEventListener('resize', fit);
  fit();
  requestAnimationFrame(frame);
  window.__render = render; window.__END = END;
})();
