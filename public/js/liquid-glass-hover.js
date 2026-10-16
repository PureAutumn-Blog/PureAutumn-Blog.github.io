/* PureAutumn — pointer-tracked glass interaction layer
   Delegated events support Hugo/PaperMod content inserted after page load. */
(() => {
    "use strict";

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const TARGET_SELECTOR = [
        ".first-entry",
        ".post-entry",
        ".post-single",
        ".breadcrumbs",
        ".toc",
        ".paginav",
        ".pagination a",
        ".post-content .luogu-callout",
        ".post-content blockquote",
        ".post-content .highlight",
        ".post-content > pre",
        ".post-tags a",
        ".terms-tags a",
        "#top-link"
    ].join(",");

    let activeTarget = null;

    function getTarget(event) {
        const node = event.target;
        if (!(node instanceof Element)) return null;
        return node.closest(TARGET_SELECTOR);
    }

    function updateLight(target, event) {
        const rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
        target.style.setProperty("--pa-lg-x", `${x.toFixed(2)}%`);
        target.style.setProperty("--pa-lg-y", `${y.toFixed(2)}%`);
    }

    function activate(target, event) {
        if (activeTarget !== target) {
            deactivate();
            activeTarget = target;
            activeTarget.classList.add("pa-liquid-glass-target", "pa-lg-hover");
        }
        updateLight(activeTarget, event);
    }

    function deactivate() {
        if (!activeTarget) return;
        activeTarget.classList.remove("pa-lg-hover");
        activeTarget.style.removeProperty("--pa-lg-x");
        activeTarget.style.removeProperty("--pa-lg-y");
        activeTarget = null;
    }

    document.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const target = getTarget(event);
        if (!target) {
            deactivate();
            return;
        }
        activate(target, event);
    }, { passive: true });

    document.addEventListener("pointerout", (event) => {
        if (!event.relatedTarget) deactivate();
    }, { passive: true });

    window.addEventListener("blur", deactivate, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) deactivate();
    });
})();