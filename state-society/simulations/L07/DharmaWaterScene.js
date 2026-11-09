// DharmaWaterScene - the word dharma, from iron and wood to duties by role.
// Mounts by beat count: 3 = blk-l07-s01, 0 = s02 setup, 5 = blk-l07-s03, 2 = blk-l07-s06.
// A stepped stone tank in a courtyard, cut open: iron sinks, wood floats. Nothing floats that should sink.
//   stages: 0 tank, nothing dropped   1 drop them (learner)   2 both done   3 setup, both settled
//           4 root card   5 law of a thing   6 roles (tap)   7 satya and rita   8 samatva
//           9 one word, three roles   10 who holds which role
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, font, mix, alpha, rr, lighten, darken } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { reducedMotion } from 'simulations/base/kit/SimAnim.js';
import { pal, panel, person, tree, crown } from '../shared/SstArt.js';

const ROLES = [
  { id: 'student', label: 'Student', duty: 'duties to parents and teachers', role: 'student', i: 3 },
  { id: 'ruler', label: 'Ruler', duty: 'protect the people, give justice', role: 'elder', i: 2 },
  { id: 'candidate', label: 'Candidate', duty: 'honest earnings, a pure mind', role: 'adult', i: 4 },
];
const CHIPS = ROLES.map((r) => ({ id: r.id, label: r.label, targets: [r.id] }));
const MAN = { hairStyle: 'short', dupatta: false };
const RIM_Y = 170, WATER_Y = 214, FLOOR_Y = 432;       // in the tank
const IRON_X = 230, WOOD_X = 450, HELD_Y = 112, BEAM_Y = 36, POST_X = 118;
const HAND = { x: 92, y: 48 };
const BASIN = [[62, RIM_Y], [618, RIM_Y], [618, 232], [590, 232], [590, 310], [562, 310], [562, 388], [534, 388], [534, 464], [146, 464], [146, 388], [118, 388], [118, 310], [90, 310], [90, 232], [62, 232]];
const SINK_S = 1.5, FLOAT_S = 1.3;
const one = (i) => [{ idx: i, dwellMs: null }];
const outBounce = (u) => { const k = Math.min(1, u); return 1 - (1 - k) ** 3 + 0.08 * Math.sin(k * 9) * (1 - k); };

export class DharmaWaterScene extends SimScene {
  static BEAT_STEP_MAP = [one(3)];   // the host sends a huge beat count on a predict setup: this map holds it
  static BEAT_MAPS = {
    3: [one(0), one(1), one(2)], 0: [one(3)],
    5: [one(4), one(5), one(6), one(7), one(8)], 2: [one(9), one(10)],
  };
  static VISUAL_PROFILE = 'rich';
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A stepped stone tank in a courtyard, cut open to show the water. A man on the rim holds an iron block and a wooden block on ropes. Let go, the iron sinks to the floor and the wood floats. Then the root of the word dharma, the earth under a tree, three roles with a duty each, the order of nature, and people of many kinds side by side.';
  static CONTROLS = [
    { type: 'button', id: 'iron', label: 'Drop the iron' },
    { type: 'button', id: 'wood', label: 'Drop the wood' },
    tapLightControl({ id: 'lit', label: 'Role', chips: CHIPS, noneLabel: 'All' }),
  ];

  tl = tapLight({ label: 'Roles', chips: CHIPS });

  constructor(container, config) {
    super(container, config);
    this._iron = null; this._wood = null;   // seconds since dropped; null = still held
    this._found = false;
  }

