/**
 * ChoicesScene - L01 s00 "Choices Everywhere" (2 beats). Canvas, because the choosers are SimFigure people.
 *   b0 choosers:  three choosers, each under a fork with two options and an "or" between them:
 *                 Meera (snacks or shoes), a farmer (wheat or barley), the government (highway or hospital).
 *                 They come in one after another (0.7 s each); at rest all three stand at their forks.
 *   b1 questions: the choosers shrink to a band at the top ("economic choices"), and the three Big
 *                 Questions light up one by one as three cards (0.8 s each). At rest all three are lit.
 * No controls: both beats are watched. Colours are tokens only (this.colors). ASCII only.
 */
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, pill, font, rr, alpha, mix, darken, clamp01, outBack, inOutSine } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { drawCivic } from 'simulations/base/kit/SimCivic.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { cropColor } from 'simulations/base/kit/SimFarm.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const CX = [96, 280, 464];
const GROUND = 404;
const FORK_Y = 178;       // where the path splits
const OPT_Y = 100;        // option discs
const OPT_DX = 47;
const OPT_R = 31;
const STEP_S = 0.7;       // one chooser every 0.7 s
const CARD_S = 0.8;       // one question card every 0.8 s
const SHRINK_S = 0.6;
const QUESTIONS = ['What does economics deal with?', 'What are its key questions?', 'How do economic systems answer them?'];
const CHOOSERS = [
  { name: 'Meera', opts: ['snacks', 'shoes'] },
  { name: 'a farmer', opts: ['wheat', 'barley'] },
  { name: 'the government', opts: ['highway', 'hospital'] },
];

export class ChoicesScene extends SimScene {
  static WIDTH = 560;
  static HEIGHT = 480;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three choosers, each at a fork with two options. Meera chooses snacks or shoes. A farmer chooses wheat or barley. The government chooses a highway or a hospital. Then three cards light up one by one: What does economics deal with? What are its key questions? How do economic systems answer them?';

  enter() { /* every state is a function of this.stage and this.age */ }

  busy() {
    if (this.stage === 1) return this.age < SHRINK_S + 0.4 + CARD_S * 3 + 0.3;
    return this.age < 0.2 + STEP_S * 3 + 0.6;
  }

  /** Progress 0..1 of chooser k coming in (beat 0), or 1 (beat 1). */
  inOf(k) {
    if (this.stage !== 0) return 1;
    return clamp01((this.age - 0.2 - k * STEP_S) / 0.55);
  }

