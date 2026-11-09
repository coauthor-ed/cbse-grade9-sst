// SonarSurveyGameScene - blk-l01-s08. The ship sails the line south-west from Mumbai over water that hides the
// floor. Eight pings build a depth profile; the learner tags the four features where depth and shape fit. A tag
// needs a ping under the ship. Out of pings: Try again, tags kept. Depths are made up, and the board says so.
// Control names: [data-act="back"], [data-act="fwd"], [data-act="ping"], [data-tag="shelf|plain|seamount|ridge"], [data-act="again"].
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { svgSeaColumn, svgWaveLine, svgTrawler, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { floorDepth, mapper } from '../shared/SeaFloor.js';
import { seaLabel, seaWhite } from '../shared/SeaBits.js';
import { SEA_GAME_CSS, isPortrait } from '../shared/SeaGame.js';

const LINE = { island: false };
const STOPS = [110, 204, 262, 340, 400, 474, 536, 600, 660, 734, 780];
const PINGS = 8;
const TAGS = [
  { id: 'shelf', label: 'Shelf edge', ok: [204], why: 'The shelf edge is shallow, and the next ping out is much deeper.' },
  { id: 'plain', label: 'Abyssal plain', ok: [340, 400], why: 'The plain is deep and flat: pings side by side read nearly the same.' },
  { id: 'seamount', label: 'Seamount', ok: [474], why: 'A seamount is one steep peak alone, with deep floor on both sides.' },
  { id: 'ridge', label: 'Mid-ocean ridge', ok: [734, 780], why: 'The ridge is far out, and the floor stays high across several pings.' },
];
const depthM = (x) => Math.round(floorDepth(x, LINE) * 5) * 10;

const CSS = SEA_GAME_CSS + `
.ss .tags { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ss .tags .btn[data-done="1"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 22%, var(--sim-bg-surface)); }
.ss .read { font: 600 22px/1.1 var(--sim-font-display); margin: 0; text-align: center; }
`;

export class SonarSurveyGameScene extends GameBoard {
  static ARIA_LABEL = 'A sonar game. A ship sails south-west from Mumbai. Eight pings measure the depth and build a profile of the hidden sea floor. Tag the shelf edge, the abyssal plain, a seamount and the mid-ocean ridge where the depth and shape fit.';
  static OBJECTIVE = { prompt: { en: 'Tag the shelf edge, the abyssal plain, a seamount and the mid-ocean ridge.' } };

  constructor(container, config) {
    super(container, config);
    this._at = 0; this._hits = {}; this._tags = {}; this._left = PINGS; this._msg = 'Sail, then ping. Eight pings are enough if you space them out.'; this._tone = '';
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false, css: CSS, onResize: () => this._paint(),
      html: `<div class="gm ss"><div class="gm-head"><p class="kicker">Sonar survey</p><h2>Map the hidden floor</h2></div>
        <div class="sg-board"><div data-pic></div>
        <div class="sg-side"><p class="read" data-read></p>
          <div class="sg-row"><button class="btn tap" data-act="back" aria-label="Sail back">Back</button><button class="btn tap btn--go" data-act="ping">Ping</button><button class="btn tap" data-act="fwd" aria-label="Sail on">Sail on</button></div>
          <div class="tags">${TAGS.map((t) => `<button class="btn tap" data-tag="${t.id}">${t.label}</button>`).join('')}</div>
          <p class="sg-msg" data-msg aria-live="polite"></p>
          <div class="sg-row"><button class="btn tap" data-act="again" hidden>Try again</button></div>
        </div></div></div>`,
    });
    this.root.querySelectorAll('[data-act]').forEach((b) => onTap(b, () => this._act(b.dataset.act)));
    this.root.querySelectorAll('[data-tag]').forEach((b) => onTap(b, () => this._tag(b.dataset.tag)));
    this._paint();
  }

  _say(t, tone = '') { this._msg = t; this._tone = tone; }

  _act(a) {
    if (a === 'back') { this._at = Math.max(0, this._at - 1); this._say(''); }
    else if (a === 'fwd') { this._at = Math.min(STOPS.length - 1, this._at + 1); this._say(''); }
    else if (a === 'again') { this._left = PINGS; const keep = {}; for (const id of Object.keys(this._tags)) keep[this._tags[id]] = this._hits[this._tags[id]]; this._hits = keep; this._say('Eight fresh pings. Your tags stay.'); }
    else if (a === 'ping') {
      if (this._hits[this._at] != null) this._say('You already have this depth. Sail on.');
      else if (this._left <= 0) this._say('No pings left. Press Try again.', 'bad');
      else { this._hits[this._at] = depthM(STOPS[this._at]); this._left -= 1; this._say(''); }
    }
    this._paint();
  }

  _tag(id) {
    const t = TAGS.find((q) => q.id === id);
    if (this._tags[id] != null) return;
    if (this._hits[this._at] == null) { this._say('Ping here first, so that you know the depth.', 'bad'); this._paint(); return; }
    if (t.ok.includes(STOPS[this._at])) {
      this._tags[id] = this._at; this._say(`${t.label} tagged.`, 'good');
      if (TAGS.every((q) => this._tags[q.id] != null)) { this._say('All four tagged. You have made a small bathymetric map.', 'good'); this._paint(); this.quill?.perform?.('hop'); finishGame(this); return; }
    } else this._say(t.why, 'bad');
    this._paint();
  }

  _pic() {
    const P = isPortrait(this), W = P ? 312 : 690, H = P ? 240 : 228, seaY = 44;
    const box = { x: 0, y: 0, w: W * 1000 / 830, h: H, seaY }, mp = mapper(box, { magma: false }), X = (x) => mp.X(x - 20);
    const Y = (d) => seaY + d / 4800 * (H - seaY - 34);
    let s = `<defs>${svgSkyGradient('ss-sky', 0, 12)}</defs><rect width="${W}" height="${seaY + 3}" style="fill:url(#ss-sky)"/>${svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, bands: 6, t: 0.5, wave: 2 })}`;
    // Coast: what is known without a ping.
    s += `<path d="M0 ${seaY - 16}L${X(70)} ${seaY - 2}L${X(100)} ${seaY + 8}L${X(84)} ${H}L0 ${H}Z" ${fill(sc('rock'))}/>`;
    const known = Object.keys(this._hits).map(Number).sort((a, b) => a - b).map((i) => [X(STOPS[i]), Y(this._hits[i]), i]);
    if (known.length > 1) s += `<path d="${line(known.map(([x, y]) => [x, y]))}" ${stroke(sc('sunCore'), 4)}/>`;
    for (const [x, y, i] of known) {
      s += `<path d="M${x} ${seaY}L${x} ${y}" ${stroke(sc('foam'), 2, 'stroke-dasharray:4 5;opacity:0.7')}/><circle cx="${x}" cy="${y}" r="6" ${fill(sc('sunCore'), `stroke:${sc('ink')};stroke-width:2`)}/>`;
      const tag = TAGS.find((t) => this._tags[t.id] === i);
      if (tag) s += seaWhite(Math.max(48, Math.min(W - 52, x)), y + 24, tag.label, { size: 15 });
    }
    STOPS.forEach((x) => { s += `<circle cx="${X(x)}" cy="${seaY}" r="2.5" ${fill(sc('cloud'))}/>`; });
    s += svgWaveLine(0, seaY, 1, { w: W, amp: 2, t: 0.5 });
    s += svgTrawler(X(STOPS[this._at]), seaY + 2, P ? 0.3 : 0.38);
    s += seaWhite(W - 8, H - 10, 'Depths made up', { anchor: 'end', size: 14 });
    s += seaLabel(6, 18, 'Mumbai', { anchor: 'start', size: 15 }) + seaLabel(P ? W - 48 : W - 8, 18, 'south-west', { anchor: 'end', size: 15 });
    return `<svg class="sea-pic" viewBox="0 0 ${W} ${H}" role="img" aria-label="The sea from the side, with a ship and the depths found so far">${s}</svg>`;
  }

  _paint() {
    const r = this.root;
    if (!r?.querySelector?.('[data-pic]')) return;
    r.querySelector('[data-pic]').innerHTML = this._pic();
    const d = this._hits[this._at];
    r.querySelector('[data-read]').textContent = `${d != null ? `Depth ${d.toLocaleString('en-IN')} m` : 'Depth unknown'}, ${this._left} pings left`;
    r.querySelector('[data-msg]').textContent = this._msg;
    r.querySelector('[data-msg]').dataset.tone = this._tone;
    r.querySelector('[data-act="back"]').disabled = this._at === 0;
    r.querySelector('[data-act="fwd"]').disabled = this._at === STOPS.length - 1;
    r.querySelector('[data-act="again"]').hidden = !(this._left <= 0 && !this.solved && TAGS.some((t) => this._tags[t.id] == null));
    for (const t of TAGS) { const b = r.querySelector(`[data-tag="${t.id}"]`); b.dataset.done = this._tags[t.id] != null ? '1' : '0'; }
  }

  checkObjective() {
    const done = TAGS.filter((t) => this._tags[t.id] != null).length;
    if (done === 0) return null;
    if (done < TAGS.length) return { ok: false, hint: `${TAGS.length - done} still to tag.` };
    return { ok: true };
  }

  resetChallenge() { super.resetChallenge?.(); this._at = 0; this._hits = {}; this._tags = {}; this._left = PINGS; this._say('Sail, then ping.'); this._paint(); }
}
