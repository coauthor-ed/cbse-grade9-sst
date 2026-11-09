// IsochroneDrawScene - game "Read the date lines" (L06 s09). A pin on the map, three dates: tap the line the
// place lies on or nearest. Five rounds on the advance map, then three on the retreat map. Answers were
// measured against the lines in shared/MonsoonLines.js (distance from place to line). Controls: .id-opt
// buttons (data-opt 0-2), .id-next. A wrong tap gives a true one-line why, and the learner tries again.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { ADVANCE, RETREAT, PLACES } from '../shared/MonsoonLines.js';
import { loadIndia, indiaView, mapSvg, mapEnd, creditSvg, mapText, pinSvg } from './IndiaMapSvg.js';

const ROUNDS = [
  { set: 'a', p: 'kochi', name: 'Kerala', opts: ['1 June', '15 June', '30 June'], key: '1 June', why: 'Kerala is the first part of the mainland the line reaches.' },
  { set: 'a', p: 'nagpur', name: 'Nagpur', opts: ['5 June', '15 June', '25 June'], key: '15 June', why: 'Nagpur sits almost on the 15 June line, half-way up the country.' },
  { set: 'a', p: 'kolkata', name: 'Kolkata', opts: ['1 June', '10 June', '25 June'], key: '10 June', why: 'The Bay of Bengal branch brings the line close to Kolkata near 10 June.' },
  { set: 'a', p: 'delhi', name: 'Delhi', opts: ['10 June', '30 June', '8 July'], key: '30 June', why: 'Delhi lies just before the 30 June line, around the end of June.' },
  { set: 'a', p: 'jodhpur', name: 'Jodhpur', opts: ['20 June', '30 June', '5 July'], key: '5 July', why: 'Jodhpur sits on the 5 July line: the west of Rajasthan comes last.' },
  { set: 'r', p: 'jodhpur', name: 'Jodhpur', opts: ['17 Sep', '5 Oct', '15 Oct'], key: '17 Sep', why: 'The monsoon leaves the far north-west first.' },
  { set: 'r', p: 'mumbai', name: 'Mumbai', opts: ['20 Sep', '5 Oct', '15 Oct'], key: '5 Oct', why: 'Mumbai sits on the 5 Oct line.' },
  { set: 'r', p: 'kolkata', name: 'Kolkata', opts: ['25 Sep', '5 Oct', '10 Oct'], key: '10 Oct', why: 'The east keeps the monsoon late: the 10 Oct line runs close to Kolkata.' },
];
const SETS = {
  a: { lines: ADVANCE, label: 'Monsoon arriving', tone: 6, tags: { '1 June': 0, '5 June': 0, '10 June': 1, '15 June': 0, '20 June': 0, '25 June': 1, '30 June': 1, '5 July': 0, '8 July': 0, '26 May': 1, '22 May': 1 } },
  r: { lines: RETREAT, label: 'Monsoon leaving', tone: 5, tags: { '17 Sep': 1, '20 Sep': 1, '25 Sep': 1, '30 Sep': 1, '5 Oct': 1, '10 Oct': 1, '15 Oct': 0 } },
};
const EXTENT = [[65.5, 6.4], [100.5, 37.6]];
const CSS = `
.gm.id { gap: 8px; background: var(--sim-bg-deep); border-radius: 14px; }
.sim-dom-root:not(.sim-dom-root--portrait) .id .sub { display: none; }
.id-board { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 14px; align-items: start; min-height: 0; }
.id-map { width: 100%; min-width: 0; }
.id-map svg { display: block; width: 100%; height: auto; }
.id-side { display: flex; flex-direction: column; gap: 8px; }
.id-ask { font: 600 19px/1.2 var(--sim-font-display, var(--sim-font)); margin: 0; }
.id-tag { align-self: flex-start; padding: 2px 10px; border-radius: var(--look-pill); font: 800 14px/1.4 var(--sim-font); color: var(--sim-label); background: color-mix(in oklab, var(--t) 26%, var(--sim-bg-surface)); border: 2px solid var(--t); }
.id-opts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.id-opt { min-height: 48px; border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font: 600 16px/1.1 var(--sim-font-display, var(--sim-font)); padding: 4px; }
.id-opt[data-state="good"] { background: color-mix(in oklab, var(--sim-good) 28%, var(--sim-bg-surface)); border-color: var(--sim-good); }
.id-opt[data-state="bad"] { background: color-mix(in oklab, var(--sim-error) 16%, var(--sim-bg-surface)); border-color: var(--sim-error); }
.id-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label); }
.id-next { min-height: 48px; border: 0; border-radius: var(--sim-radius-md); background: var(--sim-accent); color: var(--sim-bg-surface); font: 800 16px/1 var(--sim-font); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.id-next[hidden] { display: none; }
.sim-dom-root--portrait .id-board { grid-template-columns: minmax(0, 1fr); }
`;

