// IndiaPartyMapScene - L07 s05, the book's Let's Map task. India's border from the Survey of India layer
// (drawIndia prints the credit). Tap the map: the nearest State gets a pin, up to three. Beat 0 the three
// jobs; beat 1 the map to work on. The scene names States only: no party, symbol or agenda.
// State points are rough centres, for a pin only. Mounted once. Rivers off.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { loadMap, drawIndia, CREDIT_INDIA } from 'simulations/base/kit/GeoMap.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import { pill } from 'simulations/base/kit/SimLook.js';
import { tile, say, rr, mix, hi } from '../L06/PartyWorld.js';

const STATES = [
  ['Andhra Pradesh', 79.4, 15.8], ['Arunachal Pradesh', 94.5, 27.8], ['Assam', 92.5, 26.2], ['Bihar', 85.5, 25.4],
  ['Chhattisgarh', 82.2, 21.3], ['Goa', 74, 15.3], ['Gujarat', 71.5, 22.3], ['Haryana', 76.7, 29.4],
  ['Himachal Pradesh', 77.2, 31.8], ['Jharkhand', 85.3, 23.6], ['Karnataka', 76, 15], ['Kerala', 76.6, 10.3],
  ['Madhya Pradesh', 78.5, 23.5], ['Maharashtra', 75.5, 19.5], ['Manipur', 93.9, 24.7], ['Meghalaya', 91.2, 25.5],
  ['Mizoram', 92.9, 23.3], ['Nagaland', 94.5, 25.9], ['Odisha', 84.5, 20.5], ['Punjab', 75.3, 30.9],
  ['Rajasthan', 74, 27], ['Sikkim', 88.5, 27.5], ['Tamil Nadu', 78.5, 11], ['Telangana', 79, 18],
  ['Tripura', 91.6, 23.7], ['Uttar Pradesh', 80.9, 26.8], ['Uttarakhand', 78.7, 30.3], ['West Bengal', 87.6, 23.3],
];
const BOX = { x: 6, y: 6, w: 400, h: 444 };
const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const JOBS = ['A State party', 'Its symbol', 'One line of agenda'];

export class IndiaPartyMapScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS = [];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'An outline map of India from the Survey of India layer, with its credit. Tap the map to pin up to three States. The side card lists the three things to find for each State. The map names no party and shows no symbol.';

  async setup() {
    this.pins = []; this.view = null; this.map = null; this._found = false;
    try { this.map = await loadMap(['india']); } catch (err) { this.map = null; }
    await super.setup();
    if (this.map) {
      const d3 = await SimGeo.d3(), proj = d3.geoMercator();
      proj.fitExtent([[BOX.x + 6, BOX.y + 6], [BOX.x + BOX.w - 6, BOX.y + BOX.h - 42]], { type: 'MultiPoint', coordinates: [[68, 6.5], [97.5, 37.2], [68, 37.2], [97.5, 6.5]] });
      this.view = { proj, path: d3.geoPath(proj).context(this._ctx), box: BOX, at: (ll) => proj(ll) };
    }
    this.animateFor(400);
  }

  busy() { return this.age < 0.8; }
  pointerDown(p) {
    if (this.stage !== 1 || !this.view || p.x > BOX.x + BOX.w) return false;
    let best = null, bd = 1e9;
    for (const s of STATES) { const q = this.view.at([s[1], s[2]]); const d = Math.hypot(q[0] - p.x, q[1] - p.y); if (d < bd) { bd = d; best = s; } }
    if (!best || bd > 90) return false;
    const i = this.pins.indexOf(best[0]);
    if (i >= 0) this.pins.splice(i, 1);
    else if (this.pins.length < 3) this.pins.push(best[0]);
    else { this.pins.shift(); this.pins.push(best[0]); }
    if (this.pins.length === 3 && !this._found) {
      this._found = true;
      const q = this.view.at(STATES.find((s) => s[0] === best[0]).slice(1));
      this.celebrate(q[0], q[1], 24);
    }
    return true;
  }

  draw(ctx, c) {
    ctx.fillStyle = mix(c.water, c.bgSurface, 0.55); ctx.fillRect(0, 0, 680, 456);
    if (this.view && this.map?.india) {
      drawIndia(ctx, this.view, c, this.map.india, { fill: mix(c.gold, c.bgSurface, 0.62), stroke: c.label, lineWidth: 2, credit: false });
      this.pins.forEach((n, i) => {
        const s = STATES.find((x) => x[0] === n), q = this.view.at([s[1], s[2]]);
        ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(q[0], q[1], 15, 0, 7); ctx.fill();
        ctx.strokeStyle = c.bgSurface; ctx.lineWidth = 3; ctx.stroke();
        say(ctx, c, String(i + 1), q[0], q[1] + 1, { size: 22, col: c.bgSurface });
      });
    } else {
      pill(ctx, c, 'The map could not load', 206, 220, { size: 20, bg: c.bgSurface, ink: c.label });
    }
    pill(ctx, c, CREDIT_INDIA, 8, 439, { align: 'left', size: 25, bg: c.bgSurface, ink: c.label });
    const X = 416, W = 256;
    if (this.stage === 0) {
      tile(ctx, c, X, 24, W, 396, { fill: c.bgSurface });
      say(ctx, c, 'For each State', X + W / 2, 62, { size: 30 });
      JOBS.forEach((j, i) => {
        const y = 96 + i * 104;
        ctx.fillStyle = hi(c); rr(ctx, X + 12, y, W - 24, 92, 10); ctx.fill();
        const parts = j.length > 14 ? ['One line', 'of agenda'] : [j];
        parts.forEach((p, k) => say(ctx, c, p, X + W / 2, y + 46 + (k - (parts.length - 1) / 2) * 32, { size: 27 }));
      });
    } else {
      tile(ctx, c, X, 24, W, 396, { fill: c.bgSurface });
      say(ctx, c, 'Tap three States', X + W / 2, 62, { size: 29 });
      [0, 1, 2].forEach((i) => {
        const y = 96 + i * 104, n = this.pins[i];
        ctx.strokeStyle = n ? c.accent : c.stroke; ctx.lineWidth = 3; if (!n) ctx.setLineDash([8, 8]); rr(ctx, X + 12, y, W - 24, 92, 10); ctx.stroke(); ctx.setLineDash([]);
        const parts = n ? (n.includes(' ') ? n.split(' ') : [n]) : ['State ' + (i + 1)];
        parts.forEach((p, k) => say(ctx, c, p, X + W / 2, y + 46 + (k - (parts.length - 1) / 2) * 32, { size: 26, display: !!n, col: n ? c.label : c.labelMuted }));
      });
    }
  }
}
