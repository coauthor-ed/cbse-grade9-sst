// StationDiagnosisGameScene - game "Which station?" (L07 s07). A climate graph with its name hidden; tap the
// station from four. A wrong tap gives a true line from the table about the station tapped, and the
// learner tries again. A right tap names the place on the map. Six rounds. Controls: .sd-opt (data-opt 0-3), .sd-next.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { stationOf, climoSvg, MONTH_NAMES } from './StationData.js';
import { loadIndia, indiaView, mapSvg, mapEnd, pinSvg } from '../L06/IndiaMapSvg.js';

const ROUNDS = [
  { id: 'mumbai', opts: ['mumbai', 'delhi', 'leh', 'bengaluru'], why: 'Mumbai: 61.0 cm in July, and almost none from December to April.' },
  { id: 'leh', opts: ['shillong', 'leh', 'jodhpur', 'delhi'], why: 'Leh: below zero from December to March, and only 8.5 cm in the year.' },
  { id: 'chennai', opts: ['kolkata', 'nagpur', 'chennai', 'mumbai'], why: 'Chennai: the tall bars are October and November, with the north-east monsoon.' },
  { id: 'shillong', opts: ['shillong', 'kolkata', 'bengaluru', 'nagpur'], why: 'Shillong: cool at 1461 m, with 47.6 cm in June.' },
  { id: 'thiruvananthapuram', opts: ['nagpur', 'delhi', 'jodhpur', 'thiruvananthapuram'], why: 'Thiruvananthapuram: an almost flat line, with rain in two peaks.' },
  { id: 'jodhpur', opts: ['delhi', 'jodhpur', 'mumbai', 'chennai'], why: 'Jodhpur: hot in May and June, and only 36.6 cm in the year.' },
];
const SCALE = { tMin: -10, tMax: 40, rMax: 70, tStep: 10, rStep: 10 };
const about = (s) => { const m = Math.max(...s.rain); return `Not ${s.name}: its wettest month is ${MONTH_NAMES[s.rain.indexOf(m)]}, with ${m.toFixed(1)} cm, and its year totals ${s.total.toFixed(1)} cm.`; };
const CSS = `
.gm.sd { gap: 8px; background: var(--sim-bg-deep); border-radius: 14px; }
.sd-board { display: grid; grid-template-columns: 470px minmax(0, 1fr); gap: 14px; align-items: start; }
.sd-graph svg { display: block; width: 100%; height: auto; }
.sd-side { display: flex; flex-direction: column; gap: 8px; }
.sd-q { font: 600 18px/1.2 var(--sim-font-display, var(--sim-font)); margin: 0; }
.sd-opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.sd-opt { min-height: 48px; border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font: 700 15px/1.05 var(--sim-font); padding: 4px; overflow-wrap: anywhere; }
.sd-opt[data-state="good"] { background: color-mix(in oklab, var(--sim-good) 28%, var(--sim-bg-surface)); border-color: var(--sim-good); }
.sd-opt[data-state="bad"] { background: color-mix(in oklab, var(--sim-error) 16%, var(--sim-bg-surface)); border-color: var(--sim-error); }
.sd-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); }
.sd-foot { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 10px; align-items: center; }
.sd-map svg { display: block; width: 100%; height: auto; }
.sd-map:empty { display: none; }
.sd-next { min-height: 48px; border: 0; border-radius: var(--sim-radius-md); background: var(--sim-accent); color: var(--sim-bg-surface); font: 800 16px/1 var(--sim-font); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.sd-next[hidden], .sd-credit[hidden] { display: none; }
.sd-col { display: flex; flex-direction: column; gap: 6px; }
.sd-next { width: 100%; }
.sd-credit { font: 700 14px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.sim-dom-root--portrait .sd-board { grid-template-columns: minmax(0, 1fr); }
`;

