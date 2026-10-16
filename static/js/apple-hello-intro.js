(function () {
  "use strict";

  // 只在网站首页显示
  var path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/" && path !== "/index.html") return;

  function startHello() {
    if (!document.body || document.getElementById("pa-hello-intro")) return;

    var style = document.createElement("style");
    style.id = "pa-hello-intro-style";
    style.textContent = `
      #pa-hello-intro {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: grid;
        place-items: center;
        pointer-events: none;
        overflow: hidden;
        color: #172033;
        background: radial-gradient(
          ellipse at center,
          rgba(224, 235, 255, .12),
          rgba(255, 255, 255, .025) 48%,
          transparent 75%
        );
        -webkit-backdrop-filter: blur(2px) saturate(1.08);
        backdrop-filter: blur(2px) saturate(1.08);
        opacity: 1;
        transition: opacity .7s ease;
      }

      html[data-theme="dark"] #pa-hello-intro {
        color: #f4f7ff;
        background: radial-gradient(
          ellipse at center,
          rgba(105, 145, 255, .13),
          rgba(18, 24, 42, .05) 50%,
          transparent 76%
        );
      }

      #pa-hello-intro .pa-hello-stage {
        position: relative;
        width: min(92vw, 760px);
        text-align: center;
      }

      #pa-hello-intro .pa-hello-glow {
        position: absolute;
        z-index: -1;
        left: 50%;
        top: 48%;
        width: min(62vw, 470px);
        aspect-ratio: 1;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(115, 165, 255, .18),
          rgba(176, 145, 255, .08) 42%,
          transparent 72%
        );
        filter: blur(27px);
        animation: paHelloBreathe 2.2s ease-in-out infinite alternate;
      }

      #pa-hello-intro svg {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
        filter: drop-shadow(0 5px 22px rgba(105, 145, 255, .10));
      }

      #pa-hello-intro .pa-hello-stroke {
        fill: none;
        stroke: currentColor;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 1100;
        stroke-dashoffset: 1100;
        animation: paHelloDraw 1.5s cubic-bezier(.25,.65,.25,1) forwards;
      }

      #pa-hello-intro .pa-hello-fill {
        fill: currentColor;
        opacity: 0;
        animation: paHelloFill .65s ease .78s forwards;
      }

      #pa-hello-intro .pa-hello-subtitle {
        margin-top: -5px;
        font: 500 10px/1.8 system-ui, -apple-system, "Segoe UI", sans-serif;
        letter-spacing: .32em;
        text-indent: .32em;
        opacity: 0;
        animation: paHelloSubtitle .55s ease 1.15s forwards;
      }

      #pa-hello-intro.pa-hello-leaving {
        opacity: 0;
      }

      #pa-hello-intro.pa-hello-reduced .pa-hello-stroke,
      #pa-hello-intro.pa-hello-reduced .pa-hello-fill,
      #pa-hello-intro.pa-hello-reduced .pa-hello-subtitle,
      #pa-hello-intro.pa-hello-reduced .pa-hello-glow {
        animation: none;
      }

      #pa-hello-intro.pa-hello-reduced .pa-hello-stroke {
        opacity: .15;
        stroke-dashoffset: 0;
      }

      #pa-hello-intro.pa-hello-reduced .pa-hello-fill,
      #pa-hello-intro.pa-hello-reduced .pa-hello-subtitle {
        opacity: 1;
      }

      @keyframes paHelloDraw {
        to { stroke-dashoffset: 0; }
      }

      @keyframes paHelloFill {
        from { opacity: 0; filter: blur(5px); }
        to { opacity: .96; filter: blur(0); }
      }

      @keyframes paHelloSubtitle {
        from { opacity: 0; transform: translateY(7px); }
        to { opacity: .58; transform: translateY(0); }
      }

      @keyframes paHelloBreathe {
        from { opacity: .55; transform: translate(-50%, -50%) scale(.92); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
      }

      @media (prefers-reduced-motion: reduce) {
        #pa-hello-intro .pa-hello-stroke,
        #pa-hello-intro .pa-hello-fill,
        #pa-hello-intro .pa-hello-subtitle,
        #pa-hello-intro .pa-hello-glow {
          animation: none !important;
        }

        #pa-hello-intro .pa-hello-stroke {
          stroke-dashoffset: 0;
          opacity: .15;
        }

        #pa-hello-intro .pa-hello-fill,
        #pa-hello-intro .pa-hello-subtitle {
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    var intro = document.createElement("div");
    intro.id = "pa-hello-intro";
    intro.setAttribute("aria-hidden", "true");

    intro.innerHTML = `
      <div class="pa-hello-stage">
        <div class="pa-hello-glow"></div>
        <svg viewBox="0 0 760 190" role="presentation">
          <text x="380" y="132" text-anchor="middle"
            class="pa-hello-stroke"
            style="font-family:'Apple Chancery','Segoe Script','Brush Script MT',cursive;font-style:italic;font-size:136px;font-weight:400;letter-spacing:-.035em">Hello</text>
          <text x="380" y="132" text-anchor="middle"
            class="pa-hello-fill"
            style="font-family:'Apple Chancery','Segoe Script','Brush Script MT',cursive;font-style:italic;font-size:136px;font-weight:400;letter-spacing:-.035em">Hello</text>
        </svg>
        <div class="pa-hello-subtitle">WELCOME TO MY WORLD</div>
      </div>
    `;

    if (window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      intro.classList.add("pa-hello-reduced");
    }

    document.body.appendChild(intro);

    var closed = false;
    var reduceMotion = intro.classList.contains("pa-hello-reduced");

    function closeIntro() {
      if (closed) return;
      closed = true;
      intro.classList.add("pa-hello-leaving");
      window.removeEventListener("keydown", onKeyDown);

      window.setTimeout(function () {
        intro.remove();
        style.remove();
      }, 750);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") closeIntro();
    }

    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(closeIntro, reduceMotion ? 1300 : 2550);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startHello, { once: true });
  } else {
    startHello();
  }
})();