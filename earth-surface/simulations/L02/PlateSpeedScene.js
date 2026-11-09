// PlateSpeedScene - how far a plate moves at 5 cm a year. Three tap stops: 1 year, 100 years, 1 crore
// years. The ruler changes scale at each stop and says so. Every reading is years x 5 cm, worked live.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, font, outBack, clamp01, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawEarthSky, drawGrass, drawFlowArrow, drawTree, roughen } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const STOPS = {
  y1: { years: 1, text: '5 cm', sub: 'about a fingernail growing', ruler: 10, unit: 'cm' },
  y100: { years: 100, text: '5 m', sub: 'about the length of a car', ruler: 10, unit: 'm' },
  c1: { years: 1e7, text: '500 km', sub: 'at 5 cm a year', ruler: 1000, unit: 'km' },
  c2: { years: 2e7, text: '1000 km', sub: 'at 5 cm a year', ruler: 1000, unit: 'km' },
};
const metres = (y) => y * 0.05;
const X0 = 70, X1 = 610;

export class PlateSpeedScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A slab of rock on a ruler. At 5 cm a year it moves 5 cm in 1 year, 5 m in 100 years, 500 km in 1 crore years and 1000 km in 2 crore years.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'stop', label: 'Time', value: 'y1', options: [
    { value: 'y1', label: '1 year' }, { value: 'y100', label: '100 years' }, { value: 'c1', label: '1 crore years' },
  ] }];

  constructor(container, config) { super(container, config); this._stop = 'y1'; this._b = 0; this._t = 0; this._found = false; }
  enter(stage) {
    this._b = stage;
    this._stop = stage === 0 ? 'y1' : stage === 1 ? 'y100' : 'c2';
    this._t = 0;
    this.requestUiUpdate?.();
  }
  isControlHidden(id) { return id === 'stop' && this._b === 2; }
  getControlValue(id) { return id === 'stop' ? this._stop : super.getControlValue(id); }
  onControlChange(id, v) {
    if (id !== 'stop') return;
    this._stop = String(v); this._t = 0;
    if (this._stop === 'c1' && !this._found) { this._found = true; this.after(0.8, () => this.celebrate(340, 200, 12, { key: 'far' })); }
    this.animateFor?.(1000); this.requestUiUpdate?.();
  }
  update(d) { if (this._t < 1) this._t = Math.min(1, this._t + d / 0.8); }
  busy() { return this._t < 1; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const st = STOPS[this._stop], ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow');
    const scaleM = st.unit === 'cm' ? 0.1 : st.unit === 'm' ? 10 : 1e6;   // metres across the ruler
    const u = clamp01(metres(st.years) / scaleM) * outBack(this._t);
    const x = X0 + (X1 - X0) * u;
    drawEarthSky(ctx, c, 0, 0, 680, 346);
    // ruler
    ctx.save();
    ctx.fillStyle = earthColour(c, 'snow'); ctx.strokeStyle = ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(X0 - 22, 196, X1 - X0 + 44, 74, 12); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3;
    for (let i = 0; i <= 10; i++) {
      const tx = X0 + (X1 - X0) * i / 10;
      ctx.beginPath(); ctx.moveTo(tx, 196); ctx.lineTo(tx, i % 5 ? 214 : 228); ctx.stroke();
    }
    ctx.fillStyle = ink; ctx.font = font(c, 700, 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('0', X0, 250);
    ctx.fillText(`${st.ruler / 2} ${st.unit}`, (X0 + X1) / 2, 250);
    ctx.textAlign = 'right'; ctx.fillText(`${st.ruler} ${st.unit}`, X1 + 12, 250);
    ctx.restore();
    // the ground and the moving slab
    drawRock(ctx, c, [[-10, 330], [690, 330], [690, 530], [-10, 530]], { seed: 6, bands: ['strata3', 'strata2', 'strata5'], bandH: 40, cracks: 8, grain: false, lit: false });
    drawRock(ctx, c, roughen([[-160, 300], [x, 288], [x + 4, 350], [-160, 350]], { amp: 2, seed: 5, step: 40 }), { seed: 4, bands: ['strata1', 'strata2'], bandH: 18, cracks: 4, grain: false });
    drawGrass(ctx, c, -20, 296, x - 4, 288, { seed: 2, n: 30 });
    if (x > 190) drawTree(ctx, c, x - 190, 292, 0.8, { kind: 'round', seed: 5 });
    drawFlowArrow(ctx, c, x + 14, 318, x + 74, 318, { col: c.warning, w: 12 });
    pill(ctx, c, this._t > 0.98 ? st.text : '...', 340, 66, { bg: ink, ink: snow, size: 54, display: true });
    pill(ctx, c, this._stop === 'c2' ? 'in 2 crore years' : st.sub, 340, 138, { bg: snow, ink, size: 27, display: true });
    pill(ctx, c, 'The ruler changes with each stop', 340, 442, { bg: snow, ink, size: 25 });
  }
}
