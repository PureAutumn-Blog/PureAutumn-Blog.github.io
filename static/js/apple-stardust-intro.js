(() => {
  'use strict';

  const ROOT_ID = 'apple-stardust-intro';
  const STYLE_ID = 'apple-stardust-intro-style';
  if (document.getElementById(ROOT_ID)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = ['Hello.', 'Welcome.', 'Hello, world.', 'Nice to see you.'];
  const word = words[Math.floor(Math.random() * words.length)];
  let root = null, style = null, canvas = null, ctx = null, mask = null, mctx = null;
  let raf = 0, autoClose = 0, dismissed = false, lastFrame = 0, startAt = 0;
  let width = 0, height = 0, scale = 1, particles = [], ambience = [];
  const mouse = { x: -10000, y: -10000 };
  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function removeListeners() {
    window.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('resize', onResize);
  }
  function cleanUp() {
    dismissed = true;
    if (raf) cancelAnimationFrame(raf);
    if (autoClose) clearTimeout(autoClose);
    removeListeners();
    if (root) root.remove();
    if (style) style.remove();
    root = style = canvas = ctx = mask = mctx = null;
  }
  function leave() {
    if (dismissed) return;
    dismissed = true;
    if (raf) cancelAnimationFrame(raf);
    if (autoClose) clearTimeout(autoClose);
    removeListeners();
    if (root) {
      root.classList.add('as-leaving');
      root.style.pointerEvents = 'none';
      window.setTimeout(() => {
        if (root) root.remove();
        if (style) style.remove();
      }, 650);
    } else if (style) style.remove();
  }
  function onPointerDown(event) {
    if (event.target instanceof Element && event.target.closest('#' + ROOT_ID + ' .as-skip')) return;
    leave(); // Do not cancel the underlying link/button click.
  }
  function onPointerMove(event) { mouse.x = event.clientX; mouse.y = event.clientY; }
  function onKeyDown(event) { if (event.key === 'Escape') leave(); }
  function onResize() {
    try {
      resizeAndBuild();
      startAt = performance.now();
      lastFrame = 0;
      drawFrame(startAt);
    } catch (error) {
      console.error('[stardust] resize failed; closing intro safely.', error);
      cleanUp();
    }
  }

  function makeStyle() {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{position:fixed!important;inset:0!important;z-index:2147483000!important;display:block!important;overflow:hidden!important;isolation:isolate!important;opacity:1!important;visibility:visible!important;pointer-events:none!important;background:radial-gradient(ellipse at 50% 43%,#101827 0%,#070b12 48%,#020308 100%)!important;-webkit-font-smoothing:antialiased;transition:opacity .65s ease,visibility .65s ease}
      #${ROOT_ID}.as-leaving{opacity:0!important;visibility:hidden!important}
      #${ROOT_ID} canvas.as-star-canvas{position:absolute!important;z-index:1!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;opacity:1!important;visibility:visible!important;background:transparent!important;filter:none!important;pointer-events:none!important}
      #${ROOT_ID} .as-caption{position:absolute;z-index:2;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;pointer-events:none;transform:translateY(-2vh)}
      #${ROOT_ID} .as-subtitle{margin:clamp(70px,10vh,100px) 0 0;color:rgba(230,240,255,.75);font:500 10px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.31em;text-transform:uppercase;opacity:0;animation:as-sub-in .7s 1.5s ease-out forwards}
      #${ROOT_ID} .as-hint{position:absolute;z-index:2;left:16px;right:16px;bottom:max(32px,env(safe-area-inset-bottom));margin:0;text-align:center;color:rgba(230,239,255,.75);font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.04em;opacity:0;animation:as-hint-in .6s 1.2s ease-out forwards;pointer-events:none}
      #${ROOT_ID} .as-skip{position:absolute;z-index:3;top:max(18px,env(safe-area-inset-top));right:max(18px,env(safe-area-inset-right));padding:9px 14px;border:1px solid rgba(255,255,255,.3);border-radius:999px;color:#fff;background:rgba(255,255,255,.13);font:500 12px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:pointer;pointer-events:auto}
      #${ROOT_ID} .as-skip:hover{background:rgba(255,255,255,.23)}
      @keyframes as-sub-in{to{opacity:1}}@keyframes as-hint-in{to{opacity:1}}
      @media(max-width:520px){#${ROOT_ID} .as-subtitle{font-size:9px;letter-spacing:.22em}#${ROOT_ID} .as-hint{bottom:max(26px,env(safe-area-inset-bottom))}}
    `;
  }

  function buildWordParticles() {
    const fontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif';
    const measureCanvas = document.createElement('canvas');
    const measure = measureCanvas.getContext('2d');
    if (!measure) throw new Error('Canvas text measurement unavailable');

    let fontSize = Math.min(142, width * 0.145, height * 0.18);
    fontSize = Math.max(32, fontSize);
    measure.font = `700 ${fontSize}px ${fontStack}`;
    while (measure.measureText(word).width > width * 0.88 && fontSize > 24) {
      fontSize *= 0.9;
      measure.font = `700 ${fontSize}px ${fontStack}`;
    }

    const textWidth = measure.measureText(word).width;
    const maskWidth = Math.max(1, Math.ceil(Math.min(width * 0.9, textWidth + fontSize * 0.25)));
    const maskHeight = Math.max(1, Math.ceil(fontSize * 1.55));
    mask.width = maskWidth;
    mask.height = maskHeight;
    mctx.clearRect(0, 0, maskWidth, maskHeight);
    mctx.font = `700 ${fontSize}px ${fontStack}`;
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.fillStyle = '#fff';
    mctx.fillText(word, maskWidth / 2, maskHeight / 2);

    const pixels = mctx.getImageData(0, 0, maskWidth, maskHeight).data;
    const step = fontSize < 58 ? 3 : 3;
    const targets = [];
    for (let y = 0; y < maskHeight; y += step) {
      for (let x = 0; x < maskWidth; x += step) {
        const alpha = pixels[(y * maskWidth + x) * 4 + 3];
        if (alpha > 70) targets.push({
          x: (width - maskWidth) / 2 + x,
          y: height * 0.455 - maskHeight / 2 + y,
          brightness: alpha / 255
        });
      }
    }
    if (targets.length < 40) throw new Error('Not enough star positions to form a readable word');

    const cores = Number(navigator.hardwareConcurrency || 8);
    const maxParticles = cores <= 4 ? 620 : 900;
    let picked = targets;
    if (targets.length > maxParticles) {
      picked = [];
      const stride = targets.length / maxParticles;
      for (let i = 0; i < maxParticles; i++) picked.push(targets[Math.floor(i * stride)]);
    }
    particles = picked.map((p, i) => ({
      sx: random(0, width), sy: random(0, height),
      tx: p.x + random(-0.4, 0.4), ty: p.y + random(-0.4, 0.4),
      size: random(1.05, 2.05),
      alpha: random(0.82, 1) * (0.72 + 0.28 * p.brightness),
      delay: random(0, 300), phase: random(0, Math.PI * 2), i
    }));
  }

  function resizeAndBuild() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    scale = Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(3000000 / (width * height)));
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    buildWordParticles();
    const count = Math.max(50, Math.min(85, Math.floor(width * height / 14500)));
    ambience = Array.from({ length: count }, () => ({
      x: random(0, width), y: random(0, height), r: random(0.45, 1.35),
      alpha: random(0.35, 0.82), phase: random(0, Math.PI * 2), speed: random(0.08, 0.3)
    }));
  }

  function drawFrame(now) {
    // Transparent canvas: the independent CSS layer always provides the dark background.
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    for (const s of ambience) {
      const pulse = 0.68 + 0.32 * Math.sin(now * 0.0012 + s.phase);
      s.y -= s.speed * 0.12;
      if (s.y < -2) { s.y = height + 2; s.x = random(0, width); }
      ctx.beginPath();
      ctx.fillStyle = `rgba(185,215,255,${s.alpha * pulse})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const elapsed = now - startAt;
    for (const p of particles) {
      const raw = clamp((elapsed - p.delay - 220) / 2350, 0, 1);
      const ease = 1 - Math.pow(1 - raw, 3.05);
      const drift = raw < 1 ? (1 - ease) * 7 : 0.35;
      let x = p.sx + (p.tx + Math.sin(now * 0.00125 + p.phase) * drift - p.sx) * ease;
      let y = p.sy + (p.ty + Math.cos(now * 0.0011 + p.phase) * drift - p.sy) * ease;

      if (raw > 0.72) {
        const dx = x - mouse.x, dy = y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 < 86 * 86) {
          const d = Math.sqrt(d2), force = (86 - d) / 86 * 2.5;
          x += dx / d * force;
          y += dy / d * force;
        }
      }
      const pulse = 0.78 + 0.22 * Math.sin(now * 0.003 + p.phase);
      const alpha = p.alpha * pulse;
      ctx.beginPath();
      ctx.fillStyle = `rgba(242,248,255,${alpha})`;
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.i % 17 === 0 && raw > 0.72) {
        ctx.strokeStyle = `rgba(215,235,255,${alpha * 0.72})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(x - 2.7, y); ctx.lineTo(x + 2.7, y);
        ctx.moveTo(x, y - 2.7); ctx.lineTo(x, y + 2.7);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function safeTick(now) {
    if (dismissed || !root || !root.isConnected) return;
    if (now - lastFrame < 1000 / 30) { raf = requestAnimationFrame(safeTick); return; }
    lastFrame = now;
    try {
      drawFrame(now);
      raf = requestAnimationFrame(safeTick);
    } catch (error) {
      console.error('[stardust] drawing failed; removing intro.', error);
      cleanUp();
    }
  }

  function boot() {
    try {
      canvas = document.createElement('canvas');
      canvas.className = 'as-star-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      ctx = canvas.getContext('2d', { alpha: true });
      mask = document.createElement('canvas');
      mctx = mask.getContext('2d', { willReadFrequently: true });
      if (!ctx || !mctx) throw new Error('Canvas 2D unavailable');
      resizeAndBuild();
      startAt = performance.now();
      drawFrame(startAt);

      makeStyle();
      root = document.createElement('div');
      root.id = ROOT_ID;
      root.setAttribute('aria-label', 'Stars gather to form a greeting');
      root.innerHTML = '<div class="as-caption"><p class="as-subtitle">WELCOME TO MY WORLD</p></div><p class="as-hint">星辰汇聚成字 · 点击进入 · Press Esc to skip</p><button class="as-skip" type="button" aria-label="跳过开场">跳过 ↗</button>';
      root.appendChild(canvas);
      document.head.appendChild(style);
      document.body.appendChild(root);
      root.querySelector('.as-skip').addEventListener('click', leave);
      window.addEventListener('pointerdown', onPointerDown, true);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('keydown', onKeyDown, true);
      window.addEventListener('resize', onResize, { passive: true });
      console.info(`[stardust] ${particles.length} stars will form “${word}”.`);
      raf = requestAnimationFrame(safeTick);
      autoClose = window.setTimeout(leave, 8200);
    } catch (error) {
      console.error('[stardust] initialization failed; removing intro safely.', error);
      cleanUp();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