  drawOption(ctx, c, name, x, y, r, u) {
    if (u <= 0) return;
    const s = outBack(clamp01(u)), rim = darken(c.stroke, 0.05);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 3, r, 0, Math.PI * 2); ctx.fillStyle = darken(c.bgSurface, 0.12); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = c.bgSurface; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rim; ctx.stroke();
    const k = r / OPT_R;
    if (name === 'snacks') {
      // A crimped snack packet.
      const w = 30 * k, h = 38 * k, tone = c.s6;
      rr(ctx, -w / 2, -h / 2, w, h, 5 * k); ctx.fillStyle = tone; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = darken(tone, 0.35); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 3 * k, 8 * k, 0, Math.PI * 2); ctx.fillStyle = mix(c.gold, c.bgSurface, 0.2); ctx.fill();
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) ctx.lineTo(-w / 2 + (i * w) / 6, -h / 2 + (i % 2 ? 4 : 0) * k);
      ctx.strokeStyle = darken(tone, 0.35); ctx.stroke();
    } else if (name === 'shoes') drawCivic(ctx, c, 'shoe', 0, 14 * k, { w: 50 * k });
    else if (name === 'wheat' || name === 'barley') drawIcon(ctx, c, 'grain', 0, 0, 22 * k, { tone: cropColor(c, name) });
    else if (name === 'highway') drawIcon(ctx, c, 'road', 0, 0, 22 * k, { tone: c.s7 });
    else if (name === 'hospital') drawIcon(ctx, c, 'hospital', 0, 0, 22 * k, { tone: c.s1 });
    ctx.restore();
  }

  /** One chooser column: the person or building on the ground, the fork, two options and their words. */
  drawColumn(ctx, c, k, u, words) {
    if (u <= 0) return;
    const x = CX[k], ch = CHOOSERS[k];
    ctx.save();
    ctx.globalAlpha *= clamp01(u * 1.6);
    let top;
    if (k === 0) {
      const spec = figureFor(this, { role: 'student', pose: 'relax', x, y: GROUND, height: 150, facing: 0, i: 3, mood: 'think',
        look: { outfit: 'uniform', hairStyle: 'braid', top: mix(c.s1, c.bgSurface, 0.55), bottom: c.s5, bottomStyle: 'skirt' } });
      drawFigure(ctx, c, spec, spec.look);
      top = GROUND - 158;
    } else if (k === 1) {
      const spec = figureFor(this, { role: 'farmer', pose: 'relax', x, y: GROUND, height: 160, facing: 0, i: 1, mood: 'think' });
      drawFigure(ctx, c, spec, spec.look);
      top = GROUND - 168;
    } else {
      const b = drawCivic(ctx, c, 'parliament', x, GROUND, { w: 178 });
      top = GROUND - b.h - 8;
    }
    // The fork: a stem up from the chooser, then two branches to the options.
    const g = clamp01((u - 0.2) / 0.8);
    if (g > 0) {
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = mix(c.stroke, c.bgSurface, 0.35); ctx.lineWidth = 8;
      ctx.setLineDash([2, 13]);
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, FORK_Y);
      ctx.lineTo(x - OPT_DX * g, FORK_Y - (FORK_Y - OPT_Y - OPT_R) * g);
      ctx.moveTo(x, FORK_Y); ctx.lineTo(x + OPT_DX * g, FORK_Y - (FORK_Y - OPT_Y - OPT_R) * g);
      ctx.stroke();
      ctx.restore();
    }
    const o = clamp01((u - 0.5) / 0.5);
    this.drawOption(ctx, c, ch.opts[0], x - OPT_DX, OPT_Y, OPT_R, o);
    this.drawOption(ctx, c, ch.opts[1], x + OPT_DX, OPT_Y, OPT_R, o);
    if (words && o > 0) {
      ctx.globalAlpha *= o;
      ctx.font = font(c, 800, 20);
      ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(ch.opts[0], x - OPT_DX, OPT_Y - OPT_R - 20);
      ctx.fillText(ch.opts[1], x + OPT_DX, OPT_Y - OPT_R - 20);
      ctx.font = font(c, 800, 17);
      ctx.fillStyle = c.labelMuted ?? c.label;
      ctx.fillText('or', x, OPT_Y + 2);
      pill(ctx, c, ch.name, x, GROUND + 34, { size: 20, bg: k === 0 ? c.accent : c.bgSurface, ink: k === 0 ? undefined : c.label });
    }
    ctx.restore();
  }

  drawCard(ctx, c, i, y, h, lit) {
    const x = 26, w = 560 - 52, on = clamp01(lit);
    ctx.save();
    ctx.globalAlpha *= 0.35 + 0.65 * on;
    const rim = mix(mix(c.stroke, c.bgSurface, 0.3), c.accent, on);
    rr(ctx, x, y + 4, w, h, 14); ctx.fillStyle = darken(rim, 0.25); ctx.fill();
    rr(ctx, x, y, w, h, 14); ctx.fillStyle = c.bgSurface; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rim; ctx.stroke();
    const r = 21, nx = x + 34, ny = y + h / 2;
    ctx.beginPath(); ctx.arc(nx, ny, r * (0.8 + 0.2 * outBack(on)), 0, Math.PI * 2); ctx.fillStyle = mix(c.track, c.accent, on); ctx.fill();
    ctx.font = font(c, 800, 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = on > 0.5 ? c.bgSurface : c.label; ctx.fillText(String(i + 1), nx, ny + 1);
    ctx.font = font(c, 800, 20); ctx.textAlign = 'left'; ctx.fillStyle = c.label;
    ctx.fillText(QUESTIONS[i], x + 66, ny + 1);
    ctx.restore();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    if (this.stage === 0) {
      // Ground line under the three choosers.
      ctx.fillStyle = alpha(c.stroke, 0.18);
      rr(ctx, 20, GROUND - 2, 520, 5, 3); ctx.fill();
      for (let k = 0; k < 3; k++) this.drawColumn(ctx, c, k, this.inOf(k), true);
      return;
    }
    // Beat 1: the choosers shrink into a band at the top; the cards light one by one.
    const s = inOutSine(clamp01(this.age / SHRINK_S));
    const k = 1 - 0.58 * s, dy = -26 * s;
    ctx.save();
    ctx.translate(280, dy);
    ctx.scale(k, k);
    ctx.translate(-280, 0);
    ctx.globalAlpha *= 1 - 0.5 * s;
    for (let j = 0; j < 3; j++) this.drawColumn(ctx, c, j, 1, s < 0.3);
    ctx.restore();
    if (s < 1) return;
    const a = clamp01((this.age - SHRINK_S) / 0.3);
    pill(ctx, c, 'economic choices', 280, 198, { size: 19, bg: c.bgSurface, ink: c.label, alpha: a });
    const t0 = SHRINK_S + 0.4;
    for (let i = 0; i < 3; i++) this.drawCard(ctx, c, i, 236 + i * 80, 66, a > 0 ? (this.age - t0 - i * CARD_S) / 0.35 : 0);
  }

  testState() { return { stage: this.stage, busy: this.busy() }; }
}
