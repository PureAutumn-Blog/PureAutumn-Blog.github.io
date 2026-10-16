
/* PureAutumn — Flowing Cursor Glow */
(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.id = "pa-flow-background";

    Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: "0"
    });

    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const colors = [
        [115, 177, 255],  // 冰蓝
        [160, 145, 255],  // 淡紫
        [111, 216, 224],  // 冰青
        [190, 175, 255]   // 柔紫
    ];

    const particles = [];
    const rand = (a, b) => a + Math.random() * (b - a);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastX = null;
    let lastY = null;
    let running = false;
    let keepAliveUntil = 0;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
    }

    function spawn(x, y, dx, dy) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = rand(105, 195);

        particles.push({
            x: x + rand(-7, 7),
            y: y + rand(-7, 7),

            // 给光晕初速度，让它离开鼠标后继续流动
            vx: dx * 0.065 + rand(-0.55, 0.55),
            vy: dy * 0.065 + rand(-0.55, 0.55),

            radius: rand(28, 76),
            life,
            maxLife: life,
            color,
            alpha: rand(0.12, 0.25),
            phase: rand(0, Math.PI * 2),
            curl: rand(0.012, 0.032)
        });

        // 控制数量，避免长时间移动后积累过多粒子
        if (particles.length > 200) {
            particles.splice(0, particles.length - 200);
        }
    }

    function onPointerMove(event) {
        if (event.pointerType === "touch") return;

        const x = event.clientX;
        const y = event.clientY;

        if (lastX === null) {
            lastX = x;
            lastY = y;
            spawn(x, y, 0, 0);
            wake();
            return;
        }

        const dx = x - lastX;
        const dy = y - lastY;
        const distance = Math.hypot(dx, dy);

        lastX = x;
        lastY = y;

        if (distance < 2) return;

        // 沿着鼠标移动轨迹连续产生柔和光团
        const steps = Math.min(24, Math.ceil(distance / 12));

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const px = x - dx * (1 - t);
            const py = y - dy * (1 - t);

            spawn(px, py, dx / steps, dy / steps);

            if (Math.random() < 0.3) {
                spawn(
                    px + rand(-12, 12),
                    py + rand(-12, 12),
                    dx / steps,
                    dy / steps
                );
            }
        }

        keepAliveUntil = performance.now() + 2200;
        wake();
    }

    function animate(now) {
        running = false;

        // 慢慢擦除旧痕迹，而不是瞬间清空画布
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 0.012)";
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = "source-over";

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            p.life -= 1;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            // 轻微旋转和阻力：制造离开鼠标后的流动感
            p.phase += p.curl;

            p.vx = (p.vx + Math.cos(p.phase) * 0.018) * 0.993;
            p.vy = (p.vy + Math.sin(p.phase * 1.13) * 0.018) * 0.993;

            p.x += p.vx;
            p.y += p.vy;

            const progress = 1 - p.life / p.maxLife;
            const fade = Math.min(
                1,
                progress * 4,
                (1 - progress) * 2.5
            );

            const alpha = p.alpha * fade;

            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.radius
            );

            const [r, g, b] = p.color;

            gradient.addColorStop(
                0,
                `rgba(${r}, ${g}, ${b}, ${(alpha * 0.72).toFixed(3)})`
            );
            gradient.addColorStop(
                0.25,
                `rgba(${r}, ${g}, ${b}, ${(alpha * 0.4).toFixed(3)})`
            );
            gradient.addColorStop(
                0.62,
                `rgba(${r}, ${g}, ${b}, ${(alpha * 0.12).toFixed(3)})`
            );
            gradient.addColorStop(
                1,
                `rgba(${r}, ${g}, ${b}, 0)`
            );

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        if (particles.length > 0 || now < keepAliveUntil) {
            running = true;
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, width, height);
        }
    }

    function wake() {
        if (running) return;
        running = true;
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, {
        passive: true
    });

    window.addEventListener("blur", () => {
        lastX = null;
        lastY = null;
    });

    resize();
})();
