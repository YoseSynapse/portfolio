# Jose Gomez — Flagship Portfolio & VRWM Template v1

Live: https://yosesynapse.github.io/portfolio/ · Repo: github.com/YoseSynapse/portfolio

Hand-written HTML5 / CSS / JavaScript + Python (Pyodide, in-browser). No frameworks,
no trackers, no cookies. Every module on the page runs: wave canvas, counters, tabs,
accordion, native dialogs, Candle Lab, Data Lab, Accent Lab, clipboard, validated
contact form (mailto compose), and a live CPython interpreter.

## The template system (for future VRWM sites)
- **Tokens** live in `styles.css` `:root` — Signal Wave palette (Deep Violet #6D28D9,
  Signal Cyan #00C2A8, Spark Amber #FFB020 on Dark Ink #0A0E27), radius, fonts.
  Re-skin a new brand by changing tokens + the mark image + copy; sections are modular.
- **Sections**: hero (canvas) → proof strip → project cards → Lab grid → code exhibits
  → live-runtime panel → skill tabs → process → contact → footer.
- **Rules inherited by every site built from this template**: functioning-pages standard
  (every asset resolves, every control works, verified at desktop + 390px), honest labels
  (demos say demo), compliance scan before ship, independent review before it counts.

## Files
- `index.html` — structure & content
- `styles.css` — design system
- `app.js` — all modules (vanilla)
- `assets/` — master mark + live-page screenshots (project cards)

Built 2026-10-29 by Nova (Render Desk, interim). Review lane: Vega → Amber QA → live.
