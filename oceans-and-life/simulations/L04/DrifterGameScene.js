// DrifterGameScene - three trips for a floating buoy. The learner picks one of five named seas; the buoy
// follows the current that flows from that sea, on the corrected map. A wrong pick still shows the real
// journey and why it failed. Rounds are the scene's own; finishGame after the third.
// Controls: .dg-sea buttons (data-pick = sea id), Next trip (data-pick = next).
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';
import { sky, tween, loadSea, seaView, mapOpen, mapEnd, mapName, pathThrough, tx } from './SeaDraw.js';
import { CURRENTS, INDIA_ARROWS, WARM, currentById } from './CurrentsData.js';
import { SEA_MASCOT_CSS } from '../shared/SeaGame.js';

const SEAS = [
  { id: 'mex', label: 'Gulf of Mexico', route: ['gulf-stream', 'north-atlantic-drift'], end: 'off Norway', via: 'Gulf Stream' },
  { id: 'lab', label: 'Sea west of Greenland', route: ['labrador-current'], end: 'off the coast of Canada', via: 'Labrador Current' },
  { id: 'cal', label: 'Sea off California', route: ['california-current'], end: 'west of Mexico', via: 'California Current' },
  { id: 'jap', label: 'Sea south of Japan', route: ['kuroshio'], end: 'off Japan, where warm meets cold', via: 'Kuroshio' },
  { id: 'per', label: 'Sea off Chile', route: ['peru-current'], end: 'off Peru', via: 'Humboldt (Peru) Current' },
];
const TRIPS = [
  { goal: 'Norway', key: 'mex', say: 'Which sea should the buoy start in to reach Norway?' },
  { goal: 'Canada', key: 'lab', say: 'Which sea should it start in to travel down the coast of Canada?' },
  { goal: 'Japan', key: 'jap', say: 'Which sea should it start in to reach the fishing ground off Japan?' },
];
const GOAL_AT = { Norway: [13, 69.5], Canada: [-51, 46.5], Japan: [146, 37] };

const CSS = SEA_MASCOT_CSS + `
.gm.dg { background: var(--sim-bg-deep); border-radius: 14px; }
.dg .board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 14px; align-items: start; }
.dg .mapw svg { display: block; width: 100%; height: auto; }
.dg .q { font-size: 16px; font-weight: 800; margin: 0 0 6px; line-height: 1.25; }
.dg .rows { display: flex; flex-direction: column; gap: 6px; }
.dg .dg-sea { text-align: left; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); min-height: 46px; padding: 4px 12px; font-size: 16px; font-weight: 800; width: 100%; color: var(--sim-label); }
.dg .dg-sea[data-state="good"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 22%, var(--sim-bg-surface)); }
.dg .dg-sea[data-state="bad"] { border-color: var(--sim-bad); }
.dg .next { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; width: 100%; min-height: 48px; font-size: 16px; font-weight: 800; border-radius: var(--look-pill); margin-top: 6px; }
.dg .why { margin: 6px 0 0; font-size: 15px; line-height: 1.3; min-height: 38px; color: var(--sim-label); }
.dg .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.sim-dom-root:not(.sim-dom-root--portrait) .dg .dg-sea { min-height: 40px; }
.sim-dom-root:not(.sim-dom-root--portrait) .dg .rows { gap: 4px; }
.sim-dom-root:not(.sim-dom-root--portrait) .dg .q { font-size: 15px; }
.sim-dom-root--portrait .dg .board { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .dg .side { width: 100%; }
`;

