// WorldDemocracyMapScene - L05 s07. b0 what Team D lacked: the election stands, three other pieces are
// empty. b1 world land as one mass, India from the Survey of India layer, five pins, a tap each.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import { drawCivic, day, tag, card, who, pop, rr, mix, font, alpha, plate } from '../L04/DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const TAU = Math.PI * 2;
const MAP = { w: 680, h: 354, top: -34 };   // full width; only the far north and Antarctica fall off the stage
const LANDS = [
  { id: 'india', label: 'India', ll: [79, 22], tone: 2, title: 'India: parliamentary', text: 'A President is Head of State. Executive power lies with the council of ministers headed by the Prime Minister.', dx: 0, dy: 44 },
  { id: 'canada', label: 'Canada', ll: [-106, 56], tone: 1, title: 'Canada: parliamentary', text: 'The Monarch is Head of State and appoints a Governor-General. Executive power lies with the Prime Minister.', dx: 104, dy: 0 },
  { id: 'uk', label: 'UK', ll: [-2, 54], tone: 3, title: 'United Kingdom: parliamentary', text: 'A constitutional monarchy, with an unwritten constitution. Executive power lies with the Prime Minister.', dx: -58, dy: 4 },
  { id: 'swiss', label: 'Switzerland', ll: [8, 47], tone: 5, title: 'Switzerland: direct', text: 'Executive power lies with the Federal Council. It has a written constitution and multiple parties.', dx: 104, dy: 14 },
  { id: 'usa', label: 'USA', ll: [-98, 39], tone: 6, title: 'USA: presidential', text: 'Executive power lies with the President. It has a written constitution and two major parties.', dx: 84, dy: 12 },
];
const CHIPS = LANDS.map((l) => ({ id: l.id, label: l.label, targets: [l.id], tone: l.tone }));
const PIECES = [
  { t: 'Elections', on: true, say: 'held' },
  { t: 'Free choice of candidates', say: 'missing' },
  { t: 'Power that is shared', say: 'missing' },
  { t: 'Opposition voices', say: 'missing' },
];

export class WorldDemocracyMapScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'First Team D with one piece in place, elections, and three empty pieces: free choice of candidates, power that is shared, opposition voices. Then a world map with India drawn from the Survey of India layer and five pins. Tapping a pin or a chip shows how that government works.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Country', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  // A pin takes a tap anywhere near it, 44 screen px at 390. The chips stay for the keyboard.
  pointerDown(p) {
    if (this.stage !== 1 || !this.proj) return;
    let best = null, d = 54 * 54;
    for (const l of LANDS) { const [x, y] = SimGeo.project(this.proj, l.ll), e = (x - p.x) ** 2 + (y + MAP.top - p.y) ** 2; if (e < d) { d = e; best = l; } }
    if (best && best.id !== this.tl.chip()?.id) { this.tl.set({ lit: best.id }); this.requestUiUpdate?.(); }
  }
  enter(st) { this.tl.set({ lit: st === 1 ? 'india' : null }); }
  busy() { return this.age < 1.6; }

  async setup() {
    this.land = null;
    await super.setup();
    const [land, india] = await Promise.all([SimGeo.loadWorld('land'), SimGeo.loadLayer('india')]);
    const proj = await SimGeo.makeProjection('naturalEarth', { type: 'Sphere' }, [MAP.w, MAP.h], { rotate: [-10, 0, 0] });
    this.land = land; this.india = india; this.proj = proj;
    this.path = await SimGeo.makePath(this._ctx, proj);
    this.animateFor?.(300);
  }

  _teamD(ctx, c, a) {
    day(ctx, c, { ground: 300, sun: false });
    drawCivic(ctx, c, 'ballotBox', 120, 330, { w: 150 });
    who(ctx, this, { role: 'student', x: 200, y: 350, height: 200, i: 3, pose: 'point', facing: -1 });
    tag(ctx, c, 'Team D', 130, 44, { bg: c.s2, size: 36 });
    PIECES.forEach((P, i) => {
      const y = 12 + i * 110, x = 300, w = 366, k = pop(a, 0.15 + i * 0.3);
      if (k <= 0.02) return;
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      rr(ctx, x, y, w, 98, 16); ctx.fillStyle = P.on ? mix(c.good, c.bgSurface, 0.56) : alpha(c.bgSurface, 0.65); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = P.on ? c.good : c.labelMuted; ctx.setLineDash(P.on ? [] : [12, 9]); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = font(c, 700, 28, true); ctx.fillStyle = c.label; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(P.t, x + 16, y + 34);
      ctx.font = font(c, 700, 26); ctx.fillStyle = c.label; ctx.fillText(P.say, x + 16, y + 72);
      ctx.restore();
    });
  }

  _world(ctx, c, a) {
    ctx.fillStyle = mix(c.bgSurface, c.water, 0.3); ctx.fillRect(0, 0, 680, 453);
    const L = this.tl.chip()?.id, cur = LANDS.find((l) => l.id === L);
    if (this.land && this.path) {
      const map = plate(this, 'world', c, MAP.w, MAP.h, (x) => {
        this.path.context(x);
        x.beginPath(); this.path(this.land); x.fillStyle = mix(c.s3, c.bgSurface, 0.56); x.fill();
        x.beginPath(); this.path(this.india); x.fillStyle = mix(c.gold, c.bgSurface, 0.2); x.fill(); x.lineWidth = 1.5; x.strokeStyle = mix(c.gold, c.label, 0.5); x.stroke();
      });
      ctx.save(); ctx.translate(0, MAP.top);
      if (map) ctx.drawImage(map, 0, 0, MAP.w, MAP.h);
      LANDS.forEach((l) => {
        const [x, y] = SimGeo.project(this.proj, l.ll), on = l.id === L;
        ctx.beginPath(); ctx.arc(x, y, on ? 17 : 13, 0, TAU); ctx.fillStyle = c[`s${l.tone}`]; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.bgSurface; ctx.stroke();
        if (on) tag(ctx, c, l.label, Math.max(90, Math.min(590, x + l.dx)), Math.max(26 - MAP.top, y + l.dy), { bg: c[`s${l.tone}`], size: 28 });
      });
      ctx.restore();
    }
    if (cur) card(ctx, c, 14, 240, 652, 158, { title: cur.title, text: cur.text, size: 27, titleSize: 30, rim: c[`s${cur.tone}`] });
    else card(ctx, c, 14, 240, 652, 158, { title: 'Five democracies', text: 'Tap a pin or a country to see how it works.', size: 27, titleSize: 30 });
    pill(ctx, c, 'Boundary of India: Survey of India', 14, 426, { align: 'left', size: 26, bg: c.bgSurface, ink: c.labelMuted });
  }

  draw(ctx, c) {
    if (this.stage === 0) this._teamD(ctx, c, this.age); else this._world(ctx, c, this.age);
    drawVignette(ctx, c, 0.12);
  }
}
