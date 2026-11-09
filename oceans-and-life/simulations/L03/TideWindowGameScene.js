// TideWindowGameScene - blk-l03-s08. One port with a bar across its mouth. Four moon buttons set a spring or neap day
// and a slider sets the hour; the curve shows that day's tide. Water over the bar = 9 + A cos, A = 5 at spring
// (4 to 14 m), 2 at neap (7 to 11 m). Ships of 7.0, 9.5 and 12.0 m cross only where the water is deeper than their
// draught. The win exists: at full or new moon near high tide (06:00 or 18:30) water is above 12 m, and at neap it
// never is, so the biggest ship teaches the spring tide. A ship that cannot cross just waits, with the reason.
// Numbers are made up, and the board says so. Control names: [data-moon="new|first|full|third"], input[data-hour], [data-ship="0|1|2"].
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { svgSeaColumn, svgWaveLine, svgCargoShip, svgTrawler, svgCountryBoat, svgStrata, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { words, seaWhite, INK } from '../shared/SeaBits.js';
import { SEA_GAME_CSS, isPortrait } from '../shared/SeaGame.js';

const MOONS = [{ id: 'new', label: 'New moon', A: 5 }, { id: 'first', label: 'First quarter', A: 2 }, { id: 'full', label: 'Full moon', A: 5 }, { id: 'third', label: 'Third quarter', A: 2 }];
const SHIPS = [{ d: 7, draw: svgCountryBoat, s: 0.5, name: '7.0 m' }, { d: 9.5, draw: svgTrawler, s: 0.42, name: '9.5 m' }, { d: 12, draw: svgCargoShip, s: 0.34, name: '12.0 m' }];
const MEAN = 9, HIGH = 6.2, PERIOD = 12.42;
const depthAt = (A, h) => MEAN + A * Math.cos((h - HIGH) / PERIOD * Math.PI * 2);
const clock = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;

const CSS = SEA_GAME_CSS + `
.tw .moons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.tw .ships { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.tw .ships .btn[data-in="1"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 22%, var(--sim-bg-surface)); }
.tw .hr { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 15px; }
.tw .hr input { flex: 1 1 auto; min-width: 0; height: 44px; margin: 0; accent-color: var(--sim-accent); touch-action: pan-y; }
.tw .hr output { font: 600 19px/1 var(--sim-font-display); min-width: 3em; text-align: right; }
.tw .lbl { font-size: 15px; font-weight: 800; margin: 0; }
`;

export class TideWindowGameScene extends GameBoard {
  static ARIA_LABEL = 'A game. Three ships wait outside a port with a shallow bar. Choose a moon and an hour to set the tide. Each ship can cross only when the water over the bar is deeper than its draught.';
  static OBJECTIVE = { prompt: { en: 'Bring all three ships over the bar.' } };

  constructor(container, config) {
    super(container, config);
    this._moon = 1; this._h = 0; this._in = [false, false, false]; this._msg = 'Pick a moon, then move the hour.'; this._tone = '';
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false, css: CSS, onResize: () => this._pic(),
      html: `<div class="gm tw"><div class="gm-head"><p class="kicker">Numbers made up</p><h2>Bring three ships in</h2></div>
        <div class="sg-board"><div data-pic></div><div class="sg-side">
        <div class="moons">${MOONS.map((m) => `<button class="btn tap" data-moon="${m.id}">${m.label}</button>`).join('')}</div>
        <label class="hr"><span>Hour</span><input type="range" data-hour min="0" max="24" step="0.5" value="0" aria-label="Hour of the day"><output data-out></output></label>
        <p class="lbl">Send a ship with this draught</p>
        <div class="ships">${SHIPS.map((s, i) => `<button class="btn tap" data-ship="${i}">${s.name}</button>`).join('')}</div>
        <p class="sg-msg" data-msg aria-live="polite"></p></div></div></div>`,
    });
    this.root.querySelectorAll('[data-moon]').forEach((b) => onTap(b, () => { this._moon = MOONS.findIndex((m) => m.id === b.dataset.moon); this._paint(); }));
    this.root.querySelector('[data-hour]')?.addEventListener('input', (e) => { this._h = Number(e.target.value); this._paint(); });
    this.root.querySelectorAll('[data-ship]').forEach((b) => onTap(b, () => this._send(Number(b.dataset.ship))));
    this._paint();
  }

  _depth() { return depthAt(MOONS[this._moon].A, this._h); }

  _send(i) {
    if (this._in[i]) return;
    const w = this._depth(), d = SHIPS[i].d;
    if (w > d) {
      this._in[i] = true; this._msg = `The ${SHIPS[i].name} ship is in. The water was ${w.toFixed(1)} m.`; this._tone = 'good';
      if (this._in.every(Boolean)) { this._msg = 'All three are in. The biggest needed a spring tide near high water.'; this._paint(); this.quill?.perform?.('hop'); finishGame(this); return; }
    } else { this._msg = `The water is ${w.toFixed(1)} m. This ship needs more than ${d.toFixed(1)} m, so it waits.`; this._tone = 'bad'; }
    this._paint();
  }

  _pic() {
    const host = this.root?.querySelector?.('[data-pic]');
    if (!host) return;
    const P = isPortrait(this), W = P ? 312 : 690, H = P ? 270 : 296, top = H * 0.6, A = MOONS[this._moon].A, w = this._depth();
    const barY = top - 12, k = (P ? 9 : 10), seaY = barY - w * k;
    let s = `<defs>${svgSkyGradient('tw-sky', 0, 10)}</defs><rect width="${W}" height="${top}" style="fill:url(#tw-sky)"/>${svgSeaColumn(0, seaY, 1, { w: W, h: top - seaY, bands: 3, wave: 1.6 })}`;
    const bar = [[0, top + 2], [W * 0.48, top + 2], [W * 0.56, barY], [W * 0.66, barY], [W * 0.74, top + 2], [W, top + 2]];
    s += `<clipPath id="tw-b"><path d="${line(bar)}Z"/></clipPath><g clip-path="url(#tw-b)">${svgStrata(0, barY - 4, 1, { w: W, h: 22, bands: 2, seed: 4 })}</g>`;
    s += svgWaveLine(0, seaY, 1, { w: W, amp: 1.6 });
    SHIPS.forEach((q, i) => { const x = this._in[i] ? W * (0.8 + i * 0.07) : W * (0.09 + i * 0.15), o = q.s * (P ? 0.76 : 1); s += q.draw(x, seaY + 2, this._in[i] ? o * 0.7 : o); });
    const rx = W * 0.61;
    s += `<path d="M${rx} ${seaY}V${barY}M${rx - 7} ${seaY}h14M${rx - 7} ${barY}h14" ${stroke(sc('sunCore'), 4)}/>`;
    s += seaWhite(rx, Math.max(seaY + 18, Math.min(barY - 8, (seaY + barY) / 2 + 5)), `${w.toFixed(1)} m`, { size: 17, display: true });
    // The day's tide.
    const y0 = top + 2, ch = H - y0, xOf = (t) => 14 + t / 24 * (W - 28), yOf = (d) => y0 + ch - 20 - (d - 3) / 12 * (ch - 30), pts = [];
    s += `<rect x="0" y="${y0}" width="${W}" height="${ch}" ${fill(sc('cloud'))}/>`;
    for (let t = 0; t <= 24.01; t += 0.5) pts.push([xOf(t), yOf(depthAt(A, t))]);
    s += `<path d="M14 ${yOf(12)}H${W - 14}" ${stroke(sc('red'), 2.5, 'stroke-dasharray:7 6')}/>` + words(W - 16, yOf(12) - 4, '12 m', { size: 15, ink: INK, anchor: 'end' });
    s += `<path d="${line(pts)}" ${stroke(sc('band3'), 5)}/><circle cx="${xOf(this._h)}" cy="${yOf(w)}" r="9" ${fill(sc('sunCore'), `stroke:${INK};stroke-width:3`)}/>`;
    for (const t of [0, 6, 12, 18, 24]) s += words(Math.max(18, Math.min(W - 20, xOf(t))), H - 5, `${t} h`, { size: 15, ink: INK });
    host.innerHTML = `<svg class="sea-pic" viewBox="0 0 ${W} ${H}" role="img" aria-label="The water over the bar, and the tide through the day">${s}</svg>`;
  }

  _paint() {
    const r = this.root;
    if (!r?.querySelector?.('[data-pic]')) return;
    this._pic();
    r.querySelectorAll('[data-moon]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.moon === MOONS[this._moon].id)));
    r.querySelector('[data-out]').textContent = clock(this._h === 24 ? 23.5 : this._h);
    r.querySelectorAll('[data-ship]').forEach((b, i) => { b.dataset.in = this._in[i] ? '1' : '0'; });
    const m = r.querySelector('[data-msg]'); m.textContent = this._msg; m.dataset.tone = this._tone;
  }

  checkObjective() {
    const n = this._in.filter(Boolean).length;
    if (!n) return null;
    return n === 3 ? { ok: true } : { ok: false, hint: `${3 - n} still outside.` };
  }

  resetChallenge() { super.resetChallenge?.(); this._in = [false, false, false]; this._h = 0; this._moon = 1; this._msg = ''; this._tone = ''; this._paint(); }
}
