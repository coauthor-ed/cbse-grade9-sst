// TidalEnergyMapScene - electricity from the tide. Beat 0: a barrage in section: high water held behind a wall, a
// switch opens the gate, the water runs out through a turbine and the generator turns, then the levels meet. Beat 1:
// the map of India with the three sites, and the coastline figure. Nothing here claims a plant is running.
// India's border comes only from SimGeo.loadLayer('india') via drawIndia; the credit is on screen on the map beat.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, font, rr } from 'simulations/base/kit/SimLook.js';
import { loadMap, layerCache, makeView, drawIndia, CREDIT_INDIA } from 'simulations/base/kit/GeoMap.js';
import { canvasChips } from '../shared/SeaBits.js';
import { SEA_COLOR_MAP, seaColour, drawSeaColumn, drawStrata, drawCloud, drawWaveLine, drawSkyColumn } from '../shared/SeaArt.js';

// A wide stage: at 1280 the host card is wide and short, and a tall stage left a white column beside the figure.
const W = 580, H = 460;
const MAP_BOX = { x: 6, y: 6, w: 568, h: 376 };
const EXTENT = [[66, 5.5], [97, 37.5]];
const SITES = [
  { name: 'Gulf of Kutch', ll: [69.6, 22.6], dx: -96, dy: -30 },
  { name: 'Gulf of Khambhat', ll: [72.4, 21.3], dx: -112, dy: 34 },
  { name: 'Sundarbans', ll: [89.0, 21.7], dx: 74, dy: 34 },
];
const RUN = 3.6;

function mapCtx(ctx) {
  return new Proxy(ctx, { get: (t, k) => (k === 'getTransform' ? () => ({ a: 1, d: 1 }) : (typeof t[k] === 'function' ? t[k].bind(t) : t[k])) });
}

export class TidalEnergyMapScene extends SimScene {
  static WIDTH = W;
  static HEIGHT = H;
  static PORTRAIT_WIDTH = W;
  static PORTRAIT_HEIGHT = H;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
  static ARIA_LABEL = 'A barrage holds high water behind a wall. When the gate opens the water runs through a turbine that turns a generator. A map of India marks the Gulf of Kutch, the Gulf of Khambhat and the Sundarbans.';
  static CONTROLS = [];
  static DRAGGABLE = false;

  constructor(container, config) {
    super(container, config);
    this._to = 0; this._run = 0; this._pin = [];
  }

  async setup() {
    this.map = await loadMap(['india']);
    this.cache = layerCache();
    await super.setup();
    this.view = await makeView(mapCtx(this._ctx), { kind: 'mercator', extent: EXTENT, box: MAP_BOX });
    this._pin = SITES.map((s) => { const p = this.view.at(s.ll); return p ? { x: p[0], y: p[1] } : null; });
    this.ctl = canvasChips(this, 'Gate', [{ value: 'shut', label: 'Gate shut' }, { value: 'open', label: 'Gate open' }], (v) => { this._to = v === 'open' ? 1 : 0; if (!this._to) this._run = 0; this.animateFor(RUN * 1000 + 500); });
    this.ctl.set('shut'); this.ctl.show(this.stage === 0);
    this.animateFor(300);
  }

  destroy() { this.ctl?.destroy(); super.destroy(); }

  enter(stage) { this._to = 0; this._run = 0; this.ctl?.set('shut'); this.ctl?.show(stage === 0); }

  update(d) { if (this._to && this._run < RUN) this._run = Math.min(RUN, this._run + d); }

  busy() { return !!this._to && this._run < RUN; }

  draw(ctx, c) {
    ctx.save();
    rr(ctx, 4, 4, W - 8, H - 8, 18);
    ctx.clip();
    if (this.stage === 0) this._barrage(ctx, c); else this._mapBeat(ctx, c);
    ctx.restore();
  }

