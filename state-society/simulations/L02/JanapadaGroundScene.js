// JanapadaGroundScene - L02 s09 mini-game, phone layout. Tap settlements to put them inside the
// boundary, then Close the boundary. Each settlement shows its kin colour; the land decides. A
// wrong boundary says why and stays open. Controls: [data-s=<id>], [data-close], [data-next].
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { burst } from 'simulations/base/kit/SimLookDom.js';

const VW = 400, VH = 250;
const ROUNDS = [
  { ask: 'Ring every settlement on this side of the river. Their kin groups differ.', river: 'M250 0 C230 80 280 150 250 250', in: 'abcd',
    set: [['a', 70, 60, 1], ['b', 170, 70, 2], ['c', 90, 170, 3], ['d', 190, 180, 1], ['e', 320, 80, 2], ['f', 330, 190, 3]],
    add: 'This settlement stands on this ground, so it belongs, whatever its kin group.', out: 'This settlement is across the river. It shares a kin group, but not the ground.' },
  { ask: 'Ring every settlement on the plain between the two rivers.', river: 'M120 0 C100 80 150 170 120 250 M310 0 C330 80 280 170 310 250', in: 'bcd',
    set: [['a', 58, 120, 1], ['b', 190, 60, 1], ['c', 240, 130, 2], ['d', 190, 200, 3], ['e', 360, 70, 2], ['f', 360, 190, 3]],
    add: 'It stands on the plain, so it belongs, even if its kin live elsewhere.', out: 'Same kin, perhaps, but this ground lies outside the plain.' },
];
const CSS = `
.jg { background: color-mix(in oklab, var(--sim-bg-surface) 88%, var(--sim-gold)); border-radius: var(--sim-radius-lg); }
.jg .jg-board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; }
.gm.jg { padding: 8px 16px 10px; gap: 6px; }
.jg .kicker { display: none; }
.jg .jg-fig { margin-top: 16px; }
.jg .jg-left { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.jg .jg-ask { padding: 10px 12px 12px; background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-gold); border-radius: var(--sim-radius-lg); font: 700 18px/1.25 var(--sim-font-display, var(--sim-font)); }
.jg .jg-msg { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); }
.jg .jg-msg[data-ok="0"] { color: var(--sim-bad); }
.jg .jg-svg { display: block; width: 100%; height: auto; border-radius: var(--sim-radius-lg); border: calc(3px * var(--look-rim)) solid var(--sim-stroke); touch-action: manipulation; }
.jg .jg-fig { position: relative; min-width: 0; }
.jg .jg-s { position: absolute; width: 16%; aspect-ratio: 1; transform: translate(-50%, -50%); padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; touch-action: manipulation; }
.jg .jg-s:focus-visible { outline: 3px solid var(--sim-accent); }
.jg .jg-btn { min-height: 48px; font-size: 16px; font-weight: 800; }
.sim-dom-root--portrait .jg .jg-board { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .jg .jg-left { display: contents; }
.sim-dom-root--portrait .jg .jg-ask { order: 1; }
.sim-dom-root--portrait .jg .jg-fig { order: 2; margin-top: 0; }
.sim-dom-root--portrait .jg .jg-msg { order: 3; }
.sim-dom-root--portrait .jg .jg-btn { order: 4; }
`;
const hut = (x, y) => `<path d="M${x - 11} ${y + 2}L${x} ${y - 13}L${x + 11} ${y + 2}Z" style="fill:color-mix(in oklab, var(--sim-gold) 70%, var(--sim-series-8))"/><rect x="${x - 7}" y="${y + 2}" width="14" height="9" rx="2" style="fill:color-mix(in oklab, var(--sim-gold) 35%, var(--sim-bg-surface))"/>`;

export class JanapadaGroundScene extends GameBoard {
  static HEIGHT = 335;   // fits above the action bar at 1280x720
  static ARIA_LABEL = 'A game on a drawn ground with rivers. Tap settlements to put them inside a boundary, then close it. Settlements show different kin colours, but the ground decides which belong together. Two rounds.';
  static OBJECTIVE = { prompt: { en: 'Draw each boundary around the settlements on one ground.' } };
  _i = 0; _on = new Set(); _won = [false, false]; _msg = ''; _ok = null;

