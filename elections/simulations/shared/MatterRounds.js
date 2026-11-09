// MatterRounds.js - one phone-ready board for the module's "this matter, which place?" games.
// One card at a time. Tap a bin. A wrong bin says why in one line and the card stays. A right
// bin says why, then Next. An optional second step (item.then) asks for the fair response.
//
//   mountRounds(scene, { key, kicker, title, sub, bins: [{ id, label, note, tone, art }], items })
//   item: { text, is, why, miss: { binId: 'line' }, then: { ask, options: [{ id, text, ok, why }] } }
//   checkObjective() { return roundsResult(this); }
// Control names for drive recipes: [data-bin=<id>], [data-opt=<id>], [data-next].
import { mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { burst } from 'simulations/base/kit/SimLookDom.js';
import { esc } from 'simulations/base/SimUi.js';

const CSS = `
.mr .kicker { display: none; }
.mr { background: color-mix(in oklab, var(--sim-bg-surface) 88%, var(--sim-gold)); border-radius: var(--sim-radius-lg); }
.mr .mr-board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: 16px; align-items: stretch; }
.mr .mr-left { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.mr .mr-card { flex: 0 0 auto; padding: 12px 14px 14px; min-height: 96px; display: flex; align-items: center; background: var(--sim-bg-surface);
  border: calc(3px * var(--look-rim)) solid var(--sim-gold); border-radius: var(--sim-radius-lg);
  box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-gold) 60%, var(--sim-label)); font: 700 19px/1.25 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.mr .mr-why { margin: 0; min-height: 44px; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label); }
.mr .mr-why[data-ok="0"] { color: var(--sim-bad); }
.mr .mr-dots { display: flex; gap: 6px; flex-wrap: wrap; }
.mr .mr-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--sim-track); }
.mr .mr-dot[data-done="1"] { background: var(--sim-good); }
.mr .mr-dot[data-now="1"] { box-shadow: 0 0 0 3px var(--sim-accent); }
.mr .mr-next { min-height: 48px; font-size: 16px; font-weight: 800; }
.mr .mr-bins { display: grid; grid-template-columns: repeat(var(--mr-cols, 3), minmax(0, 1fr)); gap: 10px; align-content: start; min-width: 0; }
.mr .mr-bin { --c: var(--sim-accent); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 56px; padding: 8px 8px 10px;
  background: color-mix(in oklab, var(--c) 14%, var(--sim-bg-surface)); border: calc(3px * var(--look-rim)) solid var(--c); border-radius: var(--sim-radius-lg);
  box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--c) 60%, var(--sim-label)); text-align: center; color: var(--sim-label); font-family: var(--sim-font); }
.mr .mr-bin[data-off="1"] { opacity: 0.5; }
.mr .mr-bin[data-good="1"] { background: color-mix(in oklab, var(--sim-good) 30%, var(--sim-bg-surface)); border-color: var(--sim-good); }
.mr .mr-bin[data-bad="1"] { border-color: var(--sim-bad); animation: mr-no 0.28s; }
.mr .mr-bin svg { width: 100%; max-width: 110px; height: 50px; display: block; }
.mr .mr-name { font: 700 19px/1.1 var(--sim-font-display, var(--sim-font)); }
.mr .mr-note { font: 700 14px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.mr .mr-opts { display: grid; gap: 8px; }
.mr .mr-opts[hidden] { display: none; }
.mr .mr-opt { min-height: 52px; padding: 6px 12px; text-align: left; font: 700 15px/1.25 var(--sim-font); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); color: var(--sim-label); }
.mr .mr-opt[data-bad="1"] { border-color: var(--sim-bad); }
.mr .mr-opt[data-good="1"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 24%, var(--sim-bg-surface)); }
@keyframes mr-no { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.sim-dom-root--portrait .mr .sub { padding-right: 56px; }
.sim-dom-root--portrait .mr .mr-board { display: flex; flex-direction: column; gap: 10px; }
.sim-dom-root--portrait .mr .mr-card { font-size: 18px; min-height: 84px; }
.sim-dom-root--portrait .mr .mr-bins { grid-template-columns: repeat(var(--mr-cols-p, 3), minmax(0, 1fr)); gap: 8px; }
.sim-dom-root--portrait .mr .mr-name { font-size: 17px; }
@media (prefers-reduced-motion: reduce) { .mr .mr-bin { animation: none !important; } }
`;

/** Pass as cfg.css on a wide game with few bins: card and bins fill the frame in landscape. Portrait is untouched. */
export const ROOMY_CSS = `
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-board { gap: 20px; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-left { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto minmax(0, 1fr) auto; column-gap: 12px; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-dots, .sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-card { grid-column: 1 / -1; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-next { min-width: 110px; align-self: center; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr [data-right] { margin-top: 6px; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-card { flex: 1 1 auto; font-size: 24px; line-height: 1.3; padding: 18px 20px; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-why { font-size: 17px; min-height: 66px; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr [data-right] { display: flex; flex-direction: column; min-height: 0; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-bins { flex: 1 1 auto; grid-auto-rows: 1fr; align-content: stretch; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-name { font-size: 22px; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-opts { flex: 1 1 auto; grid-auto-rows: 1fr; }
.sim-dom-root:not(.sim-dom-root--portrait) .mr .mr-opt { font-size: 19px; padding: 8px 16px; }
`;

export function mountRounds(scene, cfg) {
  const r = { i: 0, step: 'bin', done: cfg.items.map(() => false), why: '', ok: null, bad: null, good: null };
  scene._mr = { cfg, r };
  mountGame(scene, {
    css: CSS + (cfg.css ?? ''), check: false,
    html: `<div class="gm mr ${esc(cfg.key ?? '')}" style="--mr-cols:${cfg.cols ?? 3};--mr-cols-p:${cfg.colsP ?? cfg.cols ?? 3}"><div class="gm-head"><p class="kicker">${esc(cfg.kicker ?? 'Your turn')}</p><h2>${esc(cfg.title)}</h2>${cfg.sub ? `<p class="sub">${esc(cfg.sub)}</p>` : ''}</div>
<div class="mr-board"><div class="mr-left"><div class="mr-dots">${cfg.items.map((_, i) => `<i class="mr-dot" data-d="${i}"></i>`).join('')}</div><div class="mr-card" data-card aria-live="polite"></div><p class="mr-why" data-why aria-live="polite"></p><button type="button" class="tap btn mr-next" data-next hidden>Next</button></div>
<div data-right><div class="mr-bins" data-bins>${cfg.bins.map((b) => `<button type="button" class="tap mr-bin" data-bin="${esc(b.id)}" style="--c:var(--sim-series-${b.tone ?? 1})">${b.art ?? ''}<span class="mr-name">${esc(b.label)}</span>${b.note ? `<span class="mr-note">${esc(b.note)}</span>` : ''}</button>`).join('')}</div><div class="mr-opts" data-opts hidden></div></div></div></div>`,
  });
  scene.root.querySelectorAll('[data-bin]').forEach((b) => onTap(b, () => pick(scene, b.dataset.bin)));
  const nx = scene.root.querySelector('[data-next]');
  if (nx) onTap(nx, () => next(scene));
  paint(scene);
}

function pick(scene, id) {
  const { cfg, r } = scene._mr, it = cfg.items[r.i];
  if (r.step !== 'bin') return;
  if (id !== it.is) {
    r.bad = id; r.ok = false;
    r.why = it.miss?.[id] ?? 'Not this one. Read the matter again.';
    paint(scene);
    return;
  }
  r.bad = null; r.good = id; r.ok = true; r.why = it.why;
  if (it.then) { r.step = 'then'; r.why = it.then.ask; r.ok = null; } else complete(scene);
  paint(scene);
}

function complete(scene) {
  const { r } = scene._mr;
  r.done[r.i] = true; r.step = 'next';
  burst(scene.root.querySelector('[data-card]') ?? scene.root);
}

function choose(scene, opt) {
  const { cfg, r } = scene._mr, o = cfg.items[r.i].then.options.find((x) => x.id === opt);
  if (!o || r.step !== 'then') return;
  r.why = o.why; r.ok = !!o.ok; r.bad = o.ok ? null : opt; r.goodOpt = o.ok ? opt : null;
  if (o.ok) complete(scene);
  paint(scene);
}

function next(scene) {
  const { cfg, r } = scene._mr;
  if (r.step !== 'next') return;
  if (r.i >= cfg.items.length - 1) { finishGame(scene); paint(scene); return; }
  r.i += 1; r.step = 'bin'; r.why = ''; r.ok = null; r.bad = null; r.good = null; r.goodOpt = null;
  paint(scene);
}

// Phone: the board can run past the action bar, so Next comes up when it appears. Refit first.
function showNext(e) {
  if (!e.closest('.sim-dom-root--portrait')) return;
  const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => e.scrollIntoView?.({ block: 'center', behavior: calm ? 'auto' : 'smooth' }), 80);
}