  _barrage(ctx, c) {
    const seaLow = 280, high = 186, u = this._run / RUN, basin = high + (seaLow - high) * (1 - (1 - u) ** 2), wx = 263, ww = 54, spin = this._run * 9;
    const ink = seaColour(c, 'ink');
    drawSkyColumn(ctx, c, 0, 0, W, 290, 0, 10);
    drawCloud(ctx, c, 100, 74, 0.7, { seed: 5 });
    // Sea on the left at low tide, basin on the right.
    drawSeaColumn(ctx, c, 0, seaLow, 1, { w: wx, h: H - seaLow, bands: 3, wave: 2 });
    drawSeaColumn(ctx, c, wx + ww, basin, 1, { w: W - wx - ww, h: H - basin, bands: 3, wave: 2 });
    drawWaveLine(ctx, c, 0, seaLow, 1, { w: wx, amp: 2 });
    drawWaveLine(ctx, c, wx + ww, basin, 1, { w: W - wx - ww, amp: 2 });
    drawStrata(ctx, c, 0, 400, 1, { w: W, h: 70, bands: 3, seed: 3 });
    // The wall and its tunnel.
    ctx.fillStyle = seaColour(c, 'metal');
    ctx.fillRect(wx, 130, ww, 280);
    ctx.fillStyle = seaColour(c, 'metalLit');
    ctx.fillRect(wx, 130, 14, 280);
    ctx.fillStyle = seaColour(c, 'metalDark');
    ctx.fillRect(wx - 24, 118, ww + 48, 14);
    const ty = 350, tun = 28;
    ctx.fillStyle = this._to && basin < seaLow - 1 ? seaColour(c, 'band2') : seaColour(c, 'band4');
    ctx.fillRect(wx - 2, ty - tun, ww + 4, tun * 2);
    // Turbine.
    ctx.save();
    ctx.translate(wx + ww / 2, ty);
    ctx.rotate(spin);
    ctx.fillStyle = seaColour(c, 'gold');
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.ellipse(0, -12, 6, 13, 0.3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); ctx.arc(wx + ww / 2, ty, 6, 0, Math.PI * 2); ctx.fillStyle = ink; ctx.fill();
    // Generator on top, with a shaft down to the turbine.
    ctx.fillStyle = ink;
    ctx.fillRect(wx + ww / 2 - 3, 132, 6, ty - 132);
    ctx.fillStyle = seaColour(c, 'red');
    rr(ctx, wx + ww / 2 - 40, 72, 80, 46, 8);
    ctx.fill();
    const lit = this._to && this._run < RUN - 0.1;
    ctx.fillStyle = lit ? seaColour(c, 'gold') : seaColour(c, 'metalDark');
    ctx.beginPath(); ctx.arc(wx + ww / 2, 95, 11, 0, Math.PI * 2); ctx.fill();
    if (this._to && basin < seaLow - 1) {
      ctx.strokeStyle = seaColour(c, 'cloud'); ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(wx + ww + 60, ty); ctx.lineTo(wx + ww + 14, ty); ctx.moveTo(wx - 10, ty); ctx.lineTo(wx - 60, ty); ctx.stroke();
      ctx.fillStyle = seaColour(c, 'cloud'); ctx.beginPath(); ctx.moveTo(wx - 60, ty - 13); ctx.lineTo(wx - 82, ty); ctx.lineTo(wx - 60, ty + 13); ctx.fill();
    }
    const tag = (t, x, y, o = {}) => pill(ctx, c, t, x, y, { size: 24, bg: seaColour(c, 'cloud'), ink, ...o });
    tag('Generator', wx + ww / 2, 44);
    tag('Barrage', wx - 70, 156);
    tag('Turbine', wx - 100, ty - 46);
    ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(wx - 50, ty - 30); ctx.lineTo(wx + ww / 2 - 12, ty - 6); ctx.stroke();
    tag('Sea at low tide', 118, seaLow - 34);
    tag(basin < seaLow - 2 ? 'High water held' : 'Levels equal', W - 120, Math.max(146, basin - 34));
  }

  _mapBeat(ctx, c) {
    const v = this.view;
    if (!v) return;
    const ink = seaColour(c, 'ink');
    this.cache(ctx, [c], (o) => {
      o.fillStyle = seaColour(c, 'seaMid');
      o.fillRect(0, 0, W, H);
      drawIndia(o, v, c, this.map.india, { fill: seaColour(c, 'sand'), stroke: ink, lineWidth: 2.4, credit: false });
    });
    SITES.forEach((s, i) => {
      const p = this._pin[i];
      if (!p) return;
      ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = seaColour(c, 'red'); ctx.fill();
      ctx.strokeStyle = ink; ctx.lineWidth = 3.5; ctx.stroke();
      pill(ctx, c, s.name, Math.max(106, Math.min(W - 96, p.x + s.dx)), p.y + s.dy, { size: 24, bg: seaColour(c, 'cloud'), ink });
    });
    ctx.fillStyle = c.bgSurface;
    rr(ctx, 4, 384, W - 8, 74, 12); ctx.fill();
    ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = font(c, 800, 25, true);
    ctx.fillText('India\u2019s coastline: 11,098.81 km', W / 2, 416);
    ctx.font = font(c, 600, 21);
    ctx.fillStyle = c.labelMuted;
    ctx.fillText(CREDIT_INDIA, W / 2, 445);
  }
}
