// ExcavationLayersScene - L01 s02. A real trench wall: bands of soil, newest on top. Chips light a band.
// Beats dig and section show pictures (the scene mounts at trench) but still draw correctly.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { mix, darken, pill, outBack, clamp01 } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawBand, drawTool, drawBone } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_FINDS = 3, S_FOSSIL = 4;
const LX = 150, LW = 400, TOP = 96;
const LAYERS = [
  { id: 'top', kind: 'top', h: 44, name: 'today\u2019s soil' },
  { id: 'brick', kind: 'brick', h: 78, name: 'fallen mud brick' },
  { id: 'ash', kind: 'ash', h: 56, name: 'ash from hearths' },
  { id: 'silt', kind: 'silt', h: 70, name: 'flood silt' },
  { id: 'dust', kind: 'dust', h: 72, name: 'wind-blown dust' },
  { id: 'base', kind: 'base', h: 92, name: 'oldest layer' },
];
const yOf = {}; { let y = TOP; for (const b of LAYERS) { yOf[b.id] = y; y += b.h; } }
const CHIPS = [
  { id: 'brick', label: 'mud brick', targets: ['brick'], tone: 6 },
  { id: 'ash', label: 'ash', targets: ['ash'], tone: 1 },
  { id: 'silt', label: 'flood silt', targets: ['silt'], tone: 2 },
  { id: 'dust', label: 'dust', targets: ['dust'], tone: 3 },
];
// Finds, each lying in its own layer.
const FINDS = [
  { kind: 'pot', x: 240, y: yOf.brick + 44, layer: 'brick', name: 'pot sherd' },
  { kind: 'bone', x: 452, y: yOf.ash + 30, layer: 'ash', name: 'burnt bone' },
  { kind: 'flake', x: 300, y: yOf.silt + 38, layer: 'silt', name: 'stone flake' },
  { kind: 'handaxe', x: 410, y: yOf.dust + 38, layer: 'dust', name: 'handaxe' },
];

export class ExcavationLayersScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'The cut wall of a trench with six bands of soil, today at the top and the oldest at the bottom. Chips light the bands of mud brick, ash, flood silt and dust. Later beats place a find in each layer and then a fossil in the deepest band.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Find a band', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  isControlDisabled(id) { return id === 'lit' && this.tl.disabled(); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.animateFor?.(300); } }

  enter() { this.tl.set({ lit: null }); this.requestUiUpdate?.(); }
  busy() { return this.age < 2.2 && this.stage >= S_FINDS; }

  _wall(ctx, c) {
    // Grass and sky above, trench sides either side: the setting stays quiet.
    ctx.fillStyle = mix(c.skyDay ?? c.bgSurface, c.bgSurface, 0.5); ctx.fillRect(0, 0, 680, TOP - 10);
    ctx.fillStyle = mix(c.elevLow, c.bgSurface, 0.25); ctx.fillRect(0, TOP - 12, 680, 16);
    ctx.fillStyle = mix(c.strata2, c.bgDeep, 0.28); ctx.fillRect(0, TOP + 2, 680, 520);
    LAYERS.forEach((b) => {
      const off = this.tl.off(b.id) ? 0.62 : 0;
      drawBand(ctx, c, b.kind, LX, yOf[b.id], LW, b.h, { dim: off });
    });
    ctx.strokeStyle = darken(c.strata3, 0.5); ctx.lineWidth = 4; ctx.strokeRect(LX, TOP, LW, 412);
  }

  _time(ctx, c) {
    // Reading down the wall: a big arrow, newest to oldest.
    const x = 92, y0 = 136, y1 = 470;
    ctx.strokeStyle = c.label; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1 - 14); ctx.stroke();
    ctx.fillStyle = c.label; ctx.beginPath(); ctx.moveTo(x, y1 + 12); ctx.lineTo(x - 18, y1 - 16); ctx.lineTo(x + 18, y1 - 16); ctx.closePath(); ctx.fill();
    pill(ctx, c, 'newest', x, 120, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'oldest', x, 492, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
  }

  _find(ctx, c, f, k, dim) {
    ctx.save(); ctx.translate(f.x, f.y); ctx.scale(k, k);
    if (f.kind === 'pot') { ctx.beginPath(); ctx.arc(0, -6, 30, 0.2, 2.9); ctx.quadraticCurveTo(0, 10, 28, 0); ctx.closePath(); ctx.globalAlpha = dim; ctx.fillStyle = mix(c.strata3, c.strata1, 0.4); ctx.fill(); ctx.strokeStyle = darken(c.strata3, 0.5); ctx.lineWidth = 3; ctx.stroke(); }
    if (f.kind === 'bone') drawBone(ctx, c, 0, 0, 40, { rot: -0.3, dim });
    if (f.kind === 'flake') drawTool(ctx, c, 'flake', 0, 0, 32, { rot: 1, dim });
    if (f.kind === 'handaxe') drawTool(ctx, c, 'handaxe', 0, 0, 44, { rot: 0.6, dim });
    ctx.restore();
  }

  draw(ctx, c) {
    this._wall(ctx, c);
    this._time(ctx, c);
    const st = this.stage;
    if (st >= S_FINDS) {
      const dim = st === S_FOSSIL ? 0.34 : 1;
      FINDS.forEach((f, i) => {
        const k = st === S_FINDS ? outBack(clamp01((this.age - i * 0.22) / 0.4)) : 1;
        if (k <= 0) return;
        this._find(ctx, c, f, k, dim);
        if (st === S_FINDS && k > 0.2) pill(ctx, c, f.name, 606, f.y, { size: 25, bg: c.bgSurface, ink: c.label, display: true });
      });
    }
    if (st === S_FOSSIL) {
      const k = outBack(clamp01(this.age / 0.5)), y = yOf.base + 48;
      ctx.save(); ctx.translate(350, y); ctx.scale(k, k);
      drawBone(ctx, c, -58, -8, 44, { rot: 0.16, fossil: true });
      drawBone(ctx, c, 62, 6, 32, { rot: -0.34, fossil: true });
      ctx.restore();
      pill(ctx, c, 'fossil', 606, y, { size: 28, bg: c.gold, display: true });
    }
    const on = this.tl.chip();
    if (on) {
      const b = LAYERS.find((q) => q.id === on.id);
      ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.strokeRect(LX, yOf[b.id], LW, b.h);
      pill(ctx, c, b.name, LX + LW / 2, yOf[b.id] + b.h / 2, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    }
    // The person works the top of the trench, hands down on the wall.
    const fig = figureFor(this, { role: 'worker', pose: { name: 'push', crouch: 0.3 }, x: 126, y: TOP - 8, height: 84, facing: 1, i: 2, hands: [{ x: 152, y: TOP + 4 }, { x: 146, y: TOP + 4 }] });
    drawFigure(ctx, c, fig, fig.look);
  }
}
