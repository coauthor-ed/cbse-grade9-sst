// LabelRounds - a tap-to-label game on a drawn figure: tap a label, then tap the numbered spot it belongs to. A wrong
// spot gets a true line and the label stays. Works at 320 wide. Helper, not a scene: a GameBoard scene calls mountLabels.
// rounds: [{ title, pic (svg markup in a 320 by 200 viewBox), spots: [{ id, label, x, y (per cent), no (line for a wrong tap) }] }]
import { mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const CSS = `
.gm.lb { background: var(--sim-bg-deep); border-radius: 14px; padding: 6px 12px; gap: 6px; }
.lb .play { display: grid; grid-template-columns: 400px minmax(0, 1fr); gap: 14px; align-items: start; }
.lb .fig { position: relative; border: var(--sim-border); border-radius: var(--sim-radius-lg); overflow: hidden; box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); background: var(--sim-bg-surface); line-height: 0; }
.lb .fig svg { display: block; width: 100%; height: auto; }
.lb .spot { position: absolute; width: 46px; height: 46px; margin: -23px 0 0 -23px; padding: 0; border-radius: 50%; border: 3px solid var(--sim-stroke); background: var(--sim-bg-surface); color: var(--sim-label); font: 800 17px/1 var(--sim-font-display, var(--sim-font)); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lb .spot[data-done="1"] { width: auto; min-width: 46px; height: 34px; margin: -17px 0 0 -40px; padding: 0 8px; border-radius: 10px; font-size: 14px; background: var(--sim-good); color: var(--sim-ink-on-good, var(--sim-bg-deep)); border-color: var(--sim-bg-surface); white-space: nowrap; }
.lb .labels { display: flex; flex-wrap: wrap; gap: 8px; }
.lb .lab { display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 6px 14px; font-weight: 800; font-size: 16px; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.lb .lab[aria-pressed="true"] { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 24%, var(--sim-bg-surface)); }
.lb .lab[data-done="1"] { display: none; }
.lb .why { min-height: 40px; margin: 8px 2px 0; font-size: 15px; line-height: 1.3; font-weight: 700; }
.lb .next { display: none; min-height: 50px; width: 100%; margin-top: 4px; }
.lb[data-clear="1"] .next { display: block; }
.sim-dom-root--portrait .lb .play { grid-template-columns: minmax(0, 1fr); }
`;

export function mountLabels(scene, title, rounds) {
  scene._lr = { i: 0, pick: null, left: 0, won: false };
  mountGame(scene, { check: false, css: CSS, html: `<div class="gm lb"><div class="gm-head"><h2>${esc(title)}</h2></div><div class="play"><div class="fig" data-fig></div><div><p class="sub" data-t></p><div class="labels" data-labs></div><p class="why" data-why aria-live="polite"></p><button type="button" class="btn next tap">Next picture</button></div></div></div>` });
  const q = (s) => scene.root.querySelector(s);
  const show = () => {
    const R = rounds[scene._lr.i], fig = q('[data-fig]'), labs = q('[data-labs]');
    if (!fig) return;
    scene._lr.pick = null; scene._lr.left = R.spots.length;
    q('.lb').dataset.clear = '0';
    q('[data-t]').textContent = `Picture ${scene._lr.i + 1} of ${rounds.length}: ${R.title}`;
    q('[data-why]').textContent = 'Tap a label, then tap its number.';
    fig.innerHTML = R.pic + R.spots.map((s, n) => `<button type="button" class="spot" data-s="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="Spot ${n + 1}">${n + 1}</button>`).join('');
    const order = [...R.spots].sort((a, b) => a.label.localeCompare(b.label));
    labs.innerHTML = order.map((s) => `<div class="lab tap" role="button" tabindex="0" aria-pressed="false" data-l="${s.id}">${esc(s.label)}</div>`).join('');
    labs.querySelectorAll('.lab').forEach((e) => onTap(e, () => {
      scene._lr.pick = e.dataset.l;
      labs.querySelectorAll('.lab').forEach((x) => x.setAttribute('aria-pressed', x === e ? 'true' : 'false'));
    }));
    fig.querySelectorAll('.spot').forEach((e) => onTap(e, () => tapSpot(e)));
  };
  const tapSpot = (e) => {
    const R = rounds[scene._lr.i], pick = scene._lr.pick, why = q('[data-why]');
    if (e.dataset.done === '1') return;
    if (!pick) { why.textContent = 'Tap a label first.'; return; }
    const lab = R.spots.find((s) => s.id === pick);
    if (e.dataset.s !== pick) { why.textContent = `${R.spots.find((s) => s.id === e.dataset.s).no ?? 'Not that spot.'} Try another.`; return; }
    e.dataset.done = '1'; e.textContent = lab.label;
    scene.root.querySelector(`[data-l="${pick}"]`).dataset.done = '1';
    scene._lr.pick = null; scene._lr.left -= 1; why.textContent = lab.yes ?? 'Right.';
    if (scene._lr.left === 0) {
      if (scene._lr.i === rounds.length - 1) { why.textContent = 'All pictures labelled.'; scene._lr.won = true; finishGame(scene); }
      else q('.lb').dataset.clear = '1';
    }
  };
  const nx = q('.next');
  if (nx) onTap(nx, () => { scene._lr.i += 1; show(); });
  show();
  scene._lrShow = () => { scene._lr.i = 0; scene._lr.won = false; show(); };
}
