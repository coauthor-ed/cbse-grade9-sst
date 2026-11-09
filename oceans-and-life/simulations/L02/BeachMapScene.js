// BeachMapScene - waves also build. Beat 0: a shore in section, a wave slows and drops its sand, and the pile is a
// beach. Beat 1: five famous beaches on the map of India; a tap picks a pin, and a line at the foot gives the beach,
// the place and the sea. Big design so the pins are at least 44 px on a phone.
// India's border comes only from SimGeo.loadLayer('india') via drawIndia; the credit is always on screen.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, pill, font, rr } from 'simulations/base/kit/SimLook.js';
import { loadMap, layerCache, makeView, drawIndia, CREDIT_INDIA } from 'simulations/base/kit/GeoMap.js';
import { SEA_COLOR_MAP, seaColour, drawSeaColumn, drawWaveLine, drawSkyColumn, drawCloud, drawPalm } from '../shared/SeaArt.js';

const W = 460, H = 580;
const MAP_BOX = { x: 6, y: 6, w: 448, h: 484 };
const EXTENT = [[67, 5.5], [97, 37.5]];
const R = 12, TAP = 30;
const BEACHES = [
  { name: 'Marina', where: 'Chennai', sea: 'Bay of Bengal', lon: 80.27, lat: 13.05, dx: 58, dy: 2 },
  { name: 'Puri', where: 'Odisha', sea: 'Bay of Bengal', lon: 85.81, lat: 19.81, dx: 44, dy: 10 },
  { name: 'Kovalam', where: 'Keralam', sea: 'Arabian Sea', lon: 76.92, lat: 8.09, dx: -62, dy: 0 },
  { name: 'Juhu', where: 'Mumbai', sea: 'Arabian Sea', lon: 72.83, lat: 19.12, dx: -46, dy: 0 },
  { name: 'Radhanagar', where: 'Swaraj Dweep, Andaman Islands', sea: 'Andaman Sea', lon: 92.98, lat: 11.98, dx: -6, dy: 34 },
];

function mapCtx(ctx) {
  return new Proxy(ctx, { get: (t, k) => (k === 'getTransform' ? () => ({ a: 1, d: 1 }) : (typeof t[k] === 'function' ? t[k].bind(t) : t[k])) });
}

export class BeachMapScene extends SimScene {
  static WIDTH = W;
  static HEIGHT = H;
  static PORTRAIT_WIDTH = W;
  static PORTRAIT_HEIGHT = H;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A map of India with five pins on the coast. Tapping a pin names the beach, its place and the sea it faces: Marina, Puri, Kovalam, Juhu and Radhanagar.';
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
  static CONTROLS = [];
  static CONTROLS_IN_SIGHT = true;
  static DRAGGABLE = false;

  constructor(container, config) {
    super(container, config);
    this._open = -1;
    this._pin = [];
  }

  async setup() {
    this.map = await loadMap(['india']);
    this.cache = layerCache();
    await super.setup();
    this.view = await makeView(mapCtx(this._ctx), { kind: 'mercator', extent: EXTENT, box: MAP_BOX });
    this._pin = BEACHES.map((b) => { const p = this.view.at([b.lon, b.lat]); return p ? { x: p[0], y: p[1] } : null; });
    this.animateFor(300);
  }

  enter() { this._open = -1; }

  busy() { return false; }

  draw(ctx, c) {
    if (this.stage === 0) { this._shore(ctx, c); return; }
    const v = this.view;
    if (!v) return;
    ctx.save();
    rr(ctx, 4, 4, W - 8, H - 8, 18);
    ctx.clip();
    this.cache(ctx, [c], (o) => {
      o.fillStyle = seaColour(c, 'seaMid');
      o.fillRect(0, 0, W, H);
      drawIndia(o, v, c, this.map.india, { fill: seaColour(c, 'sand'), stroke: seaColour(c, 'ink'), lineWidth: 2.4, credit: false });
    });
    ctx.restore();
    BEACHES.forEach((b, i) => {
      const p = this._pin[i];
      if (!p) return;
      const on = this._open === i;
      ctx.beginPath();
      ctx.arc(p.x, p.y, on ? R + 4 : R, 0, Math.PI * 2);
      ctx.fillStyle = on ? seaColour(c, 'red') : seaColour(c, 'cloud');
      ctx.fill();
      ctx.strokeStyle = seaColour(c, 'ink');
      ctx.lineWidth = 3.5;
      ctx.stroke();
      pill(ctx, c, b.name, p.x + b.dx, p.y + b.dy, { size: 18, bg: seaColour(c, 'cloud'), ink: seaColour(c, 'ink') });
    });
    // The foot strip: what the tap found, on the same line as the credit.
    const col = mix(c.bgSurface, c.bgDeep, 0.2);
    ctx.fillStyle = col;
    rr(ctx, 4, 494, W - 8, 82, 16);
    ctx.fill();
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const o = BEACHES[this._open];
    ctx.font = font(c, 800, o ? 22 : 18, true);
    ctx.fillText(o ? o.name : 'Tap a pin', W / 2, 524);
    ctx.font = font(c, 600, 17);
    ctx.fillText(o ? `${o.where}, ${o.sea}` : 'Five famous beaches', W / 2, 548);
    ctx.font = font(c, 600, 18);
    ctx.fillStyle = c.labelMuted;
    ctx.fillText(CREDIT_INDIA, W / 2, 570);
  }

  _shore(ctx, c) {
    const ink = seaColour(c, 'ink'), seaY = 300, sand = (x) => 500 - (x / W) * 260;
    drawSkyColumn(ctx, c, 0, 0, W, seaY + 6, 0, 10);
    drawCloud(ctx, c, 130, 90, 0.8, { seed: 6 });
    drawSeaColumn(ctx, c, 0, seaY, 1, { w: W, h: H - seaY, bands: 3, wave: 2 });
    drawWaveLine(ctx, c, 0, seaY, 1, { w: W * 0.8, amp: 3 });
    ctx.fillStyle = seaColour(c, 'sandDark');
    ctx.fillRect(0, 520, W, 70);
    ctx.fillStyle = seaColour(c, 'sand');
    ctx.beginPath(); ctx.moveTo(0, sand(0) + 34); ctx.lineTo(W, sand(W)); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    drawPalm(ctx, c, W - 40, sand(W - 40) + 2, 1, { lean: -12 });
    // Grains falling out of the slowing water.
    ctx.fillStyle = seaColour(c, 'sandDark');
    for (let i = 0; i < 26; i++) { const x = 70 + (i * 37) % 240, y = 340 + (i * 53) % Math.max(20, sand(x) + 20 - 346); ctx.beginPath(); ctx.arc(x, y, 3 + (i % 3), 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = seaColour(c, 'cloud'); ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(40, 322); ctx.lineTo(150, 322); ctx.moveTo(170, 322); ctx.lineTo(214, 322); ctx.stroke();
    const tag = (t, x, y) => pill(ctx, c, t, x, y, { size: 21, bg: seaColour(c, 'cloud'), ink });
    tag('Wave slows down', 126, 270);
    tag('Sand and pebbles drop', 190, 548);
    tag('Beach', W - 130, sand(W - 130) - 26);
  }

  pointerDown(p) {
    if (this.stage === 0) return;
    let best = -1, d = TAP;
    this._pin.forEach((q, i) => { if (q) { const k = Math.hypot(p.x - q.x, p.y - q.y); if (k < d) { d = k; best = i; } } });
    if (best >= 0) { this._open = best; this.animateFor?.(120); }
  }
}
