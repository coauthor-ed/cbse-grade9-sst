// LayerStackScene - build the Earth from the surface down. Round 1: order the layers. Round 2: give each
// its thickness. Round 3: the crust under the ocean. A wrong tap explains itself and costs nothing.
// Built on GameFrame. Thickness numbers are the book's approximate values.
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const ORDER = [
  { id: 'crust', name: 'Crust', km: '30-40 km', tone: 'var(--sim-strata-3)', why: 'the outermost layer, on which we live' },
  { id: 'mantle', name: 'Mantle', km: '2900 km', tone: 'var(--sim-magma)', why: 'very thick and hot, mostly solid' },
  { id: 'outer', name: 'Outer core', km: '2200 km', tone: 'var(--sim-flame)', why: 'fluid iron and nickel' },
  { id: 'inner', name: 'Inner core', km: '1250 km', tone: 'var(--sim-gold)', why: 'a solid, spinning metal ball at the centre' },
];
const OCEAN = ['5-7 km', '30-40 km', '100 km'];

const CSS = `
.gm.ls { background: var(--sim-bg-deep); border-radius: 14px; }
.ls .board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.ls .col { display: flex; flex-direction: column; gap: 6px; }
.ls .slot { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 50px; padding: 4px 12px;
  border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font-size: 17px; font-weight: 800; color: var(--sim-label); box-sizing: border-box; }
.ls .slot[data-empty="1"] { border-style: dashed; color: var(--sim-label-muted); font-weight: 700; }
.ls .slot[data-next="1"] { border-color: var(--sim-accent); }
.ls .slot i { width: 14px; height: 30px; border-radius: 6px; flex: none; margin-right: 8px; }
.ls .slot b { flex: 1 1 auto; font-weight: 800; }
.ls .slot small { font-size: 16px; font-weight: 800; white-space: nowrap; }
.ls .pool { display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; }
.ls .pool .tap { flex: 1 1 42%; font-size: 17px; font-weight: 800; }
.ls .q { font-size: 17px; font-weight: 800; margin: 0 0 8px; color: var(--sim-label); }
.ls .why { margin: 10px 0 0; font-size: 16px; line-height: 1.3; min-height: 44px; color: var(--sim-label); }
.ls .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.sim-dom-root:not(.sim-dom-root--portrait) .ls .gm-head { display: flex; gap: 12px; align-items: baseline; padding-right: 60px; }
.sim-dom-root:not(.sim-dom-root--portrait) .ls .gm-head .kicker { margin: 0; }
.sim-dom-root:not(.sim-dom-root--portrait) .ls .why { padding-right: 60px; }
.sim-dom-root--portrait .ls .board { display: flex; flex-direction: column; gap: 12px; }
`;

export class LayerStackScene extends GameBoard {
  static HEIGHT = 290;
  static OBJECTIVE = { prompt: { en: 'Put the layers in order from the surface to the centre, with the right thickness for each.' } };
  static ARIA_LABEL = 'Build the Earth: tap the layers in order from the surface to the centre, then give each its thickness, then choose the thickness of the crust under the ocean.';

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, {
      css: CSS, check: false,
      html: '<div class="gm ls"><div class="gm-head"><p class="kicker">Build the Earth</p><h2 id="ls-title"></h2></div><div class="board"><div class="col" id="ls-col"></div><div id="ls-side"></div></div></div>',
    });
    this.root.querySelector('#ls-side')?.addEventListener('click', (e) => this._pick(e));
    this._draw();
  }
  _reset() { this._round = 0; this._n = 0; this._kmDone = 0; this._msg = ''; this._bad = false; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._reset(); this._draw?.(); }

  _pick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick;
    if (this._round === 0) {
      const want = ORDER[this._n];
      if (v === want.id) {
        this._n += 1; this._bad = false; this._msg = `${want.name}: ${want.why}.`;
        if (this._n === ORDER.length) { this._round = 1; this._msg = 'All four are in order. Now the thickness of each.'; }
      } else { this._bad = true; this._msg = `Not yet. Which layer comes after ${this._n ? ORDER[this._n - 1].name : 'the surface'}?`; }
    } else if (this._round === 1) {
      const want = ORDER[this._kmDone];
      if (v === want.km) {
        this._kmDone += 1; this._bad = false; this._msg = `${want.name}: about ${want.km}.`;
        if (this._kmDone === ORDER.length) { this._round = 2; this._msg = 'That is under a continent. Now move to the ocean.'; }
      } else { this._bad = true; this._msg = `${want.name} is not ${v} thick. Look at the three layers still to fill.`; }
    } else if (this._round === 2) {
      if (v === OCEAN[0]) { this._round = 3; this._bad = false; this._msg = 'Yes. Crust is only 5-7 km thick under the ocean, and all the layers add up to about 6375 km.'; this._done = true; this._draw(); this.quill?.setExpression?.('happy'); finishGame(this); return; }
      this._bad = true; this._msg = v === '100 km' ? 'That is the lithosphere. The crust is only a part of it.' : 'That is the crust under a continent. Ocean crust is much thinner.';
    }
    this._draw();
  }

  _draw() {
    const root = this.root, col = root?.querySelector?.('#ls-col');
    if (!col) return;
    root.querySelector('#ls-title').textContent = ['From the surface to the centre', 'How thick is each layer?', 'Crust under the ocean', 'The Earth is built'][this._round];
    col.innerHTML = ORDER.map((l, i) => {
      const placed = this._round > 0 || i < this._n;
      const km = this._round > 1 || (this._round === 1 && i < this._kmDone) ? (i === 0 && this._round === 3 ? '5-7 km' : l.km) : '';
      const next = this._round === 0 ? i === this._n : this._round === 1 ? i === this._kmDone : i === 0 && this._round === 2;
      return `<div class="slot" data-empty="${placed ? 0 : 1}" data-next="${next ? 1 : 0}">${placed ? `<i style="background:${l.tone}"></i><b>${esc(l.name)}</b><small>${esc(km)}</small>` : `<b>Layer ${i + 1}</b>`}</div>`;
    }).join('');
    let opts = [];
    if (this._round === 0) opts = ORDER.filter((l, i) => i >= this._n).map((l) => ({ v: l.id, t: l.name })).sort((a, b) => a.t.length - b.t.length || (a.t < b.t ? 1 : -1));
    if (this._round === 1) opts = ['1250 km', '2200 km', '30-40 km', '2900 km'].filter((k) => ORDER.slice(this._kmDone).some((l) => l.km === k)).map((k) => ({ v: k, t: k }));
    if (this._round === 2) opts = OCEAN.slice().reverse().map((k) => ({ v: k, t: k }));
    const q = ['Tap the next layer down.', `How thick is the ${ORDER[Math.min(this._kmDone, 3)].name.toLowerCase()}?`, 'How thick is the crust under the ocean?', ''][this._round];
    root.querySelector('#ls-side').innerHTML = `<p class="q">${esc(q)}</p><div class="pool">${opts.map((o) => `<button type="button" class="tap btn" data-pick="${esc(o.v)}">${esc(o.t)}</button>`).join('')}</div><p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
  }

  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: true };
  }
}
