# Repository Overview & AI Guidance

This is a single-page static portfolio (HTML/CSS/JS) built without a bundler. Key files:
- `index.html` — page structure and content (sections, cards, modals).
- `script.js` — all interactive behavior (navigation, modals, i18n, theme, role rotator).
- `style.css` — visual system, layout patterns, and many small "PATCH" style overrides.
- `assets/` — fonts, images, icons used by components.

**Big picture**
- Single-page layout composed of anchor-linked sections (e.g. `#home`, `#Projects`, `#Academics`, `#Experience`).
- Navigation/dock uses anchor links and a transition overlay (`.page-transition`) for smooth jumps.
- Content is organized as horizontal scroll carousels (`.proj-scroll`, `.edu-scroll`, `.exp-scroll`, `.list-scroll`) and a small set of "top row" grids for signature items (`.proj-row-top`, `.exp-row-top`).

**Important runtime patterns (script.js)**
- Active dock on scroll: `setActiveOnScroll()` watches `section[id]` and toggles `.dock a.active`.
- Smooth transitions: links inside `.dock a` add `.page-transition.active` then `scrollIntoView`.
- Home animations use an `IntersectionObserver` (threshold 0.6) to re-trigger CSS animations on `.hero-name`, `.role-box`, `.text-single`.
- Theme toggle: click `#modeToggle` toggles `body.dark` and persists choice to `localStorage` key `pref-theme`.
- i18n: `fetchLang()` loads `lang.json` (root) and `applyLanguage()` maps `[data-i18n]` attributes. `window.__i18n__` and `window.__ROLES__` are set by this code.
- Role rotator: element `#roleText` cycles strings from `window.__ROLES__` or fallback array.
- Modals: project/experience/list/education cards use data-attributes and open modals with IDs like `#itemModal` and `#eduModal` — the code expects `data-title`, `data-subtitle`, `data-body`, and `data-img1`/`data-img2`/`data-img3` (or `data-img` for education).
- Card click helpers: many listeners attach on `DOMContentLoaded` and `click` events; prefer editing HTML card markup rather than changing listeners in JS.

**Conventions & how to add content**
- Projects: add a `.proj-card` with data attributes: `data-title`, `data-subtitle`, `data-body`, `data-img1/2/3`. Optional: include a child `<span class="sig-bar">SIGNATURE PROJECT</span>` to render the signature band.
- Education: `.edu-card` uses `data-title`, `data-desc`, and `data-img` (single image fallback supported).
- Training / Certificates: add `.list-card` inside `#pelatihanList` or `#sertifikatList`. These lists are listened-to by delegated click handlers.
- Keep image paths relative under `assets/`; the slideshow preloads images defined in `script.js` (see `images` array in hero slideshow).
- Internationalization: add keys to `lang.json` at root. Use `data-i18n="key.path"` on any element. To add role strings, include `roles` array in the language object.

**Debugging and common fixes**
- If translations do not appear, check `lang.json` is present and served (open devtools network tab). `fetchLang()` logs errors on failure.
- If modals don't open, verify card elements have the expected `data-*` attributes and modals with IDs `itemModal` / `eduModal` exist in `index.html`.
- If theme label text doesn't change, the code falls back to literal text; ensure `modeToggle .toggle-label` is present.

**Build / run**
- No build step; serve the directory over HTTP to avoid fetch/file restrictions. Example (PowerShell):

```powershell
# from repository root
python -m http.server 8000
# then open http://localhost:8000/index.html
```

**Files to check when editing UI/behavior**
- `index.html` — add/remove cards, ensure correct `id` on sections and modals.
- `script.js` — interactive logic; prefer extending data-* driven patterns over altering listeners.
- `style.css` — visual system; many `PATCH` comments and size hard-codes (cards use 600px base). Look for `:has(.sig-bar)` rules when changing signature UI.

If anything here is unclear or you want me to include small examples/snippets for adding new project cards or a sample `lang.json` entry, tell me which part to expand. I can iterate.
