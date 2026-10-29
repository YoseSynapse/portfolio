/* ============================================================
   VRWM FLAGSHIP TEMPLATE v1 — app.js (vanilla, zero dependencies)
   Modules: toast · drawer · scroll chrome · reveal · counters ·
   wave canvas · tabs · accordion · modals · candle lab ·
   data lab · accent lab · clipboard · contact form · pyodide
   ============================================================ */
"use strict";
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------- drawer ---------- */
const drawer = $("#drawer"), scrim = $("#scrim"), menuBtn = $("#menuBtn");
function setDrawer(open) {
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  scrim.hidden = !open;
}
menuBtn.addEventListener("click", () =>
  setDrawer(!drawer.classList.contains("open")));
scrim.addEventListener("click", () => setDrawer(false));
$$("#drawer a").forEach(a => a.addEventListener("click", () => setDrawer(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setDrawer(false); });

/* ---------- scroll chrome: progress bar, stuck nav, back-to-top ---------- */
const progress = $("#scrollProgress"), nav = $("#topnav");
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  nav.classList.toggle("is-stuck", scrollY > 8);
}, { passive: true });
$("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
$("#year").textContent = new Date().getFullYear();

/* ---------- reveal on scroll ---------- */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); }
  });
}, { threshold: 0.12 });
$$(".reveal").forEach(el => revealIO.observe(el));

/* ---------- animated counters ---------- */
function runCounter(el) {
  const target = Number(el.dataset.count), dur = 1100, t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
const countIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { runCounter(en.target); countIO.unobserve(en.target); }
  });
}, { threshold: 0.6 });
$$(".count").forEach(el => countIO.observe(el));

/* ---------- hero wave canvas (Signal Wave) ---------- */
(function waves() {
  const cv = $("#waveCanvas"), ctx = cv.getContext("2d");
  const COLORS = ["#6D28D9", "#00C2A8", "#FFB020"];
  let w, h, raf, t = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    COLORS.forEach((color, i) => {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const y = h * (0.58 + i * 0.11)
          + Math.sin(x * 0.006 + t * 0.011 + i * 1.9) * 26
          + Math.sin(x * 0.013 + t * 0.017 + i) * 11;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color; ctx.globalAlpha = 0.5 - i * 0.1; ctx.lineWidth = 2;
      ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.stroke();
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    t++;
    if (!reduced) raf = requestAnimationFrame(draw);
  }
  size(); draw();
  addEventListener("resize", () => { size(); if (reduced) draw(); });
  document.addEventListener("visibilitychange", () => {
    if (reduced) return;
    document.hidden ? cancelAnimationFrame(raf) : (cancelAnimationFrame(raf), draw());
  });
})();

/* ---------- tabs ---------- */
$$(".tab").forEach(tab => tab.addEventListener("click", () => {
  $$(".tab").forEach(x => { x.classList.toggle("is-on", x === tab);
    x.setAttribute("aria-selected", String(x === tab)); });
  $$(".panel").forEach(p => p.classList.toggle("is-on", p.dataset.panel === tab.dataset.tab));
}));

/* ---------- accordion ---------- */
$$(".acc__btn").forEach(btn => btn.addEventListener("click", () => {
  const panel = btn.nextElementSibling, open = btn.getAttribute("aria-expanded") === "true";
  $$(".acc__btn").forEach(b => { b.setAttribute("aria-expanded", "false");
    b.nextElementSibling.style.maxHeight = null; });
  if (!open) { btn.setAttribute("aria-expanded", "true");
    panel.style.maxHeight = panel.scrollHeight + "px"; }
}));

/* ---------- modals (native <dialog>) ---------- */
$$("[data-modal]").forEach(btn => btn.addEventListener("click", () => {
  const d = document.getElementById(btn.dataset.modal);
  if (d && d.showModal) d.showModal();
}));
$$(".modal").forEach(d => {
  $(".modal-close", d).addEventListener("click", () => d.close());
  d.addEventListener("click", e => { if (e.target === d) d.close(); });
});

/* ---------- candle lab ---------- */
(function candleLab() {
  const cv = $("#candleCanvas"); if (!cv) return;
  const ctx = cv.getContext("2d");
  let candles = [], playing = true, frame = 0;
  function gen() {
    candles = []; let price = 100;
    for (let i = 0; i < 28; i++) {
      const open = price;
      const close = open + (Math.random() - 0.46) * 7;
      candles.push({ open, close,
        high: Math.max(open, close) + Math.random() * 3.2,
        low:  Math.min(open, close) - Math.random() * 3.2 });
      price = close;
    }
  }
  function stats() {
    const first = candles[0].open, last = candles[candles.length - 1].close;
    const change = ((last / first) - 1) * 100;
    const avgRange = candles.reduce((s, c) => s + (c.high - c.low), 0) / candles.length;
    let streak = 0, best = 0;
    candles.forEach(c => { streak = c.close >= c.open ? streak + 1 : 0; best = Math.max(best, streak); });
    $("#candleStats").innerHTML =
      `<span>net <b>${change >= 0 ? "+" : ""}${change.toFixed(1)}%</b></span>` +
      `<span>avg range <b>${avgRange.toFixed(1)}</b></span>` +
      `<span>best green streak <b>${best}</b></span>`;
  }
  function draw() {
    const W = cv.width, H = cv.height, pad = 14;
    const all = candles.flatMap(c => [c.high, c.low]);
    const min = Math.min(...all) - 2, max = Math.max(...all) + 2;
    const y = v => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(167,174,214,.14)";
    for (let i = 1; i < 5; i++) { ctx.beginPath();
      ctx.moveTo(0, (H / 5) * i); ctx.lineTo(W, (H / 5) * i); ctx.stroke(); }
    const step = (W - pad * 2) / candles.length, bw = step * 0.55;
    candles.forEach((c, i) => {
      const x = pad + i * step + step / 2, up = c.close >= c.open;
      const col = up ? "#00C2A8" : "#FF7A59";
      const shown = Math.min(1, Math.max(0, (frame - i * 2) / 14));
      const cc = c.open + (c.close - c.open) * shown;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x, y(c.high)); ctx.lineTo(x, y(c.low)); ctx.stroke();
      const top = y(Math.max(c.open, cc)), hgt = Math.max(2, Math.abs(y(c.open) - y(cc)));
      ctx.fillRect(x - bw / 2, top, bw, hgt);
    });
    frame++;
    if (playing) requestAnimationFrame(draw);
  }
  gen(); stats(); draw();
  $("#candlePlay").addEventListener("click", e => {
    playing = !playing; e.target.textContent = playing ? "Pause" : "Play";
    if (playing) draw();
  });
  $("#candleNew").addEventListener("click", () => { gen(); stats(); frame = 0; if (!playing) draw(); });
})();