export class DrifterGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Choose the right sea to drop the buoy, so that the currents carry it on all three trips.' } };
  static ARIA_LABEL = 'Drifting buoy: choose a sea to drop a buoy in, and the current there carries it. Reach Norway, the coast of Canada and the fishing ground off Japan.';

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, {
      css: CSS, check: false,
      html: '<div class="gm dg"><div class="gm-head"><p class="kicker">Three trips</p><h2>Where should the buoy start?</h2></div><div class="board"><div class="mapw" id="dg-map"></div><div class="side" id="dg-side"></div></div></div>',
    });
    this.root.querySelector('#dg-side')?.addEventListener('click', (e) => this._onClick(e));
    this._draw();
    this._g = await loadSea();
    this._draw();
  }
  destroy() { this._halt?.(); super.destroy(); }
  _reset() { this._i = 0; this._phase = 'pick'; this._msg = ''; this._bad = false; this._picked = null; this._p = 0; this._won = 0; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._halt?.(); this._reset(); this._draw?.(); }

  _onClick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b || this._phase === 'run') return;
    const v = b.dataset.pick;
    if (v === 'next') {
      this._i += 1; this._phase = 'pick'; this._msg = ''; this._bad = false; this._picked = null; this._p = 0;
      if (this._i >= TRIPS.length) { this._i = TRIPS.length - 1; this._done = true; this._draw(); finishGame(this); return; }
      this._draw(); return;
    }
    const sea = SEAS.find((x) => x.id === v), trip = TRIPS[this._i];
    this._picked = sea; this._phase = 'run'; this._msg = ''; this._p = 0;
    this._halt = tween(2200, (p) => { this._p = p; this._drawMap(); }, () => {
      const ok = sea.id === trip.key;
      this._bad = !ok;
      this._msg = ok ? `The ${sea.via} carried it ${sea.end}.` : `The ${sea.via} carried it ${sea.end}. Try another sea.`;
      this._phase = ok ? 'next' : 'pick';
      if (ok) { this._won += 1; this.quill?.setExpression?.('happy'); }
      this._draw();
    });
    this._draw();
  }

  _route(sea) { return sea.route.flatMap((id, k) => { const pts = currentById(id).paths[0].pts; return k ? pts.slice(1) : pts; }); }
  _drawMap() {
    const host = this.root.querySelector('#dg-map');
    if (!host) return;
    const port = this.root.classList?.contains('sim-dom-root--portrait');
    const W = port ? 320 : 760, H = port ? 200 : 268;
    if (!this._g) { host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map"><rect width="${W}" height="${H}" rx="14" style="fill:${sky('sea')}"/></svg>`; return; }
    const v = seaView(this._g, { x: 1, y: 1, w: W - 2, h: H - 2 }, [[-178, -50], [178, 72]]);
    let s = mapOpen(v, { r: 12 });
    for (const c of [...CURRENTS, ...INDIA_ARROWS]) for (const p of c.paths) {
      const d = pathThrough(p.pts.map((q) => v.at(q)), true);
      const col = c.kind === WARM ? sky('red') : sky('hullDark'), q = p.pts.map((u) => v.at(u)), a = q[q.length - 2], b = q[q.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), h = port ? 7 : 9;
      s += `<path d="${d}" style="fill:none;stroke:${col};stroke-width:${port ? 1.8 : 2.4};stroke-linecap:round;opacity:0.75"/><path d="M${b[0].toFixed(1)} ${b[1].toFixed(1)}l${(-Math.cos(ang - 0.5) * h).toFixed(1)} ${(-Math.sin(ang - 0.5) * h).toFixed(1)}l${(Math.cos(ang - 0.5) * h - Math.cos(ang + 0.5) * h).toFixed(1)} ${(Math.sin(ang - 0.5) * h - Math.sin(ang + 0.5) * h).toFixed(1)}Z" style="fill:${col}"/>`;
    }
    const trip = TRIPS[this._i], g = v.at(GOAL_AT[trip.goal]);
    s += `<circle cx="${g[0]}" cy="${g[1]}" r="${port ? 9 : 13}" style="fill:none;stroke:${sky('sun')};stroke-width:4"/><circle cx="${g[0]}" cy="${g[1]}" r="3" style="fill:${sky('sun')}"/>`;
    if (this._picked) {
      const pts = this._route(this._picked).map((q) => v.at(q));
      // walk the polyline by length
      const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), total = seg.reduce((a, b) => a + b, 0);
      let left = total * this._p, i = 0;
      const out = [pts[0]];
      while (i < seg.length && left > seg[i]) { left -= seg[i]; out.push(pts[i + 1]); i += 1; }
      if (i < seg.length) { const f = left / seg[i]; out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]); }
      s += `<path d="${pathThrough(out, false)}" style="fill:none;stroke:${sky('white')};stroke-width:${port ? 3 : 4.5};stroke-linecap:round"/>`;
      const e = out[out.length - 1];
      s += `<circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="${port ? 7 : 10}" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2.5"/>`;
    }
    s += mapEnd(v, { r: 12 });
    s += mapName(Math.min(g[0], W - 40), Math.max(g[1] - (port ? 12 : 18), 16), trip.goal, { size: port ? 15 : 18, display: true, weight: 700 });
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="World map of currents with a goal marked at ${trip.goal}">${s}</svg>`;
  }
  _draw() {
    const side = this.root?.querySelector?.('#dg-side');
    if (!side) return;
    this._drawMap();
    const t = TRIPS[this._i], running = this._phase === 'run';
    if (this._done) { side.innerHTML = '<p class="q">All three trips are done.</p>'; return; }
    let h = `<p class="q">Trip ${this._i + 1} of ${TRIPS.length}. ${esc(t.say)}</p>`;
    if (this._phase === 'next') {
      h += `<p class="why" aria-live="polite">${esc(this._msg)}</p><button type="button" class="next" data-pick="next">${this._i + 1 === TRIPS.length ? 'Finish' : 'Next trip'}</button>`;
    } else {
      h += `<div class="rows">${SEAS.map((x) => `<button type="button" class="tap dg-sea" data-pick="${x.id}"${running ? ' disabled' : ''} data-state="${this._bad && this._picked?.id === x.id ? 'bad' : ''}">${esc(x.label)}</button>`).join('')}</div>`
        + `<p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
    }
    side.innerHTML = h;
  }
  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: this._won === TRIPS.length };
  }
}
