// MonsoonBoardGameScene - blk-l05-s09, "Who gets rain?". A month and a place, on a true map. Pick where
// the wind comes from, then rain or dry. Win rule is the book's: June to September wind from the sea;
// October to February wind from the land, dry, except where it has crossed the Bay of Bengal. Each
// round shows that month's rainfall from Table 3.3. Changed from a region picker: the book names
// regions without borders, and the table gives one exact fact for a place and a month.
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';
import { AIR_CSS, windArrow, loadGeo, indiaMap, creditPlate, sky, SKY_INK, tx } from '../L03/AirDraw.js';

const ROUNDS = [
  { month: 'July', place: 'Mumbai', ll: [72.88, 19.07], wind: 'sw', rain: true, cm: 61.0, why: 'The wind comes straight off the Arabian Sea.' },
  { month: 'January', place: 'Delhi', ll: [77.2, 28.6], wind: 'ne', rain: false, cm: 2.5, why: 'Cold, dry wind blows from the land.' },
  { month: 'November', place: 'Chennai', ll: [80.27, 13.08], wind: 'ne', rain: true, cm: 35.0, why: 'The wind picks up moisture over the Bay of Bengal.' },
  { month: 'June', place: 'Shillong', ll: [91.88, 25.57], wind: 'sw', rain: true, cm: 47.6, why: 'Moist wind comes in from the Bay of Bengal.' },
  { month: 'December', place: 'Mumbai', ll: [72.88, 19.07], wind: 'ne', rain: false, cm: 0, why: 'Mumbai is on the sea, but this wind blows from the land.' },
  { month: 'January', place: 'Nagpur', ll: [79.09, 21.15], wind: 'ne', rain: false, cm: 1.1, why: 'This wind has crossed only dry land.' },
];
const WINDS = { sw: 'From the south-west, off the sea', ne: 'From the north-east, off the land' };
const CSS = AIR_CSS + `
.gm.mb { background: var(--sim-bg-deep); border-radius: 14px; }
.mb .board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 16px; align-items: start; }
.mb .map { width: 100%; height: 318px; display: block; border-radius: var(--sim-radius-lg); }
.mb .card { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 4px 12px; box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.mb .mon { font-family: var(--sim-font-display); font-size: 26px; font-weight: 700; color: var(--sim-accent); line-height: 1.2; }
.mb .pl { font-size: 18px; font-weight: 800; line-height: 1.2; }
.mb .round { font-size: 15px; font-weight: 700; color: var(--sim-label-muted); }
.mb .q { font-size: 16px; font-weight: 800; margin: 6px 0 4px; }
.mb .rows { display: flex; flex-direction: column; gap: 6px; }
.mb .row { font-size: 16px; font-weight: 800; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); padding: 4px 12px; text-align: left; width: 100%; }
.mb .row[data-state="bad"] { border-color: var(--sim-bad); }
.mb .why { font-size: 15px; line-height: 1.25; margin: 4px 0 0; }
.mb .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.mb .btn.next { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; width: 100%; font-size: 16px; font-weight: 800; }
.sim-dom-root--portrait .mb .board { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .mb .map { height: 250px; }
.sim-dom-root--portrait .mb .side, .sim-dom-root--portrait .mb #mb-map { width: 100%; }
`;
const VW = 330, VH = 330;

