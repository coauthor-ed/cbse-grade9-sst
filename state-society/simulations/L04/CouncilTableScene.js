// CouncilTableScene - L04 s04. A council of four at a low table beside the throne. b0 council.
// b1 four posts, chip lights each with its object. b2 the emperor is away: the seat stands empty
// and they decide. No rule about four people.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, pill, darken } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, person, crown, palmLeaf, MAN, TAU } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const POSTS = [
  { id: 'tre', label: 'Treasurer', x: 70, tone: 's2', i: 0 },
  { id: 'tax', label: 'Chief tax collector', x: 190, tone: 's3', i: 1 },
  { id: 'law', label: 'Chief legal advisor', x: 310, tone: 's5', i: 2 },
  { id: 'cmd', label: 'Commander-in-chief', x: 430, tone: 's6', i: 3 },
];
const CHIPS = POSTS.map((p, i) => ({ id: p.id, label: p.label, targets: [p.id], tone: [2, 3, 5, 6][i] }));
const TY = 380;

export class CouncilTableScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Four elder ministers stand at a low table beside a throne where the king sits. Each has an object on the table: a chest for the treasurer, a sack for the tax collector, a palm leaf for the legal advisor, a sword for the commander. On the last step the throne is empty and the council decides.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Post', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  enter() { this.tl.reset(); }

  _thing(ctx, c, id, x, y) {
    const p = pal(c);
    if (id === 'tre') { rr(ctx, x - 30, y - 34, 60, 34, 6); ctx.fillStyle = p.wood; ctx.fill(); rr(ctx, x - 7, y - 26, 14, 12, 3); ctx.fillStyle = c.gold; ctx.fill(); }
    if (id === 'tax') { ctx.beginPath(); ctx.ellipse(x, y - 20, 28, 22, 0, 0, TAU); ctx.fillStyle = p.sand; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = p.sandDark; ctx.stroke(); rr(ctx, x - 10, y - 46, 20, 10, 3); ctx.fillStyle = p.sandDark; ctx.fill(); }
    if (id === 'law') palmLeaf(ctx, c, x - 44, y - 28, 88, 26, { rows: 2 });
    if (id === 'cmd') { ctx.strokeStyle = p.stoneDark; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 38, y - 8); ctx.lineTo(x + 30, y - 8); ctx.stroke(); ctx.strokeStyle = p.wood; ctx.beginPath(); ctx.moveTo(x + 26, y - 18); ctx.lineTo(x + 26, y + 2); ctx.stroke(); }
  }

  draw(ctx, c) {
    const p = pal(c), st = this.stage;
    drawBackdrop(ctx, c, 'dots');
    rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = mix(c.bgSurface, c.gold, 0.1); ctx.fill();
    rr(ctx, 6, 330, 668, 184, 18); ctx.fillStyle = p.earth; ctx.fill();
    for (const x of [28, 652]) { rr(ctx, x - 16, 30, 32, 310, 6); ctx.fillStyle = p.stone; ctx.fill(); }
    // throne
    rr(ctx, 540, 120, 110, 220, 14); ctx.fillStyle = p.wood; ctx.fill();
    rr(ctx, 552, 132, 86, 116, 10); ctx.fillStyle = c.s6; ctx.fill();
    if (st < 2) { person(ctx, this, { role: 'adult', x: 594, y: 360, height: 250, i: 3, facing: -1, look: MAN }); crown(ctx, c, 594, 112, 0.9); }
    else pill(ctx, c, 'emperor away', 560, 90, { size: 28, bg: c.warning, display: true });
    POSTS.forEach((Q) => {
      const off = this.tl.off(Q.id);
      ctx.save(); if (off) ctx.globalAlpha = 0.3;
      person(ctx, this, { role: 'elder', x: Q.x + 8, y: TY + 4, height: 250, i: Q.i, pose: st === 2 && Q.i === 1 ? 'point' : 'stand', facing: 1, look: { ...MAN, hairStyle: Q.i % 2 ? 'short' : 'crop' } });
      ctx.restore();
    });
    rr(ctx, 16, TY + 6, 510, 26, 8); ctx.fillStyle = darken(p.wood, 0.1); ctx.fill();
    rr(ctx, 16, TY, 510, 26, 8); ctx.fillStyle = p.woodLight; ctx.fill();
    for (const x of [40, 500]) { rr(ctx, x, TY + 20, 16, 60, 4); ctx.fillStyle = p.wood; ctx.fill(); }
    POSTS.forEach((Q) => { const off = this.tl.off(Q.id); ctx.save(); if (off) ctx.globalAlpha = 0.3; this._thing(ctx, c, Q.id, Q.x + 8, TY); ctx.restore(); });
    const L = this.tl.chip();
    if (L) { const Q = POSTS.find((k) => k.id === L.id); pill(ctx, c, Q.label, Math.max(170, Q.x + 30), 476, { size: 28, bg: c[Q.tone], display: true }); }
    if (st === 0) pill(ctx, c, 'mantri-pari\u1E63had', 280, 476, { size: 28, bg: c.gold, display: true });
    if (st === 2) pill(ctx, c, 'they decide, in the public interest', 300, 476, { size: 28, bg: c.good, display: true });
    drawVignette(ctx, c, 0.28);
  }
}