function paint(scene) {
  const { cfg, r } = scene._mr, it = cfg.items[r.i], root = scene.root;
  const set = (sel, fn) => { const e = root.querySelector(sel); if (e) fn(e); };
  set('[data-card]', (e) => { e.textContent = it.text; });
  set('[data-why]', (e) => { e.textContent = r.why; if (r.ok === null) e.removeAttribute('data-ok'); else e.setAttribute('data-ok', r.ok ? '1' : '0'); });
  set('[data-next]', (e) => {
    const was = e.hidden;
    e.hidden = r.step !== 'next'; e.textContent = r.i >= cfg.items.length - 1 ? 'Finish' : 'Next';
    if (was && !e.hidden) showNext(e);
  });
  root.querySelectorAll('[data-d]').forEach((d) => { const i = +d.dataset.d; d.dataset.done = r.done[i] ? '1' : '0'; d.dataset.now = i === r.i ? '1' : '0'; });
  const then = r.step === 'then' || (r.step === 'next' && it.then);
  set('[data-bins]', (e) => { e.hidden = !!then; e.style.display = then ? 'none' : ''; });
  set('[data-opts]', (e) => {
    e.hidden = !then;
    if (!then) { e.innerHTML = ''; return; }
    if (!e.dataset.for || e.dataset.for !== String(r.i)) {
      e.dataset.for = String(r.i);
      e.innerHTML = it.then.options.map((o) => `<button type="button" class="tap mr-opt" data-opt="${esc(o.id)}">${esc(o.text)}</button>`).join('');
      e.querySelectorAll('[data-opt]').forEach((b) => onTap(b, () => choose(scene, b.dataset.opt)));
    }
    e.querySelectorAll('[data-opt]').forEach((b) => { b.dataset.bad = r.bad === b.dataset.opt ? '1' : '0'; b.dataset.good = r.goodOpt === b.dataset.opt ? '1' : '0'; });
  });
  root.querySelectorAll('[data-bin]').forEach((b) => { b.dataset.bad = r.bad === b.dataset.bin ? '1' : '0'; b.dataset.good = r.good === b.dataset.bin ? '1' : '0'; });
  scene.relayout?.();
}

/** For checkObjective(): null until every card is done. */
export function roundsResult(scene) {
  const m = scene._mr;
  if (!m || !m.r.done.every(Boolean)) return null;
  return { ok: true };
}

/** A small bin picture of n drawn people. */
export function peopleArt(n, tone = 1) {
  const col = `var(--sim-series-${tone})`, cols = Math.min(n, 6), rows = Math.ceil(n / cols), g = 110 / cols;
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = (i % cols + 0.5) * g, y = 12 + Math.floor(i / cols) * (34 / rows);
    s += `<circle cx="${x}" cy="${y}" r="5.5" style="fill:${col}"/><rect x="${x - 7}" y="${y + 6}" width="14" height="13" rx="6" style="fill:${col}"/>`;
  }
  return `<svg viewBox="0 0 110 50" aria-hidden="true">${s}</svg>`;
}
