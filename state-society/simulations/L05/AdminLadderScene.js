// AdminLadderScene - the kingdom as land inside land. The camera flies from the kingdom down to
// one village; an officer stands at each level; north and south names sit on a card.
// One file, four mounts, told apart by beat count: 0 = s02 predict setup, 2 = s01, 4 = s03, 3 = s08.
//   stages: 0 setup  1 s01 walk  2 s01 levels  3-5 s03 levels  6 s03 today  7 s08 run  8 s08 village  9 s08 ask
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, alpha, mix, rr, font, inkOn, drawShadow } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { reducedMotion } from 'simulations/base/kit/SimAnim.js';
import { walkPhase } from 'simulations/base/kit/SimFigure.js';
import { pal, panel, person, crown } from '../shared/SstArt.js';
import { makeLevel, paintNest } from './LandNest.js';

const LV = [
  { name: 'Kingdom', n: 'r\u0101jya', s: '', who: 'the king', role: 'elder', i: 2 },
  { name: 'Province', n: 'bhukti', s: 'man\u1E0Dala, man\u1E0Dalam', who: 'provincial governor', role: 'adult', i: 1 },
  { name: 'Division', n: 'vi\u1E63haya, bhoga', s: 'ko\u1E6D\u1E6Dam, valan\u0101\u1E0Du', who: 'an officer', role: 'adult', i: 3 },
  { name: 'District', n: 'adhi\u1E63h\u1E6Dh\u0101na, pa\u1E6D\u1E6Dana', s: 'n\u0101\u1E0Du', who: 'district officer', role: 'adult', i: 4 },
  { name: 'Group of villages', n: 'vithi', s: 'pa\u1E6D\u1E6Dal\u0101, k\u016B\u1E5Bram', who: 'an officer', role: 'adult', i: 5 },
  { name: 'Village', n: '', s: '', who: 'village assembly', role: 'elder', i: 6 },
];
const NEST = [
  { level: makeLevel(3, 2, 11, 5), trees: 3 },
  { level: makeLevel(3, 2, 23, 1), trees: 3 },
  { level: makeLevel(2, 2, 37, 2), trees: 3, huts: 1, hutScale: 0.4 },
  { level: makeLevel(3, 2, 41, 4), huts: 3, hutScale: 0.5, trees: 2 },
  { level: makeLevel(2, 2, 53, 3), huts: 4, hutScale: 0.7, trees: 1 },
  { village: true },
];
const ROAD = [[120, 120], [230, 190], [320, 170], [410, 270], [520, 300], [590, 410]];
const CHIPS = [1, 2, 3, 4, 5].map((i) => ({ id: `l${i}`, label: LV[i].name, targets: [`l${i}`] }));
const TODAY = [['Province', 'State'], ['Division', ''], ['District', 'District'], ['Group of villages', 'Tahs\u012Bl'], ['Village', 'Village']];

const S_SETUP = 0, S_WALK = 1, S_LEVELS = 2, S_NAMES0 = 3, S_NAMES1 = 4, S_NAMES2 = 5, S_TODAY = 6, S_RUN = 7, S_DONE = 8, S_ASK = 9;
const one = (i) => [{ idx: i, dwellMs: null }];
const lerp = (a, b, u) => a + (b - a) * u;
const ease = (u) => { const k = Math.max(0, Math.min(1, u)); return 0.5 - 0.5 * Math.cos(Math.PI * k); };

export class AdminLadderScene extends SimScene {
  static BEAT_STEP_MAP = [one(S_SETUP)];   // the host sends a huge beat count on a predict setup: this map holds it
  static BEAT_MAPS = {
    0: [one(S_SETUP)], 2: [one(S_WALK), one(S_LEVELS)],
    4: [one(S_NAMES0), one(S_NAMES1), one(S_NAMES2), one(S_TODAY)], 3: [one(S_RUN), one(S_DONE), one(S_ASK)],
  };
  static IRIS = false;
  static VISUAL_PROFILE = 'rich';
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of a kingdom, with a capital and a far village. The view flies down through province, division, district and group of villages to one village, with an officer standing at each level and the northern and southern names for that level on a card.';
  static CONTROLS = [
    { type: 'button', id: 'send', label: 'Send the order' },
    { type: 'button', id: 'next', label: 'Next level' },
    tapLightControl({ id: 'lit', label: 'Level', chips: CHIPS, noneLabel: 'Kingdom' }),
  ];

  tl = tapLight({ label: 'Levels', chips: CHIPS });

  constructor(container, config) {
    super(container, config);
    this._v = 0;            // the level the camera is on, may be fractional
    this._glide = null;     // { from, to, t, dur }
    this._walk = null;      // 0..1 along the road, null before the send
    this._walking = false;
    this._run = null;       // s08: seconds since send
    this._found = false;
  }