export class StationDiagnosisGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Which station is this? Read the climate graph, then pick the station from four.' } };
  static ARIA_LABEL = 'A game: a climate graph with the station name hidden, and four stations to choose from.';

  async setup() {
    this._i = 0; this._done = false; this._right = false; this._geo = null;
    await super.setup();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm sd"><div class="gm-head"><h2>Which station?</h2><p class="sub">Line: temperature. Bars: rain.</p></div>
      <div class="sd-board"><div class="sd-graph"></div><div class="sd-side"><p class="sd-q"></p><div class="sd-opts"></div><p class="sd-why" aria-live="polite"></p><div class="sd-foot"><div class="sd-map"></div><div class="sd-col"><button type="button" class="tap sd-next" hidden>Next graph</button><span class="sd-credit" hidden>Boundary of India: Survey of India</span></div></div></div></div></div>` });
    const q = (s) => this.root.querySelector(s);
    this._g = q('.sd-graph'); this._q = q('.sd-q'); this._o = q('.sd-opts'); this._w = q('.sd-why'); this._n = q('.sd-next'); this._mp = q('.sd-map'); this._cr = q('.sd-credit');
    if (this._n) onTap(this._n, () => this._advance());
    this._deal();
    loadIndia().then((g) => { this._geo = g; }).catch(() => {});
  }

  _deal() {
    const r = ROUNDS[this._i], s = stationOf(r.id);
    this._right = false;
    if (this._g) {
      // The viewBox is the column's own width, so 14 px chart text stays 14 px on a phone.
      const W = Math.max(280, Math.min(470, Math.round(this._g.clientWidth || 470))), H = W < 400 ? 220 : 240;
      this._g.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Climate graph with its name hidden.">${climoSvg(s, { x: 0, y: 0, w: W, h: H }, SCALE)}</svg>`;
    }
    if (this._q) this._q.textContent = `Graph ${this._i + 1} of ${ROUNDS.length}`;
    if (this._w) this._w.textContent = '';
    if (this._mp) this._mp.innerHTML = '';
    if (this._cr) this._cr.hidden = true;
    if (this._n) { this._n.hidden = true; this._n.textContent = this._i === ROUNDS.length - 1 ? 'Finish' : 'Next graph'; }
    if (this._o) {
      this._o.innerHTML = '';
      r.opts.forEach((id, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tap sd-opt'; b.textContent = stationOf(id).name; b.dataset.opt = String(i);
        onTap(b, () => this._pick(b, id));
        this._o.appendChild(b);
      });
    }
    this.relayout?.();
  }

  _pick(b, id) {
    if (this._right) return;
    const r = ROUNDS[this._i];
    if (id === r.id) {
      this._right = true; b.dataset.state = 'good'; this._w.textContent = r.why; this._n.hidden = false;
      this.quill?.perform('hop');
      if (this._geo && this._mp) {
        const box = { x: 0, y: 0, w: 192, h: 200 }, v = indiaView(this._geo, box, [[66, 6], [100, 38]]), p = v.at(stationOf(id).ll);
        this._mp.innerHTML = `<svg viewBox="0 0 192 200" role="img" aria-label="${stationOf(id).name} on a map of India. Boundary of India: Survey of India.">${mapSvg(v)}${pinSvg(p[0], p[1], { r: 8, c: 'var(--sim-series-2)' })}${mapEnd(v)}</svg>`;
        if (this._cr) this._cr.hidden = false;
      }
    } else {
      b.dataset.state = 'bad';
      this._w.textContent = about(stationOf(id));
      this.quill?.setExpression('surprised');
    }
    this.relayout?.();
  }

  _advance() {
    if (!this._right) return;
    if (this._i < ROUNDS.length - 1) { this._i += 1; this._deal(); return; }
    this._done = true;
    if (this._q) this._q.textContent = 'All six stations read.';
    finishGame(this);
  }

  checkObjective() { return this._done ? { ok: true } : null; }
}
