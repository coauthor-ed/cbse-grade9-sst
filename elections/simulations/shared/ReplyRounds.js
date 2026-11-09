// ReplyRounds.js - a phone-ready board for "one case, a few replies" games. One case on screen.
// Tap a reply: it says why. A right reply shows Next; a wrong one stays, so the learner can try again.
//
//   mountReplies(scene, { key, title, sub, items })
//   item: { tag, text, facts: ['A 38', ...], replies: [{ id, text, ok, why }] }
//   checkObjective() { return repliesResult(this); }
// Control names for drive recipes: [data-reply=<id>], [data-next].
import { mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { burst } from 'simulations/base/kit/SimLookDom.js';
import { esc } from 'simulations/base/SimUi.js';

const CSS = `
.rr .kicker { display: none; }
.rr { background: color-mix(in oklab, var(--sim-bg-surface) 88%, var(--sim-gold)); border-radius: var(--sim-radius-lg); }
.rr .rr-board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 16px; align-items: start; }
.rr .rr-left, .rr .rr-right { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.rr .rr-dots { display: flex; gap: 6px; flex-wrap: wrap; }
.rr .rr-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--sim-track); }
.rr .rr-dot[data-done="1"] { background: var(--sim-good); }
.rr .rr-dot[data-now="1"] { box-shadow: 0 0 0 3px var(--sim-accent); }
.rr .rr-card { padding: 12px 14px 14px; background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-gold); border-radius: var(--sim-radius-lg);
  box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-gold) 60%, var(--sim-label)); color: var(--sim-label); }
.rr .rr-tag { font: 800 14px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.rr .rr-text { margin: 2px 0 0; font: 700 19px/1.25 var(--sim-font-display, var(--sim-font)); }
.rr .rr-facts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.rr .rr-fact { padding: 3px 10px; border-radius: var(--look-pill); background: color-mix(in oklab, var(--sim-gold) 26%, var(--sim-bg-surface)); font: 700 18px/1.2 var(--sim-font-display, var(--sim-font)); }
.rr .rr-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label); }
.rr .rr-why[data-ok="0"] { color: var(--sim-bad); }
.rr .rr-reply { display: block; width: 100%; min-height: 52px; padding: 6px 12px; text-align: left; font: 700 16px/1.25 var(--sim-font); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke);
  border-radius: var(--sim-radius-md); color: var(--sim-label); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.rr .rr-reply[data-bad="1"] { border-color: var(--sim-bad); animation: rr-no 0.28s; }
.rr .rr-reply[data-good="1"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 24%, var(--sim-bg-surface)); }
.rr .rr-next { min-height: 48px; font-size: 16px; font-weight: 800; }
@keyframes rr-no { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.sim-dom-root--portrait .rr .sub { padding-right: 56px; }
.sim-dom-root--portrait .rr .rr-board { display: flex; flex-direction: column; gap: 8px; align-items: stretch; }
.sim-dom-root--portrait .rr .rr-text { font-size: 18px; }
/* Landscape: card and replies fill the board, so the frame can be just as tall as its content. */
.sim-dom-root:not(.sim-dom-root--portrait) .rr .rr-board { align-items: stretch; }
.sim-dom-root:not(.sim-dom-root--portrait) .rr .rr-card { flex: 1 1 auto; display: flex; flex-direction: column; justify-content: center; }
.sim-dom-root:not(.sim-dom-root--portrait) .rr .rr-text { font-size: 22px; }
.sim-dom-root:not(.sim-dom-root--portrait) .rr .rr-right { margin-top: 6px; }
.sim-dom-root:not(.sim-dom-root--portrait) .rr .rr-right .rr-right { margin-top: 0; }
.sim-dom-root:not(.sim-dom-root--portrait) .rr .rr-board > .rr-right { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: minmax(0, 1fr) auto; column-gap: 12px; }
.sim-dom-root:not(.sim-dom-root--portrait) .rr [data-replies] { grid-column: 1 / -1; }
.sim-dom-root:not(.sim-dom-root--portrait) .rr .rr-why { font-size: 17px; min-height: 66px; }
.sim-dom-root:not(.sim-dom-root--portrait) .rr .rr-next { min-width: 110px; align-self: center; }
@media (prefers-reduced-motion: reduce) { .rr .rr-reply { animation: none !important; } }
`;

export function mountReplies(scene, cfg) {
  const r = { i: 0, done: cfg.items.map(() => false), why: '', ok: null, bad: null, good: null };
  scene._rr = { cfg, r };
  mountGame(scene, {
    css: CSS, check: false,
    html: `<div class="gm rr ${esc(cfg.key ?? '')}"><div class="gm-head"><p class="kicker">Your turn</p><h2>${esc(cfg.title)}</h2>${cfg.sub ? `<p class="sub">${esc(cfg.sub)}</p>` : ''}</div>
<div class="rr-board"><div class="rr-left"><div class="rr-dots">${cfg.items.map((_, i) => `<i class="rr-dot" data-d="${i}"></i>`).join('')}</div><div class="rr-card" data-card aria-live="polite"></div></div>
<div class="rr-right"><div class="rr-right" data-replies></div><p class="rr-why" data-why aria-live="polite"></p><button type="button" class="tap btn rr-next" data-next hidden>Next</button></div></div></div>`,
  });
  const nx = scene.root.querySelector('[data-next]');
  if (nx) onTap(nx, () => next(scene));
  deal(scene);
}

function deal(scene) {
  const { cfg, r } = scene._rr, it = cfg.items[r.i], root = scene.root;
  const card = root.querySelector('[data-card]');
  if (card) card.innerHTML = `${it.tag ? `<div class="rr-tag">${esc(it.tag)}</div>` : ''}<p class="rr-text">${esc(it.text)}</p>${it.facts ? `<div class="rr-facts">${it.facts.map((f) => `<span class="rr-fact">${esc(f)}</span>`).join('')}</div>` : ''}`;
  const box = root.querySelector('[data-replies]');
  if (box) {
    box.innerHTML = it.replies.map((o) => `<button type="button" class="tap rr-reply" data-reply="${esc(o.id)}">${esc(o.text)}</button>`).join('');
    box.querySelectorAll('[data-reply]').forEach((b) => onTap(b, () => pick(scene, b.dataset.reply)));
  }
  paint(scene);
}

function pick(scene, id) {
  const { cfg, r } = scene._rr, o = cfg.items[r.i].replies.find((x) => x.id === id);
  if (!o || r.done[r.i]) return;
  r.why = o.why; r.ok = !!o.ok; r.bad = o.ok ? null : id; r.good = o.ok ? id : null;
  if (o.ok) { r.done[r.i] = true; burst(scene.root.querySelector('[data-card]') ?? scene.root); }
  paint(scene);
}

function next(scene) {
  const { cfg, r } = scene._rr;
  if (!r.done[r.i]) return;
  if (r.i >= cfg.items.length - 1) { finishGame(scene); paint(scene); return; }
  r.i += 1; r.why = ''; r.ok = null; r.bad = null; r.good = null;
  deal(scene);
}

// Phone: the board can run past the action bar, so Next comes up when it appears. Refit first.
function showNext(e) {
  if (!e.closest('.sim-dom-root--portrait')) return;
  const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => e.scrollIntoView?.({ block: 'center', behavior: calm ? 'auto' : 'smooth' }), 80);
}

function paint(scene) {
  const { cfg, r } = scene._rr, root = scene.root;
  const w = root.querySelector('[data-why]');
  if (w) { w.textContent = r.why; if (r.ok === null) w.removeAttribute('data-ok'); else w.setAttribute('data-ok', r.ok ? '1' : '0'); }
  const n = root.querySelector('[data-next]');
  if (n) {
    const was = n.hidden;
    n.hidden = !r.done[r.i]; n.textContent = r.i >= cfg.items.length - 1 ? 'Finish' : 'Next';
    if (was && !n.hidden) showNext(n);
  }
  root.querySelectorAll('[data-d]').forEach((d) => { const i = +d.dataset.d; d.dataset.done = r.done[i] ? '1' : '0'; d.dataset.now = i === r.i ? '1' : '0'; });
  root.querySelectorAll('[data-reply]').forEach((b) => { b.dataset.bad = r.bad === b.dataset.reply ? '1' : '0'; b.dataset.good = r.good === b.dataset.reply ? '1' : '0'; });
  scene.relayout?.();
}

/** For checkObjective(): null until every case is done. */
export function repliesResult(scene) {
  const m = scene._rr;
  if (!m || !m.r.done.every(Boolean)) return null;
  return { ok: true };
}