/* ---------- data lab (bookstore sample catalog) ---------- */
const BOOKS = [
  { title: "Crack the Coding Interview", price: 49.95, rating: 4.8 },
  { title: "Atomic Habits",              price: 27.95, rating: 4.9 },
  { title: "Can't Hurt Me",              price: 29.95, rating: 4.8 },
  { title: "Deep Work",                  price: 28.95, rating: 4.7 },
  { title: "The 10X Rule",               price: 26.95, rating: 4.4 },
  { title: "Be Obsessed Or Be Average",  price: 25.95, rating: 4.3 },
  { title: "Rich Dad Poor Dad",          price: 19.95, rating: 4.6 },
  { title: "Cashflow Quadrant",          price: 21.95, rating: 4.5 },
  { title: "The 48 Laws of Power",       price: 24.95, rating: 4.7 },
  { title: "The 5 Second Rule",          price: 23.95, rating: 4.4 },
  { title: "Your Next Five Moves",       price: 27.95, rating: 4.6 },
  { title: "Mastery",                    price: 22.95, rating: 4.7 },
];
(function dataLab() {
  const list = $("#bookList"); if (!list) return;
  const search = $("#bookSearch"), sort = $("#bookSort"),
        max = $("#bookMax"), maxOut = $("#bookMaxOut");
  function render() {
    const q = search.value.trim().toLowerCase(), cap = Number(max.value);
    maxOut.textContent = "$" + cap;
    let rows = BOOKS.filter(b => b.price <= cap && b.title.toLowerCase().includes(q));
    const by = { title:    (a, b) => a.title.localeCompare(b.title),
                 priceAsc: (a, b) => a.price - b.price,
                 priceDesc:(a, b) => b.price - a.price,
                 rating:   (a, b) => b.rating - a.rating }[sort.value];
    rows = [...rows].sort(by);
    list.innerHTML = rows.length
      ? rows.map(b => `<li><span class="bt">${b.title}</span>
          <span class="bm">★ ${b.rating.toFixed(1)} · $${b.price.toFixed(2)}</span></li>`).join("")
      : `<li class="empty">No titles match — loosen the search or raise the cap.</li>`;
    $("#bookCount").textContent = `Showing ${rows.length} of ${BOOKS.length} titles.`;
  }
  [search, sort, max].forEach(el => el.addEventListener("input", render));
  render();
})();

