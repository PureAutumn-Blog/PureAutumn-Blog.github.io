/* PureAutumn — Parabolic Golden Shooting Star */
(() => {
    if (window.__paNaturalMeteorStarted) return;
    window.__paNaturalMeteorStarted = true;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rand = (min, max) => min + Math.random() * (max - min);
    let timer = 0;
    let active = null;

    function schedule(delay = rand(6000, 16000)) {
        clearTimeout(timer);
        timer = setTimeout(launch, delay);
    }

    function launch() {
        if (document.hidden) {
            schedule(2500);
            return;
        }

        // 一次只飞一颗，避免动画重叠卡顿
        if (active) active.remove();

        const star = document.createElement("div");
        star.className = "pa-shooting-star";
        star.setAttribute("aria-hidden", "true");
        document.body.appendChild(star);
        active = star;

        const w = window.innerWidth;
        const h = window.innerHeight;

        // 尾焰长度随屏幕宽度调整
        const length = Math.min(420, Math.max(300, w * 0.28));
        star.style.setProperty("--pa-star-length", `${length}px`);

        // 从屏幕右侧外开始，在左侧外结束
        const x0 = w + length + 80;
        const x1 = -length - 80;

        // 起点偏上，终点通常略低，构成自然的抛物线轨迹
        const y0 = rand(h * 0.04, h * 0.30);
// 纵向位移：形成明显的弧形轨迹
const dy = rand(h * 0.10, h * 0.24);

// 加大抛物线弧度，随机向上弯或向下弯
const curve = rand(-h * 0.16, h * 0.16);

// 缩短飞行时间，让流星更迅速地划过屏幕
const duration = rand(950, 1400);
        const startTime = performance.now();
        const dx = x1 - x0;

        function frame(now) {
            if (!star.isConnected || document.hidden) {
                star.remove();
                if (active === star) active = null;
                schedule(2500);
                return;
            }

            const t = Math.min(1, (now - startTime) / duration);

            // 横向匀速，纵向使用抛物线偏移
            const x = x0 + dx * t;
            const y = y0 + dy * t + 4 * curve * t * (1 - t);

            // 求当前轨迹切线，让尾焰始终与运动方向吻合
            const velocityY = dy + 4 * curve * (1 - 2 * t);
            const angle = Math.atan2(velocityY, dx);

            star.style.left = `${x - length}px`;
            star.style.top = `${y - 3}px`;
            star.style.transform = `rotate(${angle}rad)`;
// 快速出现，飞行过程中逐渐减弱，最后彻底消失
const fadeIn = Math.min(1, t / 0.04);
const fadeOut = Math.min(1, (1 - t) / 0.30);

// 整条流星在飞行过程中逐渐失去亮度
const gradualFade = 1 - 0.28 * t;

// 轻微亮度变化，让光芒更自然
const shimmer = 0.94 + 0.06 * Math.sin(t * 32 + startY);

star.style.opacity = String(
    Math.max(0, fadeIn * fadeOut * gradualFade * shimmer)
);
            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                star.remove();
                if (active === star) active = null;
                schedule();
            }
        }

        requestAnimationFrame(frame);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden && active) {
            active.remove();
            active = null;
        }
    });

    // 首次出现稍快，之后随机间隔
    schedule(rand(2000, 4500));
})();