(() => {
  'use strict';

  const ROOT_ID = 'apple-stardust-intro';
  const STYLE_ID = 'apple-stardust-intro-style';
  if (document.getElementById(ROOT_ID)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // The word remains lowercase and unpunctuated. A script-font stack gives it
  // Apple's handwritten Hello spirit while retaining system-font fallbacks.
  const word = 'hello';
  const scriptFontStack = '"Snell Roundhand", "Apple Chancery", "Segoe Script", "Brush Script MT", cursive';
  const rainbowStops = [
    [0.00, [116, 222, 250]], // cyan
    [0.16, [126, 232, 190]], // mint
    [0.32, [244, 232, 133]], // warm yellow
    [0.47, [255, 183, 116]], // orange
    [0.61, [255, 125, 154]], // coral pink
    [0.76, [220, 142, 219]], // pink violet
    [0.90, [153, 157, 255]], // periwinkle
    [1.00, [122, 211, 255]]  // blue
  ];

  let root = null, style = null, canvas = null, ctx = null, mask = null, mctx = null;
  let raf = 0, autoClose = 0, dismissed = false, lastFrame = 0, startAt = 0;
  let width = 0, height = 0, scale = 1, particles = [], ambience = [];
  const mouse = { x: -10000, y: -10000 };
  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => value * value * (3 - 2 * value);

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
    } else if (style) {
      style.remove();
    }
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
      #${ROOT_ID} canvas.as-star-canvas{position:absolute!important;z-index:1!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;opacity:1!important;visibility:visible!important;background:transparent!important;filter:none!important;mix-blend-mode:normal!important;pointer-events:none!important}
      #${ROOT_ID} .as-caption{position:absolute;z-index:2;inset:0;display:block;text-align:center;padding:24px;pointer-events:none;transform:translateY(-2vh)}
      #${ROOT_ID} .as-subtitle{position:absolute;top:calc(50% + clamp(112px,16vh,170px));left:20px;right:20px;margin:0;color:rgba(230,240,255,.75);font:500 10px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.31em;text-transform:uppercase;opacity:0;animation:as-sub-in .7s 1.5s ease-out forwards}
      #${ROOT_ID} .as-hint{position:absolute;z-index:2;left:16px;right:16px;bottom:max(32px,env(safe-area-inset-bottom));margin:0;text-align:center;color:rgba(230,239,255,.75);font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.04em;opacity:0;animation:as-hint-in .6s 1.2s ease-out forwards;pointer-events:none}
      #${ROOT_ID} .as-skip{position:absolute;z-index:3;top:max(18px,env(safe-area-inset-top));right:max(18px,env(safe-area-inset-right));padding:9px 14px;border:1px solid rgba(255,255,255,.3);border-radius:999px;color:#fff;background:rgba(255,255,255,.13);font:500 12px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:pointer;pointer-events:auto}
      #${ROOT_ID} .as-skip:hover{background:rgba(255,255,255,.23)}
      @keyframes as-sub-in{to{opacity:1}}@keyframes as-hint-in{to{opacity:1}}
      @media(max-width:520px){#${ROOT_ID} .as-subtitle{top:calc(50% + clamp(96px,17vh,135px));font-size:9px;letter-spacing:.22em}#${ROOT_ID} .as-hint{bottom:max(26px,env(safe-area-inset-bottom))}}
      @media(max-height:620px){#${ROOT_ID} .as-subtitle{top:calc(50% + 92px)}}
    `;
  }

  function buildWordParticles() {
    const measureCanvas = document.createElement('canvas');
    const measure = measureCanvas.getContext('2d');
    if (!measure) throw new Error('Canvas text measurement unavailable');

    // Compact lowercase script wordmark: never stretch the lettering wider than its
    // natural font metrics. This keeps the connected hello shape elegant and narrow.
    let fontSize = Math.min(280, width * 0.30, height * 0.31);
    fontSize = Math.max(34, fontSize);
    const setFont = size => `italic 500 ${size}px ${scriptFontStack}`;
    measure.font = setFont(fontSize);

    const maxTextWidth = Math.min(width * 0.68, 900);
    let textWidth = measure.measureText(word).width;
    while (textWidth > maxTextWidth && fontSize > 34) {
      fontSize = Math.max(34, fontSize * 0.92);
      measure.font = setFont(fontSize);
      textWidth = measure.measureText(word).width;
    }
    // Only allow mild compression when needed; never horizontally enlarge the word.
    const horizontalScale = clamp(maxTextWidth / Math.max(1, textWidth), 0.72, 1.0);
    const maskWidth = Math.max(1, Math.ceil(textWidth * horizontalScale + fontSize * 0.22));
    const maskHeight = Math.max(1, Math.ceil(fontSize * 1.65));
    mask.width = maskWidth;
    mask.height = maskHeight;

    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.clearRect(0, 0, maskWidth, maskHeight);
    mctx.save();
    mctx.scale(horizontalScale, 1);
    mctx.font = setFont(fontSize);
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.fillStyle = '#fff';
    mctx.fillText(word, maskWidth / (2 * horizontalScale), maskHeight / 2);
    mctx.restore();

    const pixels = mctx.getImageData(0, 0, maskWidth, maskHeight).data;
    const step = fontSize < 60 ? 2 : 3;
    const targets = [];
    for (let y = 0; y < maskHeight; y += step) {
      for (let x = 0; x < maskWidth; x += step) {
        const alpha = pixels[(y * maskWidth + x) * 4 + 3];
        if (alpha > 70) {
          targets.push({
            x: (width - maskWidth) / 2 + x,
            y: height * 0.405 - maskHeight / 2 + y,
            brightness: alpha / 255,
            u: x / Math.max(1, maskWidth - 1)
          });
        }
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
      size: random(1.9, 3.05),
      alpha: random(0.86, 1) * (0.72 + 0.28 * p.brightness),
      u: p.u,
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

  function rainbowColor(position) {
    const t = clamp(position, 0, 1);
    for (let i = 1; i < rainbowStops.length; i++) {
      const previous = rainbowStops[i - 1];
      const next = rainbowStops[i];
      if (t <= next[0]) {
        const f = (t - previous[0]) / (next[0] - previous[0]);
        const rgb = previous[1].map((channel, index) => Math.round(channel + (next[1][index] - channel) * f));
        return rgb;
      }
    }
    return rainbowStops[rainbowStops.length - 1][1];
  }

  function mixWhiteWithColor(color, amount) {
    const t = clamp(amount, 0, 1);
    const rgb = color.map(channel => Math.round(255 + (channel - 255) * t));
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1;
    ctx.filter = 'none';

    for (const s of ambience) {
      const pulse = 0.68 + 0.32 * Math.sin(now * 0.0012 + s.phase);
      s.y -= s.speed * 0.12;
      if (s.y < -2) { s.y = height + 2; s.x = random(0, width); }
      ctx.beginPath();
      ctx.fillStyle = `rgba(185,215,255,${s.alpha * pulse})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Keep the greeting in normal compositing mode: no inversion, multiply, or
    // page-wide tint is allowed to turn the white gathering stars dark.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.filter = 'none';

    const elapsed = now - startAt;
    // First the stars form a pure-white word. Only after they have settled does
    // the smooth Apple-inspired spectrum spread over the complete lettering.
    const colorProgress = smoothstep(clamp((elapsed - 2850) / 1350, 0, 1));

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

      const pulse = 0.82 + 0.18 * Math.sin(now * 0.003 + p.phase);
      const color = mixWhiteWithColor(rainbowColor(p.u), colorProgress);
      ctx.globalAlpha = p.alpha * pulse;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // A few tiny cross-sparkles add a polished luminous finish without
      // adding expensive blur filters to the full canvas.
      if (p.i % 17 === 0 && raw > 0.72) {
        ctx.globalAlpha = 0.48 + colorProgress * 0.25;
        ctx.strokeStyle = colorProgress < 0.01 ? 'rgba(235,245,255,.75)' : color;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(x - 2.7, y); ctx.lineTo(x + 2.7, y);
        ctx.moveTo(x, y - 2.7); ctx.lineTo(x, y + 2.7);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
  }

  function protectStarCanvas() {
    if (!canvas || !canvas.isConnected) return;
    canvas.style.setProperty('filter', 'none', 'important');
    canvas.style.setProperty('-webkit-filter', 'none', 'important');
    canvas.style.setProperty('mix-blend-mode', 'normal', 'important');
    canvas.style.setProperty('opacity', '1', 'important');
    canvas.style.setProperty('visibility', 'visible', 'important');
    canvas.style.setProperty('display', 'block', 'important');
  }

  function safeTick(now) {
    if (dismissed || !root || !root.isConnected) return;
    protectStarCanvas();
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
      canvas.style.setProperty('filter', 'none', 'important');
      canvas.style.setProperty('-webkit-filter', 'none', 'important');
      canvas.style.setProperty('mix-blend-mode', 'normal', 'important');
      canvas.style.setProperty('opacity', '1', 'important');

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
      root.setAttribute('aria-label', 'Stars gather to form hello');
      root.innerHTML = '<div class="as-caption"><p class="as-subtitle">WELCOME TO MY WORLD</p></div><p class="as-hint">星辰汇聚成字 · 点击进入 · Press Esc to skip</p><button class="as-skip" type="button" aria-label="跳过开场">跳过 ↗</button>';
      root.appendChild(canvas);
      document.head.appendChild(style);
      document.body.appendChild(root);
      protectStarCanvas();
      requestAnimationFrame(protectStarCanvas);
      window.setTimeout(protectStarCanvas, 150);

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
