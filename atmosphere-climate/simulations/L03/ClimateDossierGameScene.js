// ClimateDossierGameScene - blk-l03-s07, "Which zone?". Real places by latitude. Round: read the
// latitude, tap the temperature zone; the pin drops at its true height on the globe; then choose
// what the climate there is like. The zone follows from the latitude and the book's five lines.
// Temperatures are Table 3.3. Station latitudes for Maitri and Himadri are beyond the book.
// Kept class and file name. Rounds are the scene's own; ok only when all seven are won.
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const BANDS = [
  { id: 'nf', name: 'North Frigid', range: 'above 66\u00bd\u00b0N', from: 90, to: 66.5, col: 'var(--sim-series-1)' },
  { id: 'nt', name: 'North Temperate', range: '23\u00bd\u00b0N to 66\u00bd\u00b0N', from: 66.5, to: 23.5, col: 'var(--sim-series-3)' },
  { id: 'to', name: 'Torrid', range: '23\u00bd\u00b0S to 23\u00bd\u00b0N', from: 23.5, to: -23.5, col: 'var(--sim-series-2)' },
  { id: 'st', name: 'South Temperate', range: '23\u00bd\u00b0S to 66\u00bd\u00b0S', from: -23.5, to: -66.5, col: 'var(--sim-series-3)' },
  { id: 'sf', name: 'South Frigid', range: 'below 66\u00bd\u00b0S', from: -66.5, to: -90, col: 'var(--sim-series-1)' },
];
const CLIMATES = [
  { id: 'warm', label: 'Warm all year' },
  { id: 'two', label: 'A warm season and a cold season' },
  { id: 'ice', label: 'Frozen for much of the year' },
];
const PLACES = [
  { name: 'Thiruvananthapuram', lat: 8.5, show: '8\u00b029\u2032N', climate: 'warm', fact: 'Coolest month 26.2 \u00b0C, warmest 28.7 \u00b0C.' },
  { name: 'Delhi', lat: 29, show: '29\u00b0N', climate: 'two', fact: 'January 14.4 \u00b0C, June 33.3 \u00b0C.' },
  { name: 'Kolkata', lat: 22.57, show: '22\u00b034\u2032N', climate: 'warm', fact: 'Just south of the Tropic of Cancer. Coolest month 19.6 \u00b0C.' },
  { name: 'Shillong', lat: 24.57, show: '24\u00b034\u2032N', climate: 'two', fact: 'Just north of the Tropic of Cancer, and high up. January 9.8 \u00b0C, July 21.1 \u00b0C.' },
  { name: 'Leh', lat: 34, show: '34\u00b0N', climate: 'two', fact: 'Very high up. January \u22128.5 \u00b0C, July 17.2 \u00b0C.' },
  { name: 'Maitri, Antarctica', lat: -70.8, show: 'about 71\u00b0S', climate: 'ice', fact: 'An Indian research station, on the ice.' },
  { name: 'Himadri, Svalbard', lat: 78.9, show: 'about 79\u00b0N', climate: 'ice', fact: 'An Indian research station in the Arctic.' },
];
const bandOf = (lat) => BANDS.find((b) => lat <= b.from && lat > b.to) ?? BANDS[4];
const R = 96, CX = 100, CY = 104;
const yOf = (lat) => CY - R * Math.sin(lat * Math.PI / 180);

const CSS = `
.gm.zn { background: var(--sim-bg-deep); border-radius: 14px; }
.zn .board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 240px 214px minmax(0, 1fr); gap: 16px; align-items: start; }
.zn .place { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 10px 12px; box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.zn .pname { font-family: var(--sim-font); font-size: 20px; font-weight: 800; line-height: 1.15; overflow-wrap: anywhere; }
.zn .plat { font-family: var(--sim-font-display); font-size: 30px; font-weight: 700; color: var(--sim-accent); line-height: 1.2; }
.zn .round { font-size: 15px; font-weight: 700; color: var(--sim-label-muted); }
.zn .why { margin: 8px 0 0; font-size: 15px; line-height: 1.3; min-height: 40px; color: var(--sim-label); }
.zn .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.zn .globe { width: 200px; height: 208px; display: block; margin: 0 auto; }
.zn .rows { display: flex; flex-direction: column; gap: 6px; }
.zn .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; text-align: left; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); padding: 4px 12px; font-size: 16px; font-weight: 800; width: 100%; }
.zn .row small { font-size: 14px; font-weight: 700; color: var(--sim-label-muted); white-space: nowrap; }
.zn .row[data-state="good"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 22%, var(--sim-bg-surface)); }
.zn .row[data-state="bad"] { border-color: var(--sim-bad); }
.zn .btn.next { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; width: 100%; font-size: 16px; font-weight: 800; }
.zn .q { font-size: 16px; font-weight: 800; margin: 0 0 6px; }
.sim-dom-root:not(.sim-dom-root--portrait) .zn .gm-head { display: flex; gap: 12px; align-items: baseline; max-width: none; padding-right: 60px; }
.sim-dom-root:not(.sim-dom-root--portrait) .zn .gm-head .kicker { margin: 0; }
.sim-dom-root:not(.sim-dom-root--portrait) .zn .row { min-height: 40px; padding: 2px 12px; }
.sim-dom-root:not(.sim-dom-root--portrait) .zn .rows { gap: 4px; }
.sim-dom-root--portrait .zn .board { display: flex; flex-direction: column; gap: 10px; }
.sim-dom-root--portrait .zn .globe { width: 170px; height: 177px; }
.sim-dom-root--portrait .zn .gwrap { display: none; }
.sim-dom-root--portrait .zn .gwrap[data-pin="1"] { display: block; }
.sim-dom-root--portrait .zn .place { width: 100%; }
.sim-dom-root--portrait .zn .choices { width: 100%; }
`;

