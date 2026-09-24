/* =========================================================
   Guía de estudio · Registros de desplazamiento
   Interactividad: tema, simulador, calculadora,
   contadores anillo/Johnson y cuestionario.
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Tema claro/oscuro ---------- */
  const themeBtn = $("#themeBtn");
  const applyTheme = (t) => {
    if (t) document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
  };
  try {
    const saved = localStorage.getItem("dsd-theme");
    if (saved) applyTheme(saved);
  } catch (e) {}
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme");
      const isDark = cur
        ? cur === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      const next = isDark ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("dsd-theme", next); } catch (e) {}
    });
  }

  /* =========================================================
     SIMULADOR DE REGISTRO DE DESPLAZAMIENTO (8 bits, → derecha)
     ========================================================= */
  const N = 8;
  let reg = new Array(N).fill(0); // reg[0] = izquierda (entrada), reg[N-1] = derecha (salida)
  let inBit = 1;
  let pulses = 0;
  const simReg = $("#simReg");
  const simCount = $("#simCount");
  const simOut = $("#simOut");

  function renderReg(flashIdx) {
    if (!simReg) return;
    simReg.innerHTML = "";
    const inArrow = document.createElement("span");
    inArrow.className = "arrow-in";
    inArrow.textContent = inBit + " →";
    inArrow.title = "Próximo bit a entrar";
    simReg.appendChild(inArrow);
    reg.forEach((b, i) => {
      const d = document.createElement("div");
      d.className = "bit" + (b ? " on" : "") + (flashIdx === i ? " flash" : "");
      d.textContent = b;
      simReg.appendChild(d);
    });
    const outArrow = document.createElement("span");
    outArrow.className = "arrow-out";
    outArrow.textContent = "→ sale";
    simReg.appendChild(outArrow);
  }

  function pulse() {
    const out = reg[N - 1];        // el bit de la derecha sale
    for (let i = N - 1; i > 0; i--) reg[i] = reg[i - 1]; // corre a la derecha
    reg[0] = inBit;                // entra el bit nuevo por la izquierda
    pulses++;
    if (simCount) simCount.textContent = pulses;
    if (simOut) simOut.textContent = out;
    renderReg(0);
    if (!reduceMotion) {
      setTimeout(() => renderReg(-1), 220);
    }
  }

  if (simReg) {
    renderReg(-1);
    $("#simPulse") && $("#simPulse").addEventListener("click", pulse);

    // selector de bit de entrada
    $$("#simInBit button").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("#simInBit button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        inBit = parseInt(btn.dataset.bit, 10);
        renderReg(-1);
      });
    });

    $("#simClear") && $("#simClear").addEventListener("click", () => {
      reg = new Array(N).fill(0); pulses = 0;
      if (simCount) simCount.textContent = 0;
      if (simOut) simOut.textContent = "—";
      renderReg(-1);
    });

    $("#simRand") && $("#simRand").addEventListener("click", () => {
      reg = reg.map(() => (Math.random() < 0.5 ? 0 : 1));
      renderReg(-1);
    });

    let autoTimer = null;
    $("#simAuto") && $("#simAuto").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; btn.textContent = "⏩ Auto ×8"; return; }
      let k = 0; btn.textContent = "⏸ Parar";
      autoTimer = setInterval(() => {
        pulse(); k++;
        if (k >= 8) { clearInterval(autoTimer); autoTimer = null; btn.textContent = "⏩ Auto ×8"; }
      }, reduceMotion ? 120 : 420);
    });
  }

  /* =========================================================
     CALCULADORA DE TIEMPOS
     ========================================================= */
  const cN = $("#cN"), cF = $("#cF"), cU = $("#cU");
  const cOutT = $("#cOutT"), cOutSerie = $("#cOutSerie");

  function fmtTime(seconds) {
    if (!isFinite(seconds) || seconds <= 0) return "—";
    const units = [
      [1, "s"], [1e-3, "ms"], [1e-6, "µs"], [1e-9, "ns"], [1e-12, "ps"],
    ];
    for (const [scale, label] of units) {
      if (seconds >= scale) {
        const v = seconds / scale;
        return (Math.round(v * 1000) / 1000) + " " + label;
      }
    }
    return seconds.toExponential(2) + " s";
  }

  function calc() {
    if (!cN) return;
    const n = parseFloat(cN.value);
    const f = parseFloat(cF.value) * parseFloat(cU.value);
    if (!(n > 0) || !(f > 0)) {
      if (cOutT) cOutT.textContent = "—";
      if (cOutSerie) cOutSerie.textContent = "—";
      return;
    }
    const T = 1 / f;
    if (cOutT) cOutT.textContent = fmtTime(T);
    if (cOutSerie) cOutSerie.textContent = fmtTime(n * T);
  }
  [cN, cF, cU].forEach((el) => el && el.addEventListener("input", calc));
  calc();

  /* =========================================================
     CONTADOR ANILLO / JOHNSON (4 flip-flops)
     ========================================================= */
  const NC = 4;
  let cntKind = "ring";
  let cntReg = new Array(NC).fill(0);
  let cntIdx = 0;
  let cntTimer = null;
  const cntRegEl = $("#cntReg");
  const cntStateEl = $("#cntState");
  const cntModEl = $("#cntMod");
  const cntDescEl = $("#cntDesc");

  function cntInit() {
    if (cntKind === "ring") {
      cntReg = [1, 0, 0, 0]; // un solo 1 circulando
    } else {
      cntReg = [0, 0, 0, 0]; // Johnson arranca vacío
    }
    cntIdx = 0;
    cntRender();
    updateMod();
  }
  function updateMod() {
    if (cntModEl) cntModEl.textContent = cntKind === "ring" ? NC : 2 * NC;
  }
  function cntRender() {
    if (!cntRegEl) return;
    cntRegEl.innerHTML = "";
    cntReg.forEach((b) => {
      const d = document.createElement("div");
      d.className = "bit" + (b ? " on" : "");
      d.textContent = b;
      cntRegEl.appendChild(d);
    });
    if (cntStateEl) cntStateEl.textContent = cntIdx;
    if (cntDescEl) {
      cntDescEl.textContent =
        cntKind === "ring"
          ? "Un solo 1 dando vueltas (one-hot)."
          : "Se llena de 1s y luego se vacía.";
    }
  }
  function cntStep() {
    if (cntKind === "ring") {
      // rotación: el último vuelve al primero (sin invertir)
      const last = cntReg[NC - 1];
      for (let i = NC - 1; i > 0; i--) cntReg[i] = cntReg[i - 1];
      cntReg[0] = last;
      cntIdx = (cntIdx + 1) % NC;
    } else {
      // Johnson: entra la NEGación del último
      const fb = cntReg[NC - 1] ? 0 : 1;
      for (let i = NC - 1; i > 0; i--) cntReg[i] = cntReg[i - 1];
      cntReg[0] = fb;
      cntIdx = (cntIdx + 1) % (2 * NC);
    }
    cntRender();
  }
  if (cntRegEl) {
    cntInit();
    $("#cntStep") && $("#cntStep").addEventListener("click", cntStep);
    $("#cntReset") && $("#cntReset").addEventListener("click", () => {
      if (cntTimer) { clearInterval(cntTimer); cntTimer = null; }
      cntInit();
    });
    $("#cntRun") && $("#cntRun").addEventListener("click", () => {
      if (cntTimer) { clearInterval(cntTimer); cntTimer = null; return; }
      cntTimer = setInterval(cntStep, reduceMotion ? 300 : 650);
    });
    $$("#cntType button").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("#cntType button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        cntKind = btn.dataset.type;
        if (cntTimer) { clearInterval(cntTimer); cntTimer = null; }
        cntInit();
      });
    });
  }

  /* =========================================================
     CUESTIONARIO INTERACTIVO
     ========================================================= */
  const answered = {};
  function updateScore() {
    const total = $$("#quiz .q").length;
    let ok = 0;
    Object.values(answered).forEach((v) => { if (v) ok++; });
    const el = $("#quizScore");
    if (el) el.textContent = ok + " / " + total;
  }

  $$("#quiz .q").forEach((q) => {
    const qid = q.dataset.q;
    const opts = $$(".q-opts li", q);
    const explain = $(".q-explain", q);
    opts.forEach((li) => {
      li.addEventListener("click", () => {
        const isCorrect = li.dataset.correct === "true";
        // limpia marcas previas
        opts.forEach((o) => o.classList.remove("wrong"));
        if (isCorrect) {
          li.classList.add("correct");
          if (!(qid in answered)) answered[qid] = true;
        } else {
          li.classList.add("wrong");
          // muestra también cuál era la correcta
          opts.forEach((o) => { if (o.dataset.correct === "true") o.classList.add("correct"); });
          if (!(qid in answered)) answered[qid] = false;
        }
        if (explain) explain.classList.add("show");
        updateScore();
      });
    });
  });

  $("#quizReveal") && $("#quizReveal").addEventListener("click", () => {
    $$("#quiz .q").forEach((q) => {
      $$(".q-opts li", q).forEach((o) => {
        if (o.dataset.correct === "true") o.classList.add("correct");
      });
      const ex = $(".q-explain", q);
      if (ex) ex.classList.add("show");
    });
  });

  $("#quizReset") && $("#quizReset").addEventListener("click", () => {
    Object.keys(answered).forEach((k) => delete answered[k]);
    $$("#quiz .q").forEach((q) => {
      $$(".q-opts li", q).forEach((o) => o.classList.remove("correct", "wrong"));
      const ex = $(".q-explain", q);
      if (ex) ex.classList.remove("show");
    });
    updateScore();
  });
  updateScore();

  /* ---------- Resalta la sección activa en la nav ---------- */
  const navLinks = $$(".topnav a");
  const map = {};
  navLinks.forEach((a) => { map[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && map[en.target.id]) {
            navLinks.forEach((a) => a.style.color = "");
            navLinks.forEach((a) => a.style.background = "");
            map[en.target.id].style.color = "var(--ink)";
            map[en.target.id].style.background = "var(--bg-soft)";
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main section[id]").forEach((s) => obs.observe(s));
  }
})();
