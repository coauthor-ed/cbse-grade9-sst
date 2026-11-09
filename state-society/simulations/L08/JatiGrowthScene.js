// JatiGrowthScene - blk-l08-s04. Four varnas stay four; jatis grow. Buttons are the three causes the
// source names, then new groups and occupations. No count of jatis: the source gives none.
//   b0 tiles by cause   b1 endogamy: a group marrying within itself   b2 four and many
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, font, rr, mix } from 'simulations/base/kit/SimLook.js';
import { pal, panel, person } from '../shared/SstArt.js';

const CAUSE = [
  { id: 'inter', label: 'Intermarriage', tone: 's1' },
  { id: 'migr', label: 'Migrating communities', tone: 's3' },
  { id: 'terr', label: 'Territorial differences', tone: 's4' },
  { id: 'occ', label: 'New occupations', tone: 's6' },
];
const COLS = 6, ROWS = 4, MAXT = COLS * ROWS;
const one = (i) => [{ idx: i, dwellMs: null }];

export class JatiGrowthScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static VISUAL_PROFILE = 'rich';
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Four tall posts stay four, marked fixed. Beside them, small tiles for jatis pile up, one colour for each cause. On one beat a group of people stands inside a ring, marrying within itself.';
  static CONTROLS = CAUSE.map((k) => ({ type: 'button', id: k.id, label: k.label }));

  constructor(container, config) { super(container, config); this._tiles = []; this._used = new Set(); this._found = false; }

  isControlHidden(id) {
    if (this.stage === 1) return true;
    return this.stage === 0 ? id === 'occ' : id !== 'occ';
  }
  isControlDisabled() { return this._tiles.length >= MAXT; }

  enter(stage) {
    this._used = new Set(); this._found = false;
    this._tiles = stage === 2 ? Array.from({ length: 12 }, (_, i) => ({ k: i % 3, at: -9 })) : [];
    this.requestUiUpdate?.();
  }

  onControlChange(id) {
    if (!this._guard(id)) return;
    const k = CAUSE.findIndex((q) => q.id === id);
    for (let n = 0; n < 2 && this._tiles.length < MAXT; n++) this._tiles.push({ k, at: this.clock + n * 0.12 });
    this._used.add(id);
    this.animateFor(700);
    if (this.stage === 0 && this._used.size === 3 && !this._found) { this._found = true; this.celebrate(470, 240, 18); }
    this.requestUiUpdate?.();
  }

  draw(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 0, 680, 520);
    if (this.stage === 1) { this._ring(ctx, c, t); return; }
    panel(ctx, c, 14, 14, 232, 492, { fill: P.panel });
    for (let i = 0; i < 4; i++) { ctx.fillStyle = mix(c.gold, P.panel, 0.25); rr(ctx, 38 + i * 48, 120, 38, 280, 10); ctx.fill(); }
    ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = font(c, 700, 72, true); ctx.fillText('4', 130, 68);
    ctx.font = font(c, 700, 30, true); ctx.fillText('var\u1E47as', 130, 438);
    ctx.font = font(c, 700, 28); ctx.fillStyle = c.labelMuted; ctx.fillText('fixed', 130, 476);
    panel(ctx, c, 258, 14, 408, 492, { fill: P.panel });
    ctx.fillStyle = c.label; ctx.font = font(c, 700, 34, true); ctx.fillText('j\u0101tis', 462, 52);
    ctx.font = font(c, 700, 28); ctx.fillStyle = c.labelMuted; ctx.fillText('no restriction on number', 462, 90);
    const cw = 60, ch = 76;
    this._tiles.forEach((b, i) => {
      const u = Math.min(1, (t - b.at) / 0.34);
      if (u <= 0) return;
      const cx = 280 + (i % COLS) * cw + cw / 2 + 6, cy = 448 - Math.floor(i / COLS) * ch;
      const s = (1 - (1 - u) ** 3) * (1 + 0.15 * Math.sin(u * Math.PI));
      const col = c[CAUSE[b.k].tone];
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      ctx.fillStyle = mix(col, c.label, 0.3); rr(ctx, -24, -28, 48, 62, 12); ctx.fill();
      ctx.fillStyle = col; rr(ctx, -24, -30, 48, 58, 12); ctx.fill();
      ctx.restore();
    });
    if (!this._tiles.length) pill(ctx, c, 'Press a button', 462, 290, { bg: c.gold, ink: inkOn(c, c.gold), size: 30 });
  }

  _ring(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = P.grass; ctx.beginPath(); ctx.ellipse(340, 300, 300, 186, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.accent; ctx.lineWidth = 8; ctx.setLineDash([22, 14]); ctx.stroke(); ctx.setLineDash([]);
    [[170, 400], [250, 440], [340, 454], [430, 440], [510, 400]].forEach(([x, y], i) => person(ctx, this, { role: i === 2 ? 'elder' : 'adult', x, y, height: 216, i: i + 1, t, facing: x < 340 ? 1 : x > 340 ? -1 : 0 }));
    pill(ctx, c, 'endogamy', 340, 44, { bg: c.gold, ink: inkOn(c, c.gold), size: 36, display: true });
    pill(ctx, c, 'marriage within one group', 340, 492, { bg: c.bgSurface, ink: c.label, size: 28 });
  }
}
