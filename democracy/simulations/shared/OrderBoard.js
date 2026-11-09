// OrderBoard.js - one phone-ready "put these in order" board for this module's games.
// A helper, not a scene. The cards are dealt shuffled, so nothing on screen shows the answer.
// Tap the card that comes next. A right card lands on the next rung and says why. A wrong card
// stays where it is and says why not. The last card ends the game.
//
//   mountOrder(scene, { key, kicker, title, sub, first, last, items, miss, tone, art })
//     items: [{ id, big, text, when, why }]  in the right order.
//            big: the reading on the card (a number); leave it out to make the learner recall the
//            date. text: what it is. when: the date shown only once the card has landed.
//            why: the line shown when the card lands, and the reason given when it is picked too early.
//     miss(item, next) -> line  optional: the line when item is tapped while next is due.
//     first, last: labels at the two ends of the rungs ('smallest', 'largest').
//   checkObjective() { return orderResult(this); }
// Control names for drive recipes: [data-ord=<id>] on each card still in the tray.
import { mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { shuffle } from 'simulations/base/kit/shuffle.js';
import { burst } from 'simulations/base/kit/SimLookDom.js';
import { esc } from 'simulations/base/SimUi.js';

const CSS = `
.ob .kicker { display: none; }
.ob { background: color-mix(in oklab, var(--sim-bg-surface) 88%, var(--sim-gold)); border-radius: var(--sim-radius-lg); }
.ob .ob-board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 16px; align-items: start; }
.ob .ob-rungs { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ob .ob-end { font: 800 14px/1.1 var(--sim-font); color: var(--sim-label-muted); }
.ob .ob-rung { --c: var(--sim-track); display: flex; align-items: center; gap: 8px; min-height: 31px; padding: 1px 10px 1px 4px; min-width: 0;
  border-radius: var(--sim-radius-md); border: calc(2px * var(--look-rim)) dashed color-mix(in oklab, var(--sim-stroke) 60%, transparent); }
.ob .ob-rung[data-now="1"] { border-color: var(--sim-accent); border-style: solid; }
.ob .ob-rung[data-on="1"] { background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-good);
  box-shadow: 0 calc(2px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-good) 60%, var(--sim-label)); animation: ob-in 0.32s var(--look-spring) both; }
.ob .ob-n { flex: 0 0 24px; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; background: var(--sim-track); color: var(--sim-label);
  font: 700 15px/1 var(--sim-font-display, var(--sim-font)); }
.ob .ob-rung[data-on="1"] .ob-n { background: var(--sim-good); color: var(--sim-ink-on-good, var(--sim-bg-deep)); }
.ob .ob-rt { min-width: 0; font: 700 15px/1.15 var(--sim-font); color: var(--sim-label); }
.ob .ob-rt b { font: 700 17px/1.1 var(--sim-font-display, var(--sim-font)); margin-right: 6px; }
.ob .ob-side { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.ob .ob-tray { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ob .ob-card { display: flex; flex-direction: column; justify-content: center; gap: 1px; min-height: 50px; padding: 3px 10px 5px; text-align: left; min-width: 0;
  background: var(--sim-bg-surface); border: calc(2.5px * var(--look-rim)) solid var(--sim-gold); border-radius: var(--sim-radius-md); }
.ob .ob-card[data-bad="1"] { border-color: var(--sim-bad); animation: ob-no 0.28s; }
.ob .ob-big { font: 700 19px/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.ob .ob-txt { font: 700 14px/1.15 var(--sim-font); color: var(--sim-label-muted); }
.ob .ob-txt[data-only] { font-size: 15px; color: var(--sim-label); }
.ob .ob-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label); }
.ob .ob-why[data-ok="0"] { color: var(--sim-bad); }
@keyframes ob-in { from { transform: scale(0.9); opacity: 0.2; } to { transform: none; opacity: 1; } }
@keyframes ob-no { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.ob .ob-end, .ob .sub { display: none; }
.ob .gm-head h2 { margin: 0; }
.sim-dom-root--portrait .ob .ob-rung[data-on="0"][data-now="0"] { display: none; }
.sim-dom-root--portrait .ob .ob-board { display: flex; flex-direction: column-reverse; gap: 10px; }
.sim-dom-root--portrait .ob .ob-rung { min-height: 30px; }
.sim-dom-root--portrait .ob .ob-card { min-height: 54px; padding: 4px 8px 6px; }
.sim-dom-root--portrait .ob .ob-big { font-size: 17px; }
@media (prefers-reduced-motion: reduce) { .ob .ob-rung, .ob .ob-card { animation: none !important; } }
`;

export function mountOrder(scene, cfg) {
  const s = { placed: 0, why: '', ok: null, bad: null, deal: dealOf(cfg.items) };
  scene._ob = { cfg, s };
  mountGame(scene, {
    css: CSS + (cfg.css ?? ''), check: false,
    html: `<div class="gm ob ${esc(cfg.key ?? '')}"><div class="gm-head"><p class="kicker">${esc(cfg.kicker ?? 'Your turn')}</p><h2>${esc(cfg.title)}</h2>${cfg.sub ? `<p class="sub">${esc(cfg.sub)}</p>` : ''}</div>
<div class="ob-board"><div class="ob-rungs" data-rungs></div><div class="ob-side"><div class="ob-tray" data-tray></div><p class="ob-why" data-why aria-live="polite"></p></div></div></div>`,
  });
  paint(scene);
}

// Shuffled, and never the right order or a run that starts with the right first card.
function dealOf(items) {
  const ids = items.map((x) => x.id);
  let d = shuffle(ids);
  for (let i = 0; i < 12 && (d[0] === ids[0] || d[1] === ids[1]); i++) d = shuffle(ids);
  return d;
}

function pick(scene, id) {
  const { cfg, s } = scene._ob, want = cfg.items[s.placed], it = cfg.items.find((x) => x.id === id);
  if (!it || !want) return;
  if (id !== want.id) {
    s.bad = id; s.ok = false; s.why = cfg.miss?.(it, want) ?? `Not yet. ${it.why}`;
    paint(scene);
    return;
  }
  s.placed += 1; s.bad = null; s.ok = true; s.why = it.why;
  s.deal = s.deal.filter((x) => x !== id);
  paint(scene);
  if (s.placed === cfg.items.length) {
    burst(scene.root.querySelector('[data-rungs]') ?? scene.root);
    finishGame(scene);
  }
}

function paint(scene) {
  const { cfg, s } = scene._ob, root = scene.root;
  const rungs = root.querySelector('[data-rungs]'), tray = root.querySelector('[data-tray]'), why = root.querySelector('[data-why]');
  if (rungs) {
    rungs.innerHTML = (cfg.first ? `<span class="ob-end">${esc(cfg.first)}</span>` : '')
      + cfg.items.map((it, i) => {
        const on = i < s.placed;
        return `<div class="ob-rung" data-on="${on ? 1 : 0}" data-now="${i === s.placed ? 1 : 0}"><span class="ob-n">${i + 1}</span>${on ? `<span class="ob-rt"><b>${esc(it.when ?? it.big ?? '')}</b>${esc(it.text)}</span>` : ''}</div>`;
      }).join('') + (cfg.last ? `<span class="ob-end">${esc(cfg.last)}</span>` : '');
  }
  if (tray) {
    tray.innerHTML = s.deal.map((id) => {
      const it = cfg.items.find((x) => x.id === id);
      return `<button type="button" class="tap ob-card" data-ord="${esc(id)}" data-bad="${s.bad === id ? 1 : 0}">${it.big ? `<span class="ob-big">${esc(it.big)}</span>` : ''}<span class="ob-txt"${it.big ? '' : ' data-only="1"'}>${esc(it.text)}</span></button>`;
    }).join('');
    tray.querySelectorAll('[data-ord]').forEach((b) => onTap(b, () => pick(scene, b.dataset.ord)));
  }
  if (why) { why.textContent = s.why; if (s.ok === null) why.removeAttribute('data-ok'); else why.setAttribute('data-ok', s.ok ? '1' : '0'); }
  scene.relayout?.();
}

/** For checkObjective(): null until every card is placed. */
export function orderResult(scene) {
  const m = scene._ob;
  if (!m || m.s.placed < m.cfg.items.length) return null;
  return { ok: true };
}
