
/* PureAutumn — Multistage Fireworks + Purple Liquid Ring
 * 烟花在屏幕上方爆炸：
 * 大烟花 -> 不同速度的火星 -> 附近短暂闪光 -> 彩色微粒
 * 同时保留紫色液体点击环
 */
(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    function init() {
        if (document.getElementById("pa-click-fluid")) return;

        const canvas = document.createElement("canvas");
        canvas.id = "pa-click-fluid";
        canvas.setAttribute("aria-hidden", "true");

        Object.assign(canvas.style, {
            position: "fixed",
            inset: "0",
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: "-1",
            background: "transparent"
        });

        document.body.appendChild(canvas);

        const ctx = canvas.getContext("2d", {
            alpha: true,
            desynchronized: true
        });

        if (!ctx) return;

        let w = 0;
        let h = 0;
        let dpr = 1;
        let raf = 0;
        let lastFrame = 0;

        const rings = [];
        const rockets = [];
        const shells = [];
        const sparks = [];
        const flashes = [];

        // 性能限制，避免快速连续点击造成卡顿
        const MAX_ROCKETS = 3;
        const MAX_SHELLS = 100;
        const MAX_SPARKS = 520;
        const MAX_FLASHES = 22;
        const MAX_RINGS = 5;

        // 随机烟花配色：柔和但鲜明
        const palette = [
            [172, 137, 255], // 淡紫
            [87, 174, 255],  // 天蓝
            [255, 130, 184], // 樱花粉
            [102, 220, 178], // 薄荷绿
            [255, 197, 98],  // 金色
            [128, 144, 255], // 蓝紫
            [255, 144, 125], // 珊瑚橙
            [113, 222, 255], // 冰青
            [255, 164, 218]  // 柔粉
        ];

        const white = [255, 250, 255];

        const rand = (min, max) =>
            min + Math.random() * (max - min);

        const rgba = (c, a = 1) =>
            `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`;

        function boundedPush(list, item, max) {
            list.push(item);

            if (list.length > max) {
                list.splice(0, list.length - max);
            }
        }

        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;

            // 限制像素比，减轻高分辨率屏幕负担
            dpr = Math.min(window.devicePixelRatio || 1, 1.25);

            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function addFlash(x, y, color, radius, life = 8) {
            boundedPush(flashes, {
                x,
                y,
                color,
                radius,
                life,
                maxLife: life
            }, MAX_FLASHES);
        }

        function addSpark(
            x, y, color, angle, speed, life, size
        ) {
            boundedPush(sparks, {
                x,
                y,
                px: x,
                py: y,
                p2x: x,
                p2y: y,

                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,

                color,
                life,
                maxLife: life,
                size,

                gravity: rand(0.008, 0.022),
                drag: rand(0.993, 0.997)
            }, MAX_SPARKS);
        }

        /*
         * 第一次爆炸：
         * 产生较多火星，并混合快、中、慢三种速度。
         */
        function explodeLarge(rocket) {
            const count = Math.floor(rand(36, 45));

            // 中心闪光
            addFlash(
                rocket.x,
                rocket.apexY,
                rocket.color,
                rand(48, 68),
                12
            );

            // 中心亮星
            for (let i = 0; i < 16; i++) {
                const angle =
                    Math.PI * 2 * i / 16 +
                    rand(-0.08, 0.08);

                addSpark(
                    rocket.x,
                    rocket.apexY,
                    Math.random() < 0.75
                        ? rocket.color
                        : white,
                    angle,
                    rand(0.9, 2.3),
                    rand(18, 30),
                    rand(1.0, 1.8)
                );
            }

            const offset = rand(0, Math.PI * 2);

            for (let i = 0; i < count; i++) {
                const angle =
                    offset +
                    Math.PI * 2 * i / count +
                    rand(-0.06, 0.06);

                const roll = Math.random();

                let speed;
                let life;

                if (roll < 0.32) {
                    // 慢速火星
                    speed = rand(0.9, 1.7);
                    life = rand(34, 46);
                } else if (roll < 0.76) {
                    // 中速火星
                    speed = rand(1.8, 3.0);
                    life = rand(27, 38);
                } else {
                    // 快速火星
                    speed = rand(3.0, 4.2);
                    life = rand(22, 31);
                }

                const color = Math.random() < 0.78
                    ? rocket.color
                    : palette[
                        Math.floor(Math.random() * palette.length)
                    ];

                boundedPush(shells, {
                    x: rocket.x,
                    y: rocket.apexY,
                    px: rocket.x,
                    py: rocket.apexY,
                    p2x: rocket.x,
                    p2y: rocket.apexY,

                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,

                    color,
                    life,
                    maxLife: life,
                    size: rand(1.6, 2.8)
                }, MAX_SHELLS);
            }
        }

        /*
         * 第二次爆炸：
         * 在每颗火星附近短暂闪光，然后释放少量微粒。
         */
        function explodeSmall(shell) {
            addFlash(
                shell.x,
                shell.y,
                shell.color,
                rand(18, 30),
                7
            );

            const count = Math.floor(rand(5, 8));
            const offset = rand(0, Math.PI * 2);

            for (let i = 0; i < count; i++) {
                const angle =
                    offset +
                    Math.PI * 2 * i / count +
                    rand(-0.22, 0.22);

                const color = Math.random() < 0.82
                    ? shell.color
                    : white;

                addSpark(
                    shell.x,
                    shell.y,
                    color,
                    angle,
                    rand(0.35, 1.25),
                    rand(14, 25),
                    rand(0.65, 1.25)
                );
            }

            // 少量缓慢消散的余烬
            for (let i = 0; i < 2; i++) {
                addSpark(
                    shell.x,
                    shell.y,
                    shell.color,
                    rand(0, Math.PI * 2),
                    rand(0.25, 0.8),
                    rand(24, 36),
                    rand(0.5, 0.85)
                );
            }
        }

        // 点击：紫色液体环 + 随机彩色烟花
        function createEffect(event) {
            if (event.button !== 0 || event.isPrimary === false) {
                return;
            }

            const x = event.clientX;
            const y = event.clientY;
            const now = performance.now();

            // 紫色液体环
            boundedPush(rings, {
                x,
                y,
                start: now,
                duration: 1250,

                maxRadius: Math.min(
                    290,
                    Math.max(150, Math.min(w, h) * 0.27)
                ),

                phase: rand(0, Math.PI * 2),

                drops: Array.from({ length: 13 }, () => ({
                    angle: rand(0, Math.PI * 2),
                    distance: rand(0.62, 1.10),
                    size: rand(3, 7),
                    spin: rand(-0.8, 0.8)
                }))
            }, MAX_RINGS);

            // 每次点击随机选择烟花主色
            const color = palette[
                Math.floor(Math.random() * palette.length)
            ];

            /*
             * 爆炸高度：
             * 以屏幕顶部往下 20% 为基准，
             * 每次随机偏移 -25 到 +25 像素。
             * 点击位置只影响起飞位置，不决定正常情况下的爆炸高度。
             */
            const targetExplosionY = Math.max(
                45,
                Math.min(
                    h * 0.20 + rand(-25, 25),
                    h * 0.25
                )
            );

            // 确保烟花通常是向上飞的。
            // 点击位置太靠上时，在可用空间内尽可能向上发射。
            const explosionY = Math.max(
                24,
                Math.min(targetExplosionY, y - 45)
            );

            boundedPush(rockets, {
                x,
                startY: y,
                apexY: explosionY,
                start: now,
                duration: rand(420, 560),
                color,
                phase: rand(0, Math.PI * 2)
            }, MAX_ROCKETS);

            wake();
        }

        // 不规则紫色液体环轮廓
        function traceContour(
            ring, radius, time, reverse = false
        ) {
            const count = 64;

            for (let i = 0; i <= count; i++) {
                const direction = reverse ? -1 : 1;

                const angle =
                    direction *
                    i / count *
                    Math.PI * 2;

                const wave =
                    1 +
                    0.075 * Math.sin(
                        angle * 3 + ring.phase + time * 4
                    ) +
                    0.045 * Math.sin(
                        angle * 7 - ring.phase - time * 2.6
                    ) +
                    0.025 * Math.sin(
                        angle * 11 + time * 3.1
                    );

                const r = radius * wave;

                const px = ring.x + Math.cos(angle) * r;
                const py = ring.y + Math.sin(angle) * r;

                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }

            ctx.closePath();
        }

        function drawRing(ring, now) {
            const t = Math.min(
                1,
                (now - ring.start) / ring.duration
            );

            const radius =
                7 + ring.maxRadius *
                (1 - Math.pow(1 - t, 2.2));

            const thickness = 10 + 9 * Math.sin(t * Math.PI);
            const alpha = 0.52 * Math.pow(1 - t, 1.15);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#9a80ff";

            ctx.beginPath();

            traceContour(ring, radius + thickness, t * 3);

            traceContour(
                ring,
                Math.max(1, radius - thickness * 0.65),
                t * 3,
                true
            );

            ctx.fill("evenodd");

            ctx.lineWidth = 1.6;
            ctx.strokeStyle = "#c5b8ff";
            ctx.stroke();

            for (const drop of ring.drops) {
                const angle = drop.angle + t * drop.spin;
                const distance = radius * drop.distance;

                const px = ring.x + Math.cos(angle) * distance;
                const py = ring.y + Math.sin(angle) * distance;

                const size = drop.size * (1 - t * 0.35);

                ctx.fillStyle = rgba(
                    [165, 142, 255],
                    0.40 * (1 - t)
                );

                ctx.beginPath();

                ctx.ellipse(
                    px,
                    py,
                    size * 1.35,
                    size,
                    angle,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            ctx.restore();
        }

        // 柔和的爆炸闪光
        function drawFlash(flash) {
            const t = 1 - flash.life / flash.maxLife;

            const radius = Math.max(
                1,
                flash.radius * (0.25 + 0.75 * t)
            );

            const alpha = flash.life / flash.maxLife;

            const gradient = ctx.createRadialGradient(
                flash.x,
                flash.y,
                0,
                flash.x,
                flash.y,
                radius
            );

            gradient.addColorStop(
                0,
                rgba(white, 0.72 * alpha)
            );

            gradient.addColorStop(
                0.22,
                rgba(flash.color, 0.46 * alpha)
            );

            gradient.addColorStop(
                1,
                rgba(flash.color, 0)
            );

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                flash.x,
                flash.y,
                radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // 轻量尾迹，避免每个粒子都使用昂贵的模糊阴影
        function drawTrail(particle, alpha = 0.78, width = 1) {
            const fade = Math.max(
                0,
                particle.life / particle.maxLife
            );

            ctx.globalAlpha = fade * alpha;
            ctx.strokeStyle = rgba(particle.color, 0.84);

            ctx.lineWidth = Math.max(
                0.6,
                particle.size * width * fade
            );

            ctx.beginPath();
            ctx.moveTo(particle.p2x, particle.p2y);
            ctx.lineTo(particle.px, particle.py);
            ctx.lineTo(particle.x, particle.y);
            ctx.stroke();
        }

        // 烟花从点击位置向目标高度发射
        function drawRocket(rocket, now) {
            const t = Math.min(
                1,
                (now - rocket.start) / rocket.duration
            );

            const eased = 1 - Math.pow(1 - t, 2.4);

            const x = rocket.x +
                Math.sin(
                    t * Math.PI * 2 + rocket.phase
                ) * 3;

            const y = rocket.startY +
                (rocket.apexY - rocket.startY) * eased;

            const gradient = ctx.createLinearGradient(
                x,
                y + 34,
                x,
                y
            );

            gradient.addColorStop(0, rgba(rocket.color, 0));
            gradient.addColorStop(0.7, rgba(rocket.color, 0.52));
            gradient.addColorStop(1, rgba(rocket.color, 0.95));

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.4;
            ctx.lineCap = "round";

            ctx.beginPath();
            ctx.moveTo(x, y + 34);
            ctx.lineTo(x, y - 2);
            ctx.stroke();

            ctx.fillStyle = rgba(white, 0.96);

            ctx.beginPath();
            ctx.arc(x, y, 2.3, 0, Math.PI * 2);
            ctx.fill();

            if (t >= 1) {
                rocket.done = true;
                rocket.x = x;

                explodeLarge(rocket);
            }
        }

        function updateShell(shell, dt) {
            shell.p2x = shell.px;
            shell.p2y = shell.py;

            shell.px = shell.x;
            shell.py = shell.y;

            shell.x += shell.vx * dt;
            shell.y += shell.vy * dt;

            shell.vx *= Math.pow(0.996, dt);
            shell.vy =
                shell.vy * Math.pow(0.996, dt) +
                0.008 * dt;

            shell.life -= dt;
        }

        function updateSpark(particle, dt) {
            particle.p2x = particle.px;
            particle.p2y = particle.py;

            particle.px = particle.x;
            particle.py = particle.y;

            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;

            particle.vx *= Math.pow(particle.drag, dt);

            particle.vy =
                particle.vy * Math.pow(particle.drag, dt) +
                particle.gravity * dt;

            particle.life -= dt;
        }

        function draw(now) {
            raf = 0;

            // 以 60 FPS 为基准修正速度
            const dt = lastFrame
                ? Math.min(
                    2,
                    Math.max(0.5, (now - lastFrame) / 16.667)
                )
                : 1;

            lastFrame = now;

            ctx.clearRect(0, 0, w, h);

            // 闪光
            for (let i = flashes.length - 1; i >= 0; i--) {
                const flash = flashes[i];

                drawFlash(flash);
                flash.life -= dt;

                if (flash.life <= 0) {
                    flashes.splice(i, 1);
                }
            }

            // 紫色液体环
            for (let i = rings.length - 1; i >= 0; i--) {
                const ring = rings[i];

                if (now - ring.start >= ring.duration) {
                    rings.splice(i, 1);
                } else {
                    drawRing(ring, now);
                }
            }

            // 升空中的烟花
            for (let i = rockets.length - 1; i >= 0; i--) {
                const rocket = rockets[i];

                drawRocket(rocket, now);

                if (rocket.done) {
                    rockets.splice(i, 1);
                }
            }

            // 第一轮爆炸产生的火星
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.lineCap = "round";

            for (let i = shells.length - 1; i >= 0; i--) {
                const shell = shells[i];

                updateShell(shell, dt);
                drawTrail(shell, 0.72, 1.5);

                ctx.globalAlpha = Math.max(
                    0,
                    shell.life / shell.maxLife
                );

                ctx.fillStyle = rgba(shell.color, 0.95);

                ctx.beginPath();
                ctx.arc(shell.x, shell.y, shell.size, 0, Math.PI * 2);
                ctx.fill();

                if (shell.life <= 0) {
                    // 在火星当前位置短暂闪光，再散开微粒
                    explodeSmall(shell);
                    shells.splice(i, 1);
                }
            }

            // 第二轮爆炸的细小粒子
            for (let i = sparks.length - 1; i >= 0; i--) {
                const particle = sparks[i];

                updateSpark(particle, dt);
                drawTrail(particle, 0.78, 1);

                const fade = Math.max(
                    0,
                    particle.life / particle.maxLife
                );

                ctx.globalAlpha = fade;
                ctx.fillStyle = rgba(particle.color, 0.95);

                ctx.beginPath();

                ctx.arc(
                    particle.x,
                    particle.y,
                    Math.max(0.45, particle.size * fade),
                    0,
                    Math.PI * 2
                );

                ctx.fill();

                if (particle.life <= 0) {
                    sparks.splice(i, 1);
                }
            }

            ctx.restore();

            // 所有动画结束后停止请求帧
            if (
                rings.length ||
                rockets.length ||
                shells.length ||
                sparks.length ||
                flashes.length
            ) {
                raf = requestAnimationFrame(draw);
            } else {
                lastFrame = 0;
                ctx.clearRect(0, 0, w, h);
            }
        }

        function wake() {
            if (!raf) {
                raf = requestAnimationFrame(draw);
            }
        }

        window.addEventListener("resize", resize, {
            passive: true
        });

        window.addEventListener("pointerdown", createEffect, {
            passive: true
        });

        resize();
    }

    if (document.readyState === "complete") {
        init();
    } else {
        window.addEventListener("load", init, {
            once: true
        });
    }
})();