export class ClimateDossierGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: "Find each place's temperature zone on the globe, then say what its climate is like." } };
  static ARIA_LABEL = 'Which zone: read the latitude of a real place, tap its temperature zone, then say what its climate is like.';

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm zn"><div class="gm-head"><p class="kicker">Which zone?</p><h2>Find the zone from the latitude</h2></div>
        <div class="board"><div class="place" id="zn-place"></div><div class="gwrap" id="zn-g"></div><div class="choices" id="zn-c"></div></div></div>`,
    });
    this.root.querySelector('#zn-c')?.addEventListener('click', (e) => this._onClick(e));
    this._draw();
    this.quill?.speak('Read the latitude first.', 4200);
  }
  _reset() { this._i = 0; this._phase = 'zone'; this._msg = ''; this._bad = false; this._wrong = null; this._won = 0; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._reset(); this._draw?.(); }

  _onClick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick, p = PLACES[this._i];
    if (v === 'next') {
      this._i += 1; this._phase = 'zone'; this._msg = ''; this._bad = false; this._wrong = null;
      if (this._i >= PLACES.length) { this._done = true; this._i = PLACES.length - 1; this._draw(); finishGame(this); return; }
      this._draw(); return;
    }
    if (this._phase === 'zone') {
      const right = bandOf(p.lat);
      if (v === right.id) { this._phase = 'climate'; this._msg = `${p.show} lies in the ${right.name} Zone.`; this._bad = false; this._wrong = null; }
      else { const w = BANDS.find((x) => x.id === v); this._wrong = v; this._bad = true; this._msg = `The ${w.name} Zone runs ${w.range}. ${p.name} is at ${p.show}.`; }
    } else if (this._phase === 'climate') {
      if (v === p.climate) { this._phase = 'next'; this._won += 1; this._bad = false; this._msg = p.fact; this._wrong = null; this.quill?.setExpression?.('happy'); }
      else { this._wrong = v; this._bad = true; this._msg = `Not this one. ${p.fact}`; }
    }
    this._draw();
  }

  _globe(p, pin) {
    let s = `<svg class="globe" viewBox="0 0 200 208" role="img" aria-label="A globe with the five temperature zones"><defs><clipPath id="znc"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs><g clip-path="url(#znc)">`;
    for (const b of BANDS) {
      const y0 = CY - R * Math.sin(b.from * Math.PI / 180), y1 = CY - R * Math.sin(b.to * Math.PI / 180);
      s += `<rect x="0" y="${y0.toFixed(1)}" width="200" height="${(y1 - y0).toFixed(1)}" style="fill:${b.col};opacity:0.75"/>`;
    }
    s += `</g><circle cx="${CX}" cy="${CY}" r="${R}" style="fill:none;stroke:var(--sim-label);stroke-width:3"/>`;
    for (const l of [66.5, 23.5, 0, -23.5, -66.5]) { const y = yOf(l), hw = R * Math.cos(l * Math.PI / 180); s += `<path d="M${(CX - hw).toFixed(1)} ${y.toFixed(1)}H${(CX + hw).toFixed(1)}" style="stroke:var(--sim-bg-surface);stroke-width:2"/>`; }
    if (pin) { const y = yOf(p.lat); s += `<circle cx="${CX}" cy="${y.toFixed(1)}" r="9" style="fill:var(--sim-bad);stroke:var(--sim-bg-surface);stroke-width:3"/>`; }
    return s + '</svg>';
  }

  _draw() {
    const p = PLACES[this._i], root = this.root;
    if (!root?.querySelector?.('#zn-place')) return;
    const n = PLACES.length, pin = this._phase !== 'zone';
    root.querySelector('#zn-place').innerHTML = `<div class="round">Place ${this._i + 1} of ${n}</div><div class="pname">${esc(p.name)}</div><div class="plat">${esc(p.show)}</div>`
      + `<p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
    const g = root.querySelector('#zn-g');
    g.dataset.pin = pin ? '1' : '0';
    g.innerHTML = this._globe(p, pin);
    let c = '';
    if (this._done) c = '<p class="q">All seven places found.</p>';
    else if (this._phase === 'zone') {
      c = `<p class="q">Which zone?</p><div class="rows">${BANDS.map((b) => `<button type="button" class="tap row" data-pick="${b.id}" data-state="${this._wrong === b.id ? 'bad' : ''}"><span>${b.name}</span><small>${b.range}</small></button>`).join('')}</div>`;
    } else if (this._phase === 'climate') {
      c = `<p class="q">What is the climate like?</p><div class="rows">${CLIMATES.map((b) => `<button type="button" class="tap row" data-pick="${b.id}" data-state="${this._wrong === b.id ? 'bad' : ''}"><span>${b.label}</span></button>`).join('')}</div>`;
    } else {
      c = `<div class="rows"><button type="button" class="tap btn next" data-pick="next">${this._i + 1 === n ? 'Finish' : 'Next place'}</button></div>`;
    }
    root.querySelector('#zn-c').innerHTML = c;
  }

  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: this._won === PLACES.length };
  }
}