export class IsochroneDrawScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Read the date lines: find the date for each place, then say whether the monsoon is arriving or leaving.' } };
  static ARIA_LABEL = 'A game on maps of monsoon dates: for each marked place, choose the date of the line it lies on or nearest.';

  async setup() {
    this._i = 0; this._done = false; this._geo = null; this._right = false;
    await super.setup();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm id"><div class="gm-head"><h2>Read the date lines</h2><p class="sub">Which date line is it nearest?</p></div>
      <div class="id-board"><div class="id-map"></div><div class="id-side"><span class="id-tag"></span><p class="id-ask"></p><div class="id-opts"></div><p class="id-why" aria-live="polite"></p><button type="button" class="tap id-next" hidden>Next place</button></div></div></div>` });
    const q = (s) => this.root.querySelector(s);
    this._m = q('.id-map'); this._ask = q('.id-ask'); this._opts = q('.id-opts'); this._why = q('.id-why'); this._nextBtn = q('.id-next'); this._tag = q('.id-tag');
    if (this._nextBtn) onTap(this._nextBtn, () => this._advance());
    this._deal();
    loadIndia().then((g) => { this._geo = g; this._drawMap(); this.relayout?.(); }).catch(() => {});
  }

  get _r() { return ROUNDS[this._i]; }

  _drawMap() {
    if (!this._geo || !this._m) return;
    const W = 460, H = 446, box = { x: 0, y: 0, w: W, h: H }, v = indiaView(this._geo, box, EXTENT), r = this._r, S = SETS[r.set];
    let svg = mapSvg(v);
    const c = `var(--sim-series-${S.tone})`;
    S.lines.forEach((l) => {
      const on = this._right && l.date === r.key;
      svg += `<path d="${v.line(l.line)}" style="fill:none;stroke:${c};stroke-width:${on ? 9 : 5};stroke-linecap:round;opacity:${this._right && !on ? 0.4 : 1}"/>`;
    });
    S.lines.forEach((l) => {
      const e = S.tags[l.date], p = v.at(l.line[e ? l.line.length - 1 : 0]);
      const tw = l.date.length * 10.5, right = !e;
      const x = right ? Math.max(p[0] - 8, tw + 6) : Math.min(Math.max(p[0], tw / 2 + 4), W - tw / 2 - 4);
      svg += mapText(x, p[1] + (l.date === '8 July' ? -4 : l.date === '5 July' ? 14 : e ? -7 : 7), l.date, { size: 20, weight: 700, anchor: right ? 'end' : 'middle' });
    });
    const p = v.at(PLACES[r.p].ll);
    svg += pinSvg(p[0], p[1], { r: 9, c: 'var(--sim-series-2)' }) + mapText(p[0] + 14, p[1] + 7, r.name, { size: 21, anchor: 'start' }) + creditSvg(v, { size: 20 }) + mapEnd(v);
    this._m.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of India with dated monsoon lines and a pin on ${r.name}.">${svg}</svg>`;
  }

  _deal() {
    const r = this._r, S = SETS[r.set];
    this._right = false;
    if (this._ask) this._ask.textContent = `${this._i + 1} of ${ROUNDS.length}: ${r.name}`;
    if (this._tag) { this._tag.textContent = S.label; this._tag.style.setProperty('--t', `var(--sim-series-${S.tone})`); }
    if (this._why) this._why.textContent = '';
    if (this._nextBtn) { this._nextBtn.hidden = true; this._nextBtn.textContent = this._i === ROUNDS.length - 1 ? 'Finish' : 'Next place'; }
    if (this._opts) {
      this._opts.innerHTML = '';
      r.opts.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tap id-opt'; b.textContent = o; b.dataset.opt = String(i);
        onTap(b, () => this._pick(b, o));
        this._opts.appendChild(b);
      });
    }
    this._drawMap();
    this.relayout?.();
  }

  _pick(b, o) {
    const r = this._r;
    if (this._right) return;
    if (o === r.key) {
      b.dataset.state = 'good'; this._right = true;
      this._why.textContent = r.why;
      this._nextBtn.hidden = false;
      this._drawMap();
    } else {
      b.dataset.state = 'bad';
      this._why.textContent = `Not the ${o} line. Find ${r.name} on the map and read the line closest to the pin.`;
    }
    if (o === r.key) this.quill?.perform('hop'); else this.quill?.setExpression('surprised');
    this.relayout?.();
  }

  _advance() {
    if (!this._right) return;
    if (this._i < ROUNDS.length - 1) { this._i += 1; this._deal(); return; }
    this._done = true;
    if (this._ask) this._ask.textContent = 'All eight places read.';
    finishGame(this);
  }

  checkObjective() { return this._done ? { ok: true } : null; }
}
