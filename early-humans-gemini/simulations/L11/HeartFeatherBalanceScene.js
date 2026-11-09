// HeartFeatherBalanceScene - blk-l11-s03, mounts at beat 3 of 5 (earlier beats show drawings). A big balance, a heart on one
// pan and the feather of truth on the other. Two named cases: a heart heavy with wrongdoing sinks, a heart in balance passes.
// Beat 3 opens on the heavy heart, beat 4 on the balanced one. Controls are outside (canvas).
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, lighten, mix, pill } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { balanceTilt, drawBalance } from 'simulations/base/kit/SimBalance.js';

const W = 680, H = 520, FLOOR = 462;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const CASES = {
  heavy: { label: 'Heavy with wrongdoing', w: 12, say: 'The heart sinks', sub: 'Egyptians believed: the beast waits', r: 66 },
  even: { label: 'In balance', w: 6, say: 'The heart balances', sub: 'Egyptians believed: the person passes on', r: 50 },
};
const tiltFor = (k) => balanceTilt(CASES[k].w, 6, { max: 0.26, scale: 3 });

export class HeartFeatherBalanceScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A large balance with a heart on one pan and a feather on the other. A heart heavy with wrongdoing sinks. A heart in balance passes. This is what Egyptians believed.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'h', label: 'Try a heart', options: Object.entries(CASES).map(([value, k]) => ({ value, label: k.label })) }];

  _case = 'heavy';
  _tilt = 0;
  _found = false;

  getControlValue(id) { return id === 'h' ? this._case : undefined; }
  onControlChange(id, v) {
    if (id !== 'h' || !CASES[v]) return;
    this._case = v;
    if (v === 'even' && !this._found && (this.stage ?? 0) === 3) { this._found = true; this.after(0.8, () => this.celebrate(340, 200, 14)); }
    this.animateFor(1100);
  }

  enter(s) {
    this._case = s >= 4 ? 'even' : 'heavy';
    this._tilt = tiltFor(this._case);
  }

  update(d) {
    const want = tiltFor(this._case);
    this._tilt += (want - this._tilt) * clamp(d * 6, 0, 1);
    if (Math.abs(want - this._tilt) < 0.002) this._tilt = want;
  }

  busy() { return Math.abs(tiltFor(this._case) - this._tilt) > 0.002; }

  _heart(ctx, x, y, r, c) {
    const shape = (dy) => { ctx.beginPath(); ctx.moveTo(x, y + r * 0.9 + dy); ctx.bezierCurveTo(x - r * 1.5, y + dy, x - r * 0.9, y - r + dy, x, y - r * 0.32 + dy); ctx.bezierCurveTo(x + r * 0.9, y - r + dy, x + r * 1.5, y + dy, x, y + r * 0.9 + dy); ctx.closePath(); };
    shape(5); ctx.fillStyle = darken(c.bad, 0.35); ctx.fill();
    shape(0); ctx.fillStyle = c.bad; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - r * 0.42, y - r * 0.24, r * 0.2, r * 0.12, -0.6, 0, Math.PI * 2); ctx.fillStyle = lighten(c.bad, 0.45); ctx.fill();
  }

  _feather(ctx, x, y, s, c) {
    const col = mix(c.bgSurface, c.s1, 0.2), rim = c.label;
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.22);
    ctx.beginPath(); ctx.moveTo(0, s * 0.62); ctx.bezierCurveTo(-s * 0.46, s * 0.1, -s * 0.34, -s * 0.5, 0, -s * 0.72); ctx.bezierCurveTo(s * 0.34, -s * 0.5, s * 0.46, s * 0.1, 0, s * 0.62); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = rim; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, s * 0.86); ctx.lineTo(0, -s * 0.62); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
    for (let i = 0; i < 4; i++) { const yy = s * 0.34 - i * s * 0.26; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(-s * 0.24, yy - s * 0.12); ctx.moveTo(0, yy); ctx.lineTo(s * 0.24, yy - s * 0.12); ctx.lineWidth = 2.5; ctx.stroke(); }
    ctx.restore();
  }

  draw(ctx, c) {
    const k = CASES[this._case];
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.82); ctx.fillRect(0, 0, W, H);
    for (const x of [60, 620]) { ctx.fillStyle = mix(c.gold, c.bgSurface, 0.6); ctx.fillRect(x - 28, 0, 56, FLOOR); ctx.fillStyle = mix(c.gold, c.bgSurface, 0.45); ctx.fillRect(x + 12, 0, 16, FLOOR); }
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.4); ctx.fillRect(0, FLOOR, W, H - FLOOR); ctx.fillStyle = darken(c.gold, 0.2); ctx.fillRect(0, FLOOR - 2, W, 4);
    const pans = drawBalance(ctx, c, { x: 340, y: 150, w: 400, tilt: this._tilt, standH: FLOOR - 150, left: [], right: [], tone: c.gold });
    this._heart(ctx, pans.left.x, pans.left.y - k.r * 0.86, k.r, c);
    this._feather(ctx, pans.right.x, pans.right.y - 62, 66, c);
    pill(ctx, c, k.say, 340, 48, { size: 36, bg: this._case === 'even' ? c.good : c.bad, display: true });
    pill(ctx, c, k.sub, 340, 492, { size: 26, bg: c.bgSurface, ink: c.label, display: false });
  }
}