  async setup() {
    await super.setup();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm jg"><div class="gm-head"><p class="kicker">Your turn</p><h2>Draw the boundary</h2></div><div class="jg-board"><div class="jg-left"><div class="jg-ask" data-ask></div><p class="jg-msg" data-msg aria-live="polite"></p><button type="button" class="tap btn jg-btn" data-close>Close the boundary</button><button type="button" class="tap btn jg-btn" data-next hidden>Next ground</button></div><div class="jg-fig"><svg class="jg-svg" data-fig viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Ground with settlements"></svg><div data-hits></div></div></div></div>` });
    const a = this.root.querySelector('[data-close]'), b = this.root.querySelector('[data-next]');
    if (a) onTap(a, () => this.close());
    if (b) onTap(b, () => this.next());
    this.paint();
  }

  toggle(id) { if (this._won[this._i]) return; if (this._on.has(id)) this._on.delete(id); else this._on.add(id); this._msg = ''; this._ok = null; this.paint(); }

  close() {
    const R = ROUNDS[this._i], want = [...R.in];
    const miss = want.find((k) => !this._on.has(k)), extra = [...this._on].find((k) => !want.includes(k));
    if (extra) { this._msg = R.out; this._ok = false; } else if (miss) { this._msg = R.add; this._ok = false; } else {
      this._won[this._i] = true; this._ok = true; this._msg = 'Different kin groups, one ground: that is the new tie.';
      burst(this.root.querySelector('[data-fig]')?.parentNode ?? this.root);
    }
    this.paint();
  }

  next() {
    if (!this._won[this._i]) return;
    if (this._i >= ROUNDS.length - 1) { finishGame(this); return; }
    this._i += 1; this._on = new Set(); this._msg = ''; this._ok = null; this.paint();
  }

  paint() {
    const R = ROUNDS[this._i], fig = this.root.querySelector('[data-fig]');
    const q = (s) => this.root.querySelector(s);
    if (q('[data-ask]')) q('[data-ask]').textContent = R.ask;
    if (q('[data-msg]')) { q('[data-msg]').textContent = this._msg; q('[data-msg]').dataset.ok = this._ok === false ? '0' : '1'; }
    if (q('[data-close]')) q('[data-close]').hidden = this._won[this._i];
    if (q('[data-next]')) { q('[data-next]').hidden = !this._won[this._i]; q('[data-next]').textContent = this._i >= ROUNDS.length - 1 ? 'Finish' : 'Next ground'; }
    if (!fig) return;
    const pts = R.set.filter(([k]) => this._on.has(k));
    const hull = pts.length ? `<ellipse cx="${pts.reduce((a, p) => a + p[1], 0) / pts.length}" cy="${pts.reduce((a, p) => a + p[2], 0) / pts.length}" rx="${Math.max(42, (Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1]))) / 2 + 46)}" ry="${Math.max(42, (Math.max(...pts.map((p) => p[2])) - Math.min(...pts.map((p) => p[2]))) / 2 + 42)}" style="fill:color-mix(in oklab, var(--sim-gold) 22%, transparent);stroke:var(--sim-gold);stroke-width:5;stroke-dasharray:14 8"/>` : '';
    fig.innerHTML = `<rect width="${VW}" height="${VH}" style="fill:color-mix(in oklab, var(--sim-series-3) 28%, var(--sim-bg-surface))"/><path d="${R.river}" style="fill:none;stroke:var(--sim-water);stroke-width:13;stroke-linecap:round"/>${hull}`
      + R.set.map(([k, x, y, t]) => `<g><circle cx="${x}" cy="${y}" r="30" style="fill:color-mix(in oklab, var(--sim-bg-surface) ${this._on.has(k) ? 90 : 60}%, transparent)"/>${hut(x - 12, y - 2)}${hut(x + 12, y + 2)}<circle cx="${x}" cy="${y + 18}" r="8" style="fill:var(--sim-series-${t === 1 ? 2 : t === 2 ? 1 : 6});stroke:var(--sim-bg-surface);stroke-width:2"/></g>`).join('');
    const hits = this.root.querySelector('[data-hits]');
    if (hits) {
      hits.innerHTML = R.set.map(([k, x, y, t]) => `<button type="button" class="jg-s" data-s="${k}" aria-pressed="${this._on.has(k)}" aria-label="Settlement ${k}, kin group ${t}" style="left:${(x / VW) * 100}%;top:${(y / VH) * 100}%"></button>`).join('');
      hits.querySelectorAll('[data-s]').forEach((g) => onTap(g, () => this.toggle(g.dataset.s)));
    }
    this.relayout?.();
  }

  checkObjective() { return this._won.every(Boolean) ? { ok: true } : null; }
}