  isControlHidden(id) {
    if (id === 'iron' || id === 'wood') return this.stage !== 1;
    if (id === 'lit') return this.stage !== 6 && this.stage !== 9;
    return false;
  }
  isControlDisabled(id) { return (id === 'iron' && this._iron != null) || (id === 'wood' && this._wood != null); }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }

  enter(stage) {
    this.tl.set({ lit: null });
    const done = [2, 3, 5].includes(stage);
    this._iron = done ? SINK_S + 1 : null; this._wood = done ? FLOAT_S + 1 : null; this._found = false;
    this.requestUiUpdate?.();
  }

  onControlChange(id, v) {
    if (id === 'lit') { this.tl.fromControl(v); this.requestUiUpdate?.(); return; }
    if (!this._guard(id)) return;
    if (id === 'iron') this._iron = reducedMotion() ? SINK_S + 1 : 0;
    if (id === 'wood') this._wood = reducedMotion() ? FLOAT_S + 1 : 0;
    this.animateFor(2200);
    this.requestUiUpdate?.();
  }

  // Tap a block itself as well as its button.
  pointerDown(p) {
    if (this.stage !== 1 || p.y > 190) return;
    const id = Math.abs(p.x - IRON_X) < 95 ? 'iron' : Math.abs(p.x - WOOD_X) < 95 ? 'wood' : null;
    if (id && !this.isControlDisabled(id)) this.onControlChange(id, true);
  }

  update(d) {
    if (this._iron != null && this._iron < SINK_S + 0.1) this._iron += d;
    if (this._wood != null && this._wood < FLOAT_S + 0.1) this._wood += d;
    if (this.stage === 1 && !this._found && this._iron > SINK_S && this._wood > FLOAT_S) {
      this._found = true;
      this.celebrate(340, 220, 20);
    }
  }

  busy() { return (this._iron != null && this._iron < SINK_S) || (this._wood != null && this._wood < FLOAT_S); }

  draw(ctx, c, t) {
    const s = this.stage;
    if (s <= 3 || s === 5) this._tank(ctx, c, t);
    else if (s === 4) this._root(ctx, c, t);
    else if (s === 6 || s === 9) this._roles(ctx, c, t);
    else if (s === 7) this._order(ctx, c, t);
    else if (s === 8) this._same(ctx, c, t);
    else this._who(ctx, c, t);
  }

  _yard(ctx, c) {
    const P = pal(c);
    ctx.fillStyle = mix(P.water, c.bgSurface, 0.72); ctx.fillRect(0, 0, 680, 520);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 420, 680, 100);
    return P;
  }

  // A stepped stone tank in a courtyard, cut open so the water shows. A man on the rim holds the
  // two ropes; a press lets one block go, and its rope runs out after it.
  _court(ctx, c) {
    const P = pal(c);
    ctx.fillStyle = mix(P.water, c.bgSurface, 0.72); ctx.fillRect(0, 0, 680, 520);
    ctx.fillStyle = P.stoneLight; ctx.fillRect(0, 52, 680, RIM_Y - 52);
    ctx.strokeStyle = alpha(P.stoneDark, 0.3); ctx.lineWidth = 2;
    for (let r = 0, y = 76; y < RIM_Y; r++, y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(680, y); ctx.stroke();
      for (let x = (r % 2) * 34; x < 680; x += 68) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 24); ctx.stroke(); }
    }
    ctx.fillStyle = mix(P.stoneDark, c.bgDeep, 0.35);
    ctx.beginPath(); ctx.moveTo(280, RIM_Y); ctx.lineTo(280, 104); ctx.arc(340, 104, 60, Math.PI, 0); ctx.lineTo(400, RIM_Y); ctx.fill();
    ctx.fillStyle = P.stone;
    for (const x of [252, 428]) { rr(ctx, x - 16, 52, 32, RIM_Y - 52, 4); ctx.fill(); }
    ctx.fillStyle = darken(P.stone, 0.12); rr(ctx, 0, 44, 680, 14, 4); ctx.fill();
    tree(ctx, c, 628, RIM_Y, 0.8, 3);
    // the ground, then the tank cut out of it
    ctx.fillStyle = P.stone; ctx.fillRect(0, RIM_Y, 680, 520 - RIM_Y);
    ctx.fillStyle = darken(P.stone, 0.1);
    for (let y = RIM_Y + 34; y < 520; y += 34) ctx.fillRect(0, y, 680, 2);
    ctx.fillStyle = P.sand; ctx.fillRect(0, RIM_Y - 4, 680, 14);
    return P;
  }

  _basin(ctx) {
    ctx.beginPath(); ctx.moveTo(BASIN[0][0], BASIN[0][1]);
    for (const [x, y] of BASIN) ctx.lineTo(x, y);
    ctx.closePath();
  }

  _rope(ctx, c, x, y) {
    ctx.strokeStyle = darken(pal(c).woodLight, 0.25); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, BEAM_Y); ctx.lineTo(POST_X, BEAM_Y); ctx.lineTo(HAND.x, HAND.y); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  }

  _tank(ctx, c, t) {
    const P = this._court(ctx, c);
    ctx.fillStyle = mix(P.stoneDark, c.bgSurface, 0.3); this._basin(ctx); ctx.fill();
    const wob = reducedMotion() ? 0 : 3 * Math.sin(t * 2);
    ctx.save(); this._basin(ctx); ctx.clip();
    const g = ctx.createLinearGradient(0, WATER_Y, 0, 470);
    g.addColorStop(0, lighten(P.water, 0.25)); g.addColorStop(1, P.waterDeep);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, WATER_Y + wob);
    ctx.quadraticCurveTo(340, WATER_Y - wob * 2, 680, WATER_Y + wob); ctx.lineTo(680, 480); ctx.lineTo(0, 480); ctx.fill();
    ctx.strokeStyle = alpha(lighten(P.water, 0.7), 0.9); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, WATER_Y + wob); ctx.quadraticCurveTo(340, WATER_Y - wob * 2, 680, WATER_Y + wob); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = P.stoneDark; ctx.lineWidth = 7; ctx.lineJoin = 'round'; this._basin(ctx); ctx.stroke(); ctx.lineJoin = 'miter';
    // the beam the ropes run over
    const wood = darken(P.woodLight, 0.2);
    ctx.fillStyle = wood; rr(ctx, POST_X - 8, BEAM_Y - 4, 14, RIM_Y - BEAM_Y + 4, 4); ctx.fill(); rr(ctx, 596, BEAM_Y - 4, 14, RIM_Y - BEAM_Y + 4, 4); ctx.fill();
    ctx.fillStyle = darken(wood, 0.16); rr(ctx, POST_X - 14, BEAM_Y - 12, 500, 15, 6); ctx.fill();
    // iron
    const ironY = this._iron == null ? HELD_Y : HELD_Y + (FLOOR_Y - HELD_Y) * outBounce(this._iron / SINK_S);
    this._rope(ctx, c, IRON_X, ironY - 30);
    this._blockIron(ctx, c, IRON_X, ironY);
    // wood: falls, dips, rises and rests half out of the water
    let woodY = HELD_Y;
    if (this._wood != null) {
      const u = this._wood / FLOAT_S;
      woodY = u < 0.45 ? HELD_Y + (WATER_Y + 42 - HELD_Y) * (u / 0.45) ** 2 : WATER_Y + 4 + 38 * Math.exp(-(u - 0.45) * 4.5) * Math.cos((u - 0.45) * 9);
    }
    woodY += this._wood != null && this._wood > FLOAT_S ? wob : 0;
    this._rope(ctx, c, WOOD_X, woodY - 30);
    this._blockWood(ctx, c, WOOD_X, woodY);
    person(ctx, this, { role: 'adult', pose: 'point', x: 44, y: RIM_Y + 4, height: 160, facing: 1, i: 1, t, look: MAN });
    const labels = this.stage >= 2 || this._found;
    if (labels) {
      pill(ctx, c, 'iron sinks', IRON_X, 332, { bg: c.bgSurface, ink: c.label, size: 30, display: true });
      pill(ctx, c, 'wood floats', WOOD_X, 278, { bg: c.bgSurface, ink: c.label, size: 30, display: true });
    }
    if (this.stage === 5) pill(ctx, c, 'law of existence', 370, 96, { bg: c.gold, ink: inkOn(c, c.gold), size: 32, display: true });
    if (this.stage === 2) pill(ctx, c, 'dharma = ?', 340, 96, { bg: c.gold, ink: inkOn(c, c.gold), size: 34, display: true });
  }

  _blockIron(ctx, c, x, y) {
    const iron = darken(mix(pal(c).sandDark, c.water, 0.5), 0.35), w = 110, h = 62;
    ctx.fillStyle = darken(iron, 0.3); rr(ctx, x - w / 2, y - h / 2 + 6, w, h, 8); ctx.fill();
    ctx.fillStyle = iron; rr(ctx, x - w / 2, y - h / 2, w, h, 8); ctx.fill();
    ctx.fillStyle = lighten(iron, 0.3); rr(ctx, x - w / 2 + 8, y - h / 2 + 6, w - 16, 8, 4); ctx.fill();
  }

  _blockWood(ctx, c, x, y) {
    const P = pal(c), w = 140, h = 62;
    ctx.fillStyle = darken(P.woodLight, 0.3); rr(ctx, x - w / 2, y - h / 2 + 6, w, h, 10); ctx.fill();
    ctx.fillStyle = P.woodLight; rr(ctx, x - w / 2, y - h / 2, w, h, 10); ctx.fill();
    ctx.strokeStyle = darken(P.woodLight, 0.22); ctx.lineWidth = 3;
    for (const dy of [-12, 2, 15]) { ctx.beginPath(); ctx.moveTo(x - w / 2 + 12, y + dy); ctx.bezierCurveTo(x - 20, y + dy - 6, x + 20, y + dy + 6, x + w / 2 - 12, y + dy); ctx.stroke(); }
  }

  // dhri, and the earth that holds everything up.
  _root(ctx, c, t) {
    const P = this._yard(ctx, c);
    ctx.fillStyle = P.grass;
    ctx.beginPath(); ctx.moveTo(0, 420); ctx.quadraticCurveTo(340, 340, 680, 420); ctx.lineTo(680, 520); ctx.lineTo(0, 520); ctx.fill();
    tree(ctx, c, 170, 400, 2, 4);
    person(ctx, this, { role: 'adult', x: 470, y: 400, height: 170, i: 5, t, look: MAN });
    person(ctx, this, { role: 'farmer', x: 556, y: 408, height: 160, i: 3, t });
    const box = (x, s) => pill(ctx, c, s, x, 56, { bg: c.gold, ink: inkOn(c, c.gold), size: 34, display: true });
    box(120, 'dharma'); box(340, 'dhri'); box(558, 'dharati');
    ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const [a, b] of [[282, 196], [398, 478]]) { ctx.beginPath(); ctx.moveTo(a, 56); ctx.lineTo(b, 56); ctx.stroke(); }
    ctx.lineCap = 'butt';
    pill(ctx, c, 'the earth', 340, 470, { bg: c.bgSurface, ink: c.label, size: 30 });
    pill(ctx, c, 'that which upholds', 340, 130, { bg: c.bgSurface, ink: c.label, size: 30 });
  }

  _roles(ctx, c, t) {
    const P = this._yard(ctx, c);
    const lit = this.tl.lit()[0];
    ROLES.forEach((r, i) => {
      const x = 18 + i * 218, off = lit && lit !== r.id;
      panel(ctx, c, x, 16, 208, 392, { fill: P.panel, lit: lit === r.id, off });
      ctx.save(); if (off) ctx.globalAlpha *= 0.34;
      person(ctx, this, { role: r.role, x: x + 104, y: 330, height: r.id === 'student' ? 230 : 270, i: r.i, t, look: MAN });
      if (r.id === 'ruler') crown(ctx, c, x + 104, 42, 1);
      ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = font(c, 700, 30, true); ctx.fillText(r.label, x + 104, 370);
      ctx.restore();
    });
    const d = ROLES.find((r) => r.id === lit);
    if (d) pill(ctx, c, d.duty, 340, 464, { bg: c.gold, ink: inkOn(c, c.gold), size: 29 });
    else pill(ctx, c, this.stage === 6 ? 'Tap a role' : 'one word, many duties', 340, 464, { bg: c.gold, ink: inkOn(c, c.gold), size: 30 });
  }

  // Sun, cloud, rain, river, field: nature in order.
  _order(ctx, c) {
    const P = pal(c);
    ctx.fillStyle = P.grass; ctx.fillRect(0, 0, 680, 520);
    ctx.fillStyle = mix(P.water, c.bgSurface, 0.7); ctx.fillRect(0, 0, 680, 300);
    const a = 0.7;
    const sx = 340 - 280 * Math.cos(a * 2.2), sy = 250 - 200 * Math.sin(a * 2.2);
    ctx.strokeStyle = alpha(c.label, 0.3); ctx.lineWidth = 4; ctx.setLineDash([10, 12]);
    ctx.beginPath(); ctx.ellipse(340, 250, 280, 200, 0, Math.PI, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = c.gold; ctx.beginPath(); ctx.arc(sx, sy, 42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.water;
    ctx.beginPath(); ctx.moveTo(-10, 330); ctx.bezierCurveTo(180, 300, 420, 400, 700, 330); ctx.lineTo(700, 372); ctx.bezierCurveTo(420, 442, 180, 342, -10, 372); ctx.fill();
    for (let i = 0; i < 6; i++) tree(ctx, c, 60 + i * 112, 300 - (i % 2) * 14, 0.9, i + 2);
    pill(ctx, c, 'satya: real, true', 170, 452, { bg: c.bgSurface, ink: c.label, size: 28 });
    pill(ctx, c, '\u1E5Bita: right, cosmic order', 462, 452, { bg: c.gold, ink: inkOn(c, c.gold), size: 28 });
    pill(ctx, c, 'harmony and balance', 340, 496, { bg: c.bgSurface, ink: c.label, size: 28 });
  }

  // Many people, one row, one ground.
  _same(ctx, c, t) {
    this._yard(ctx, c);
    const list = [['farmer', 1], ['elder', 2], ['adult', 3], ['student', 4], ['worker', 5], ['adult', 6], ['elder', 7]];
    list.forEach(([role, i], k) => person(ctx, this, { role, x: 62 + k * 93, y: 416, height: 230, i, t }));
    pill(ctx, c, 'samatva', 340, 52, { bg: c.gold, ink: inkOn(c, c.gold), size: 38, display: true });
    pill(ctx, c, 'the principle of sameness', 340, 112, { bg: c.bgSurface, ink: c.label, size: 28 });
    pill(ctx, c, 'for the welfare of all beings', 340, 470, { bg: c.accent, ink: inkOn(c, c.accent), size: 30 });
  }

  _who(ctx, c) {
    const P = this._yard(ctx, c);
    ROLES.forEach((r, i) => {
      const x = 18 + i * 218;
      panel(ctx, c, x, 90, 208, 322, { fill: P.panel });
      ctx.fillStyle = c.labelMuted; ctx.font = font(c, 700, 96, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', x + 104, 230);
      ctx.fillStyle = c.label; ctx.font = font(c, 700, 30, true); ctx.fillText(r.label, x + 104, 374);
    });
    pill(ctx, c, 'Who holds which role?', 340, 46, { bg: c.gold, ink: inkOn(c, c.gold), size: 34, display: true });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
