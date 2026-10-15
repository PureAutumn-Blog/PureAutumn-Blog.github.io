
/* PureAutumn — Pulsing Blue Cursor */
(() => {
    // 只在有真实鼠标的桌面设备启用
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
    }

    function init() {
        if (document.getElementById("pa-pulsing-cursor")) return;

        const cursor = document.createElement("div");
        cursor.id = "pa-pulsing-cursor";
        cursor.setAttribute("aria-hidden", "true");

        cursor.innerHTML = `
            <span class="pa-cursor-aura"></span>
            <span class="pa-cursor-ring"></span>
            <span class="pa-cursor-core"></span>
        `;

        document.body.appendChild(cursor);

        let visible = false;
        let hovering = false;

        function moveCursor(event) {
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;

            if (!visible) {
                visible = true;
                cursor.classList.add("is-visible");
            }

            const target = event.target;

            const nextHover = !!(
                target instanceof Element &&
                target.closest(
                    'a, button, [role="button"], summary, ' +
                    'input[type="button"], input[type="submit"], ' +
                    '[data-cursor-hover]'
                )
            );

            if (nextHover !== hovering) {
                hovering = nextHover;
                cursor.classList.toggle("is-hovering", hovering);
            }
        }

        document.addEventListener("pointermove", moveCursor, {
            passive: true
        });

        document.addEventListener("pointerdown", () => {
            cursor.classList.add("is-clicking");
        }, { passive: true });

        document.addEventListener("pointerup", () => {
            cursor.classList.remove("is-clicking");
        }, { passive: true });

        document.addEventListener("pointerout", event => {
            if (!event.relatedTarget) {
                cursor.classList.remove("is-visible");
                visible = false;
            }
        });

        window.addEventListener("blur", () => {
            cursor.classList.remove("is-visible");
            visible = false;
        });

        window.addEventListener("focus", () => {
            if (visible) cursor.classList.add("is-visible");
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
