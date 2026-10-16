/* LIQUID_GLASS_INTERACTION_IOS26_V1 — cursor highlight + progressive SVG refraction. */
(() => {
    'use strict';

    const TARGETS = [
        '.post-entry',
        '.first-entry',
        '.archive-entry',
        '.toc',
        '.post-footer',
        '.share-buttons',
        '.paginav',
        '.breadcrumbs'
    ];
    const TARGET_SELECTOR = TARGETS.join(',');
    const TARGET_CLASS = 'lg26-glass-target';
    const LAYER_CLASS = 'lg26-specular-layer';
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    function addSvgRefractionFilter() {
        if (!document.body || document.getElementById('lg26-liquid-refraction')) return;

        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.style.cssText = 'position:fixed;left:-1px;top:-1px;width:0;height:0;overflow:hidden;pointer-events:none;';

        const defs = document.createElementNS(ns, 'defs');
        const filter = document.createElementNS(ns, 'filter');
        filter.setAttribute('id', 'lg26-liquid-refraction');
        filter.setAttribute('x', '-12%');
        filter.setAttribute('y', '-12%');
        filter.setAttribute('width', '124%');
        filter.setAttribute('height', '124%');
        filter.setAttribute('color-interpolation-filters', 'sRGB');

        const turbulence = document.createElementNS(ns, 'feTurbulence');
        turbulence.setAttribute('type', 'fractalNoise');
        turbulence.setAttribute('baseFrequency', '0.018 0.026');
        turbulence.setAttribute('numOctaves', '2');
        turbulence.setAttribute('seed', '11');
        turbulence.setAttribute('result', 'lg26-liquid-noise');

        const displacement = document.createElementNS(ns, 'feDisplacementMap');
        displacement.setAttribute('in', 'SourceGraphic');
        displacement.setAttribute('in2', 'lg26-liquid-noise');
        displacement.setAttribute('scale', '12');
        displacement.setAttribute('xChannelSelector', 'R');
        displacement.setAttribute('yChannelSelector', 'G');

        filter.append(turbulence, displacement);
        defs.appendChild(filter);
        svg.appendChild(defs);
        document.body.appendChild(svg);

        // backdrop-filter:url(#svg-filter) is only enabled on desktop Chromium.
        // Safari/Firefox keep the ordinary blur/saturation fallback to avoid a blank backdrop.
        const ua = navigator.userAgent || '';
        const hasUserAgentData = !!navigator.userAgentData;
        const looksLikeBlink = hasUserAgentData || /\b(?:Chrome|Chromium|Edg|OPR)\//.test(ua);
        const isIosOrIosBrowser = /iPhone|iPad|iPod|CriOS|EdgiOS|FxiOS|OPiOS/.test(ua);
        const cssCanParse = window.CSS && CSS.supports('backdrop-filter', 'url("#lg26-liquid-refraction") blur(1px)');
        if (finePointer.matches && looksLikeBlink && !isIosOrIosBrowser && cssCanParse) {
            document.documentElement.classList.add('lg26-svg-refraction-ready');
        }
    }

    function addTarget(element) {
        if (!(element instanceof HTMLElement)) return;
        if (element.classList.contains(TARGET_CLASS)) return;
        if (element.closest('pre, code, .highlight, table')) return;

        element.classList.add(TARGET_CLASS);
        element.dataset.lg26GlassReady = 'true';
        element.style.setProperty('--lg26-x', '50%');
        element.style.setProperty('--lg26-y', '16%');

        const layer = document.createElement('span');
        layer.className = LAYER_CLASS;
        layer.setAttribute('aria-hidden', 'true');
        element.prepend(layer);

        if (!finePointer.matches) return;

        element.addEventListener('pointermove', (event) => {
            if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
            const rect = element.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
            const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
            element.style.setProperty('--lg26-x', `${x.toFixed(2)}%`);
            element.style.setProperty('--lg26-y', `${y.toFixed(2)}%`);
        }, { passive: true });

        element.addEventListener('pointerenter', (event) => {
            if (!event.pointerType || event.pointerType === 'mouse' || event.pointerType === 'pen') {
                element.classList.add('lg26-is-active');
            }
        }, { passive: true });

        element.addEventListener('pointerleave', () => {
            if (!element.contains(document.activeElement)) element.classList.remove('lg26-is-active');
        }, { passive: true });

        element.addEventListener('focusin', () => element.classList.add('lg26-is-active'));
        element.addEventListener('focusout', (event) => {
            if (!event.relatedTarget || !element.contains(event.relatedTarget)) {
                element.classList.remove('lg26-is-active');
            }
        });
    }

    function scan(scope) {
        if (scope instanceof Element && scope.matches(TARGET_SELECTOR)) addTarget(scope);
        if (!scope.querySelectorAll) return;
        scope.querySelectorAll(TARGET_SELECTOR).forEach(addTarget);
    }

    function boot() {
        if (!document.body) return;
        addSvgRefractionFilter();
        scan(document);

        // Covers PaperMod search results, pagination updates and other dynamically inserted UI.
        const observer = new MutationObserver((records) => {
            for (const record of records) {
                for (const node of record.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) scan(node);
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
/* LIQUID_GLASS_VISUAL_HOTFIX_V1 */
;(function () {
    if (window.__liquidGlassVisualHotfixV1) return;
    window.__liquidGlassVisualHotfixV1 = true;

    document.addEventListener('pointermove', function (event) {
        var target = event.target;
        if (!target || !target.closest) return;

        var card = target.closest('.post-entry.lg26-glass-target');
        if (!card) return;

        var rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        var x = Math.max(0, Math.min(100,
            ((event.clientX - rect.left) / rect.width) * 100));
        var y = Math.max(0, Math.min(100,
            ((event.clientY - rect.top) / rect.height) * 100));

        card.style.setProperty('--lg26-pointer-x', x.toFixed(2) + '%');
        card.style.setProperty('--lg26-pointer-y', y.toFixed(2) + '%');
    }, { passive: true });
})();