/* ---------- accent lab (CSS variables + localStorage) ---------- */
(function accentLab() {
  const root = document.documentElement;
  const ACCENTS = { cyan: "#00C2A8", violet: "#8B5CF6", amber: "#FFB020" };
  function apply(name, glow) {
    if (ACCENTS[name]) root.style.setProperty("--accent", ACCENTS[name]);
    if (glow != null) root.style.setProperty("--glow", glow / 100);
    $$(".swatch").forEach(s => s.classList.toggle("is-on", s.dataset.accent === name));
    try { localStorage.setItem("vrwm-accent", JSON.stringify({ name, glow })); } catch (e) {}
  }
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("vrwm-accent")); } catch (e) {}
  if (saved && ACCENTS[saved.name]) {
    $("#glowRange").value = saved.glow ?? 55;
    $("#glowOut").textContent = (saved.glow ?? 55) + "%";
    apply(saved.name, saved.glow ?? 55);
  }
  $$(".swatch").forEach(s => s.addEventListener("click", () =>
    apply(s.dataset.accent, Number($("#glowRange").value))));
  $("#glowRange").addEventListener("input", e => {
    $("#glowOut").textContent = e.target.value + "%";
    const on = $(".swatch.is-on");
    apply(on ? on.dataset.accent : "cyan", Number(e.target.value));
  });
})();

/* ---------- clipboard for code exhibits ---------- */
$$(".copy-btn").forEach(btn => btn.addEventListener("click", async () => {
  const code = document.getElementById(btn.dataset.copy);
  try { await navigator.clipboard.writeText(code.innerText); toast("Code copied to clipboard"); }
  catch (e) { toast("Copy blocked by the browser — select the code manually"); }
}));

/* ---------- contact form (validate -> compose mailto) ---------- */
(function contactForm() {
  const form = $("#contactForm"); if (!form) return;
  const budget = $("#cfBudget"), bOut = $("#cfBudgetOut");
  budget.addEventListener("input", () => bOut.textContent = "≈ $" + Number(budget.value).toLocaleString());
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#cfName").value.trim(), email = $("#cfEmail").value.trim(),
          msg = $("#cfMsg").value.trim(), err = $("#cfErr");
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !msg) {
      err.textContent = "Please add your name, a valid email, and a few words about the project.";
      return;
    }
    err.textContent = "";
    const subject = encodeURIComponent("Project inquiry — " + $("#cfType").value);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nType: ${$("#cfType").value}\nBudget feel: $${Number(budget.value).toLocaleString()}\n\n${msg}`);
    location.href = `mailto:visionaryrealworld@gmail.com?subject=${subject}&body=${body}`;
    toast("Opening your mail app…");
  });
})();

/* ---------- python lab (Pyodide, lazy-loaded) ---------- */
(function pythonLab() {
  const btn = $("#pyRun"); if (!btn) return;
  let pyodide = null, loading = false;
  btn.addEventListener("click", async () => {
    const status = $("#pyStatus"), out = $("#pyOut");
    if (loading) return;
    try {
      if (!pyodide) {
        loading = true; btn.disabled = true;
        status.textContent = "Loading the Python interpreter (one-time)…";
        if (!window.loadPyodide) {
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
            s.onload = res; s.onerror = rej; document.head.appendChild(s);
          });
        }
        pyodide = await loadPyodide();
        status.textContent = "Interpreter ready — running your code locally, in this tab.";
      }
      let buf = "";
      pyodide.setStdout({ batched: s => { buf += s + "\n"; } });
      await pyodide.runPythonAsync($("#pyCode").value);
      out.textContent = buf || "(no output — add a print())";
    } catch (err) {
      out.textContent = "Python couldn't run here: " + String(err).split("\n")[0] +
        "\n(The exhibit code above is unaffected — and this failure is reported, not hidden.)";
      $("#pyStatus").textContent = "Load failed — check the connection and press Run again.";
    } finally { loading = false; btn.disabled = false; }
  });
})();
