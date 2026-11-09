// ReservationBarScene - blk-l06-s10. Beat 0: a Panchayat of 20 seats. A slider sets the seats reserved
// for women; a line marks one-third, 6.67 seats, so 6 falls short and 7 meets it. q-l06-s11 uses 25
// seats, so this does not give its answer. Beat 1: Panchayat or Municipality, each with its Article,
// its count of States and Union Territories, half the seats lit.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { day, tile, say, folk, tag, rr, mix, darken } from './CivicWorld.js';

const CHIPS = [
  { id: 'panchayat', label: 'Panchayat', targets: ['panchayat'] },
  { id: 'municipality', label: 'Municipality', targets: ['municipality'] },
];
const INFO = {
  panchayat: { art: 'Article 243(d)', count: '21 States, 2 Union Territories', note: 'at 50% in their own Acts' },
  municipality: { art: 'Article 243(t)', count: '17 States, 1 Union Territory', note: 'at 50%, as of 2023' },
};
const S_THIRD = 0, S_STATES = 1;
const MAP = [S_THIRD, S_STATES].map((idx) => [{ idx, dwellMs: null }]);
const N = 20, X0 = 34, CW = 61.2, Y0 = 148, CH = 70;
const seatBox = (i) => ({ x: X0 + (i % 10) * CW, y: Y0 + Math.floor(i / 10) * (CH + 12) });

export class ReservationBarScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Twenty seats of a Panchayat in two rows. A slider sets how many are reserved for women, and the reading says whether that is less than one-third, not less than one-third, or half. Then chips for Panchayat and Municipality show the Article and the States and Union Territories at 50%.';
  static CONTROLS = [
    { type: 'slider', id: 'seats', label: 'Seats reserved for women', min: 0, max: 20, step: 1, value: 4 },
    tapLightControl({ id: 'lit', label: 'Body', chips: CHIPS, noneLabel: 'Both' }),
  ];

  tl = tapLight({ chips: CHIPS });
  constructor(container, config) { super(container, config); this._n = 4; this._found = false; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : id === 'seats' ? String(this._n) : undefined; }
  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'lit') this.tl.fromControl(v);
    else {
      this._n = Number(v);
      if (this._n >= 7 && !this._found) { this._found = true; this.celebrate(340, 60, 14); }
    }
    this.requestUiUpdate?.();
  }
  isControlHidden(id) { return id === 'seats' ? this.stage !== S_THIRD : this.stage !== S_STATES; }
  enter(stage) { this._n = stage === S_STATES ? 10 : 4; this._found = false; this.tl.set({ lit: stage === S_STATES ? 'panchayat' : null }); }
  busy() { return this.age < 0.9; }

  _seats(ctx, c, n) {
    for (let i = 0; i < N; i++) {
      const b = seatBox(i), on = i < n, f = on ? c.s5 : mix(c.waste, c.bgSurface, 0.3);
      ctx.fillStyle = darken(f, 0.25); rr(ctx, b.x + 4, b.y + 6, CW - 12, CH - 8, 10); ctx.fill();
      ctx.fillStyle = f; rr(ctx, b.x + 4, b.y, CW - 12, CH - 12, 10); ctx.fill();
    }
  }

  draw(ctx, c) {
    day(ctx, c, 680, 520, { ground: 318, hills: false, sun: false });
    const n = this._n;
    if (this.stage === S_THIRD) {
      const ok = n >= 7, half = n >= 10;
      tile(ctx, c, 16, 8, 648, 124, { fill: c.bgSurface, lit: ok, litCol: c.good });
      say(ctx, c, n + ' of ' + N + ' seats', 340, 48, { size: 44 });
      say(ctx, c, half ? (n === 10 ? 'Half the seats: 50%' : 'More than half') : ok ? 'Not less than one-third' : 'Less than one-third', 340, 104, { size: 30, display: false });
      this._seats(ctx, c, n);
      // one-third of 20 is 6.67 seats: the line falls inside the seventh seat
      const lx = X0 + (20 / 3) * CW;
      ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(lx, Y0 - 12); ctx.lineTo(lx, Y0 + CH + 2); ctx.stroke(); ctx.setLineDash([]);
      say(ctx, c, 'one-third of 20 is about 6.67', 340, 346, { size: 30 });
      say(ctx, c, 'A seat cannot be divided.', 340, 392, { size: 30, display: false });
    } else {
      const id = this.tl.chip()?.id, d = INFO[id] ?? { art: 'Articles 243(d) and 243(t)', count: 'Not less than one-third in each', note: 'Many States go to 50%' };
      tile(ctx, c, 16, 8, 648, 128, { fill: c.bgSurface });
      say(ctx, c, d.art, 340, 40, { size: 34 });
      say(ctx, c, d.count, 340, 82, { size: 29 });
      say(ctx, c, d.note, 340, 114, { size: 28, display: false });
      this._seats(ctx, c, 10);
      tag(ctx, c, '10 of 20 seats: 50%', 340, 330, { bg: c.s5, size: 28 });
      ['adult', 'adult', 'elder', 'adult', 'adult'].forEach((role, i) => folk(ctx, this, { role, x: 90 + i * 125, y: 450, height: 90, facing: 0, i: [1, 3, 5, 9, 11][i], look: { outfit: 'kurti', hairStyle: 'braid', dupatta: true, moustache: false, bottom: 'cream' } }));
    }
  }
}
