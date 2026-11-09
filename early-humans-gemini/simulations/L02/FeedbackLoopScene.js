// FeedbackLoopScene - L02 s02b. One explanation, marked as one. A skull in the middle changes as the steps light.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { rr, alpha, mix, darken, pill, font, blob, clamp01, inOutSine, drawBackdrop, drawCard } from 'simulations/base/kit/SimLook.js';
import { drawSkull, drawTool, mixSkull, SKULLS } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_JAW = 1, S_BROW = 2, S_BRAIN = 3, S_LOOP = 4;
const NW = 186, NH = 134;
const NODES = [
  { id: 'tool', name: 'stone tools', x: 12, y: 58 },
  { id: 'food', name: 'softer food', x: 482, y: 58 },
  { id: 'jaw', name: 'smaller jaw', x: 482, y: 374 },
  { id: 'brain', name: 'bigger brain', x: 12, y: 374 },
];
const LIT = [[], ['tool', 'food', 'jaw'], ['jaw'], ['food', 'brain'], ['tool', 'food', 'jaw', 'brain']];
// The skull at the end of each beat: jaw first, brow next, braincase last, then the whole row.
const H = SKULLS.habilis, Z = SKULLS.sapiens;
const POSE = [H, { ...H, jut: 0.4, chin: 0.5 }, { ...H, jut: 0.4, chin: 0.5, brow: 0.3 }, { ...H, jut: 0.4, chin: 0.5, brow: 0.3, vault: 0.8, forehead: 0.8, len: 0.74 }, Z];

export class FeedbackLoopScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'A skull in the middle with four steps round it, stamped one explanation: stone tools, softer food, smaller jaw, bigger brain. As each step lights, the jaw pulls back, then the brow shrinks, then the braincase grows. The last beat closes the ring.';

  busy() { return this.age < 1.4; }

  _art(ctx, c, id, x, y, lit) {
    if (id === 'tool') drawTool(ctx, c, 'chopper', x, y, 46);
    if (id === 'food') {
      const col = mix(c.bad, c.strata1, 0.5);
      for (const [a, b, r] of [[-34, 8, 20], [0, -8, 25], [36, 10, 18], [6, 20, 15]]) { ctx.beginPath(); ctx.ellipse(x + a, y + b, r * 1.2, r * 0.8, a * 0.02, 0, 6.3); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = darken(col, 0.45); ctx.lineWidth = 3; ctx.stroke(); }
    }
    if (id === 'jaw') {
      const col = mix(c.strata1, c.bgSurface, 0.4);
      ctx.beginPath(); ctx.moveTo(x + 48, y - 26); ctx.quadraticCurveTo(x + 44, y + 28, x + 16, y + 28); ctx.lineTo(x - 52, y + 28); ctx.quadraticCurveTo(x - 62, y + 12, x - 50, y + 2); ctx.lineTo(x + 8, y + 2); ctx.quadraticCurveTo(x + 22, y - 2, x + 24, y - 26); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = darken(col, 0.5); ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = darken(col, 0.5); for (let i = 0; i < 6; i++) { const tx = x - 46 + i * 9; ctx.beginPath(); ctx.moveTo(tx, y + 2); ctx.lineTo(tx, y - 8); ctx.stroke(); }
    }
    if (id === 'brain') {
      const col = mix(c.s6, c.strata1, 0.55);
      blob(ctx, x, y, 60, 44, 9, 0.12, 1.2); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = darken(col, 0.5); ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = darken(col, 0.3); ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const [a, b, q] of [[-36, 0, 1], [-10, -22, -1], [22, -6, 1], [-4, 16, -1]]) { ctx.beginPath(); ctx.arc(x + a, y + b, 12, 0.3 * q, 2.6 * q, q < 0); ctx.stroke(); }
    }
  }

  draw(ctx, c) {
    const st = this.stage;
    drawBackdrop(ctx, c, 'dots');
    const lit = LIT[st];
    // The ring: arrows between steps, clockwise, drawn behind the cards.
    const ring = [[198, 125, 482, 125], [575, 192, 575, 374], [482, 441, 198, 441], [105, 374, 105, 192]];
    ring.forEach(([x0, y0, x1, y1], i) => {
      const on = (st === S_LOOP) || (st === S_JAW && i < 2);
      const col = on ? c.accent : alpha(c.labelMuted, 0.4);
      ctx.strokeStyle = col; ctx.lineWidth = on ? 8 : 4; ctx.lineCap = 'round';
      const k = on ? clamp01(this.age / 0.5) : 1, ex = x0 + (x1 - x0) * k, ey = y0 + (y1 - y0) * k;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke();
      const a = Math.atan2(y1 - y0, x1 - x0), h = on ? 20 : 15;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * h, ey + Math.sin(a) * h); ctx.lineTo(ex + Math.cos(a + 2.4) * h, ey + Math.sin(a + 2.4) * h); ctx.lineTo(ex + Math.cos(a - 2.4) * h, ey + Math.sin(a - 2.4) * h); ctx.closePath(); ctx.fill();
    });
    // Hero skull.
    const t = inOutSine(clamp01(this.age / 0.9)), from = POSE[Math.max(0, st - 1)], to = POSE[st];
    const p = mixSkull(from, to, st ? t : 1);
    drawSkull(ctx, c, p, 356, 262, 126);
    if (st === S_BROW) pill(ctx, c, 'less certain', 340, 118 + 14, { size: 26, bg: c.gold, display: true });
    NODES.forEach((n) => {
      const on = lit.includes(n.id);
      ctx.save(); ctx.globalAlpha *= on ? 1 : 0.55;
      drawCard(ctx, c, n.x, n.y, NW, NH);
      this._art(ctx, c, n.id, n.x + NW / 2, n.y + 54, on);
      ctx.restore();
      if (on) { rr(ctx, n.x, n.y, NW, NH, 16); ctx.strokeStyle = c.accent; ctx.lineWidth = 4; ctx.stroke(); }
      ctx.font = font(c, 700, 26, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.name, n.x + NW / 2, n.y + NH - 24);
    });
    pill(ctx, c, 'one explanation', 340, 28, { size: 28, bg: c.gold, display: true });
  }
}