export class MonsoonBoardGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'For each month, choose where the wind comes from, then say whether the place gets rain.' } };
  static ARIA_LABEL = 'Who gets rain: a month and a place on a map of India. Choose where the wind comes from, then say whether the place gets rain.';

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm mb"><div class="gm-head"><p class="kicker">Who gets rain?</p><h2>Month first, then the wind</h2></div><div class="board"><div id="mb-map"></div><div class="side" id="mb-s"></div></div></div>` });
    this.root.querySelector('#mb-s')?.addEventListener('click', (e) => this._onClick(e));
    this._draw();
    this._g = await loadGeo();
    this._draw();
  }
  _reset() { this._i = 0; this._ph = 'wind'; this._msg = ''; this._bad = false; this._wrong = null; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._reset(); this._draw?.(); }
  _onClick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick, r = ROUNDS[this._i];
    if (v === 'next') {
      this._i += 1; this._ph = 'wind'; this._msg = ''; this._bad = false; this._wrong = null;
      if (this._i >= ROUNDS.length) { this._i = ROUNDS.length - 1; this._done = true; this._ph = 'done'; this._draw(); finishGame(this); return; }
    } else if (this._ph === 'wind') {
      if (v === r.wind) { this._ph = 'rain'; this._bad = false; this._msg = ''; this._wrong = null; }
      else { this._wrong = v; this._bad = true; this._msg = 'June to September: from the sea. October to February: from the land.'; }
    } else if (this._ph === 'rain') {
      if ((v === 'yes') === r.rain) { this._ph = 'next'; this._bad = false; this._wrong = null; this._msg = `${r.why} ${r.place} in ${r.month}: ${r.cm ? r.cm.toFixed(1) + ' cm of rain' : 'no rain recorded'}.`; }
      else { this._wrong = v; this._bad = true; this._msg = 'Think about what the wind has crossed on its way here.'; }
    }
    this._draw();
  }
  _map(r) {
    const m = indiaMap(this._g, { x: 0, y: 0, w: VW, h: VH }, [[60, 3], [100, 37]]);
    let s = `<svg class="map" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of India"><rect width="${VW}" height="${VH}" style="fill:${sky('sea')}"/>`;
    if (m) {
      s += `<path d="${m.landD}" style="fill:color-mix(in oklab, ${sky('sand')} 70%, var(--sim-bg-surface));stroke:${sky('sandDark')};stroke-width:1"/><path d="${m.indiaD}" style="fill:${sky('grassLit')};stroke:${SKY_INK};stroke-width:1.5"/>`;
      if (this._ph !== 'wind' && this._ph !== 'done') {
        const a = m.at;
        const route = r.wind === 'sw'
          ? (r.place === 'Shillong' ? [[80, 5], [87, 10], [90.5, 18], [91.5, 24]] : [[62, 8], [67, 13], [72, 18.5]])
          : r.place === 'Chennai' ? [[92, 20], [86, 14.5], [80.8, 13]] : [[88, 28], [80, 24], [73, 16], [67, 10]];
        s += windArrow(route.map(a), { w: 9, col: sky('cloud'), curve: true });
      }
      const [x, y] = m.at(r.ll);
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" style="fill:var(--sim-bad);stroke:var(--sim-bg-surface);stroke-width:3"/>`;
      s += tx(x, y - 15, r.place, { size: 15, col: SKY_INK, halo: sky('cloud') });
      s += creditPlate(VW, VH, { size: 16 });
    }
    return s + '</svg>';
  }
  _draw() {
    const r = ROUNDS[this._i], root = this.root;
    if (!root?.querySelector?.('#mb-s')) return;
    root.querySelector('#mb-map').innerHTML = this._map(r);
    let c = `<div class="card"><div class="round">Round ${this._i + 1} of ${ROUNDS.length}</div><div class="mon">${esc(r.month)}</div><div class="pl">${esc(r.place)}</div></div>`;
    if (this._ph === 'wind') c += `<p class="q">Where does the wind come from?</p><div class="rows">${Object.entries(WINDS).map(([k, t]) => `<button type="button" class="tap row" data-pick="${k}" data-state="${this._wrong === k ? 'bad' : ''}">${t}</button>`).join('')}</div>`;
    if (this._ph === 'rain') c += `<p class="q">Does this place get rain now?</p><div class="rows"><button type="button" class="tap row" data-pick="yes" data-state="${this._wrong === 'yes' ? 'bad' : ''}">Yes, rain</button><button type="button" class="tap row" data-pick="no" data-state="${this._wrong === 'no' ? 'bad' : ''}">No, mostly dry</button></div>`;
    if (this._ph === 'next') c += `<div class="rows" style="margin-top:10px"><button type="button" class="tap btn next" data-pick="next">${this._i + 1 === ROUNDS.length ? 'Finish' : 'Next month'}</button></div>`;
    if (this._ph === 'done') c += '<p class="q">All six months read.</p>';
    c += `<p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
    root.querySelector('#mb-s').innerHTML = c;
  }
  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: true };
  }
}