  isControlHidden(id) {
    if (id === 'send') return this.stage !== S_WALK && this.stage !== S_RUN;
    if (id === 'next') return this.stage !== S_LEVELS;
    if (id === 'lit') return ![S_NAMES0, S_NAMES1, S_NAMES2].includes(this.stage);
    return false;
  }
  isControlDisabled(id) {
    if (id === 'send') return this._walking || this._run != null || (this.stage === S_WALK && this._walk === 1) || (this.stage === S_RUN && this._v >= 5);
    if (id === 'next') return !!this._glide || this._v >= 5;
    return false;
  }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }

  enter(stage) {
    this._glide = null; this._walking = false; this._run = null;
    this._walk = null;
    this._found = false;
    const preset = { [S_NAMES1]: 'l1', [S_NAMES2]: 'l3' }[stage] ?? null;
    this.tl.set({ lit: preset });
    this._v = stage === S_NAMES1 ? 1 : stage === S_NAMES2 ? 3 : stage === S_DONE || stage === S_ASK ? 5 : 0;
    this.requestUiUpdate?.();
  }

  _go(to, dur = 1.1) {
    if (reducedMotion()) { this._v = to; this._landed(); return; }
    this._glide = { from: this._v, to, t: 0, dur };
    this.animateFor(dur * 1000 + 300);
  }
  _landed() {
    if (this.stage === S_LEVELS && this._v >= 5 && !this._found) {
      this._found = true;
      this.celebrate(340, 300, 20);
    }
    this.requestUiUpdate?.();
  }

  onControlChange(id, v) {
    if (id === 'lit') {
      this.tl.fromControl(v);
      const i = (this.tl.lit()[0] ?? 'l0').slice(1);
      this._go(Number(i));
      this.requestUiUpdate?.();
      return;
    }
    if (!this._guard(id)) return;
    if (id === 'send' && this.stage === S_WALK) { this._walking = true; this._walk = 0; this.animateFor(4400); }
    if (id === 'send' && this.stage === S_RUN) { this._run = 0; this.animateFor(8200); }
    if (id === 'next') this._go(Math.min(5, Math.round(this._v) + 1));
    this.requestUiUpdate?.();
  }

  update(d) {
    const g = this._glide;
    if (g) {
      g.t += d;
      this._v = lerp(g.from, g.to, ease(g.t / g.dur));
      if (g.t >= g.dur) { this._v = g.to; this._glide = null; this._landed(); }
    }
    if (this._walking) {
      this._walk = Math.min(1, this._walk + d / 4);
      if (this._walk >= 1) { this._walking = false; this.requestUiUpdate?.(); }
    }
    if (this._run != null) {
      this._run += d;
      this._v = Math.min(5, ease(this._run / 7.5) * 5);
      if (this._run >= 7.5) {
        this._run = null; this._v = 5;
        if (!this._found) { this._found = true; this.celebrate(340, 300, 20); }
        this.requestUiUpdate?.();
      }
    }
  }

  busy() { return !!this._glide || this._walking || this._run != null; }

  draw(ctx, c, t) {
    const villageLit = this.stage === S_DONE ? ['tank', 'garden', 'temple'] : null;
    paintNest(ctx, c, NEST, this.stage === S_TODAY ? 0 : this._v, { villageLit, rim: this.stage !== S_SETUP && this.stage !== S_WALK });
    if (this.stage === S_TODAY) { this._today(ctx, c); return; }
    const lv = LV[Math.round(this._v)];
    if (this._v < 0.5 && this.stage !== S_TODAY) this._capital(ctx, c);
    if (this.stage === S_WALK) this._road(ctx, c, t);
    if (this.stage === S_SETUP) pill(ctx, c, '300 to 800 CE', 340, 58, { bg: c.gold, size: 32, display: true });
    if (this.stage !== S_WALK && this.stage !== S_SETUP) this._card(ctx, c, lv);
    if (this.stage !== S_WALK) this._officer(ctx, c, lv, t);
    if (this.stage === S_DONE) this._villageTags(ctx, c);
    this._rail(ctx, c);
  }

  // The king's town on the kingdom map.
  _capital(ctx, c) {
    const P = pal(c), x = 120, y = 120;
    drawShadow(ctx, c, x, y + 26, 54, 10, 1);
    ctx.fillStyle = P.stone; rr(ctx, x - 48, y - 20, 96, 46, 6); ctx.fill();
    ctx.fillStyle = P.stoneLight;
    for (let i = 0; i < 3; i++) { rr(ctx, x - 46 + i * 34, y - 44, 24, 28, 5); ctx.fill(); }
    ctx.fillStyle = P.stoneDark; rr(ctx, x - 12, y - 2, 24, 28, 8); ctx.fill();
    crown(ctx, c, x, y - 66, 1.3);
  }

  _road(ctx, c, t) {
    const P = pal(c);
    ctx.save();
    ctx.setLineDash([14, 12]); ctx.lineCap = 'round'; ctx.strokeStyle = P.earthDark; ctx.lineWidth = 7;
    ctx.beginPath(); ROAD.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.restore();
    const [fx, fy] = ROAD[ROAD.length - 1];
    ctx.fillStyle = c.accent; ctx.beginPath(); ctx.arc(fx, fy, 16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.bgSurface; ctx.lineWidth = 5; ctx.stroke();
    const u = (this._walk ?? 0) * (ROAD.length - 1), i = Math.min(ROAD.length - 2, Math.floor(u)), f = u - i;
    const x = lerp(ROAD[i][0], ROAD[i + 1][0], f), y = lerp(ROAD[i][1], ROAD[i + 1][1], f);
    person(ctx, this, { role: 'adult', x, y: y + 6, height: 112, pose: { name: 'walk', phase: walkPhase(u * 300, 112) }, facing: 1, i: 3, t });
    pill(ctx, c, this._walk === 1 ? 'Weeks on foot' : '500 km, no phone', 340, 478, { bg: c.gold, size: 32, display: true });
  }

  // A plain card: the level, and its two names where it has them.
  _card(ctx, c, lv) {
    const lines = (lv.n && lv.s) ? 2 : 0, h = lines ? 142 : 74, y0 = 14;
    const P = pal(c);
    panel(ctx, c, 150, y0, 516, h, { fill: P.panel });
    ctx.fillStyle = c.label; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = font(c, 700, 36, true); ctx.fillText(lv.name, 172, y0 + 37);
    if (!lines) return;
    const row = (k, tag, txt) => {
      const y = y0 + 80 + k * 38;
      ctx.font = font(c, 800, 28); ctx.fillStyle = c.labelMuted; ctx.fillText(tag, 172, y);
      ctx.font = font(c, 800, 30); ctx.fillStyle = c.label; ctx.fillText(txt, 258, y);
    };
    row(0, 'north', lv.n); row(1, 'south', lv.s);
  }

  _officer(ctx, c, lv, t) {
    const x = 74, y = 510;
    drawShadow(ctx, c, x, y - 2, 62, 10, 1);
    person(ctx, this, { role: lv.role, x, y: y - 4, height: 230, facing: 1, i: lv.i, t, mood: 'smile', look: { hairStyle: 'short', dupatta: false } });
    if (lv === LV[0]) crown(ctx, c, x, y - 244, 1.2);
    const ink = c.label;
    if (this.stage !== S_SETUP) pill(ctx, c, lv.who, 330, 490, { bg: c.bgSurface, ink, size: 28 });
  }

  _villageTags(ctx, c) {
    pill(ctx, c, 'irrigation', 160, 340, { bg: c.gold, size: 28 });
    pill(ctx, c, 'gardens', 402, 124, { bg: c.gold, size: 28 });
    pill(ctx, c, 'temple', 566, 282, { bg: c.gold, size: 28 });
  }

  // Six dots: how far down the camera has come.
  _rail(ctx, c) {
    if (this.stage === S_SETUP || this.stage === S_WALK) return;
    const x = 650, y0 = 190, gap = 46;
    ctx.fillStyle = alpha(c.bgDeep, 0.5); rr(ctx, x - 22, y0 - 28, 44, gap * 5 + 56, 22); ctx.fill();
    for (let i = 0; i < 6; i++) {
      const on = Math.round(this._v) >= i;
      ctx.fillStyle = on ? c.accent : c.bgSurface;
      ctx.beginPath(); ctx.arc(x, y0 + i * gap, Math.round(this._v) === i ? 15 : 10, 0, Math.PI * 2); ctx.fill();
    }
  }

  // The shape then and the shape now, side by side.
  _today(ctx, c) {
    const P = pal(c);
    panel(ctx, c, 28, 16, 624, 488, { fill: P.panel });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.font = font(c, 700, 32, true);
    ctx.fillText('300 to 800 CE', 196, 54); ctx.fillText('India today', 494, 54);
    TODAY.forEach(([a, b], i) => {
      const y = 116 + i * 82;
      const left = pill(ctx, c, a, 196, y, { bg: mix(P.sand, c.bgSurface, 0.3), ink: c.label, size: 30 });
      if (b) {
        const r = pill(ctx, c, b, 494, y, { bg: c.gold, ink: inkOn(c, c.gold), size: 30 });
        ctx.strokeStyle = alpha(c.label, 0.4); ctx.lineWidth = 3; ctx.setLineDash([8, 7]);
        ctx.beginPath(); ctx.moveTo(left.x0 + left.w + 8, y); ctx.lineTo(r.x0 - 8, y); ctx.stroke(); ctx.setLineDash([]);
      }
    });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
