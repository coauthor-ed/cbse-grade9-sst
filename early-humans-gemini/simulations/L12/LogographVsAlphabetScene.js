// LogographVsAlphabetScene - blk-l12-s07, 5 beats, one idea each. Beat 0: guess the three old signs. Beat 1: one sign, two
// ways of saying it. Beat 2: knife against brush. Beat 3: how many signs to learn, drawn to scale. Beat 4: chips show the
// old and new form of sun, moon and mountain side by side. Canvas: controls outside; two speakers are SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, inkOn, mix, outBack, pill, speechBubble, inOutSine } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawSign, signTile, ground } from './ChinaDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const SIGNS = [{ id: 'sun', label: 'Sun', targets: ['sun'], tone: 2 }, { id: 'moon', label: 'Moon', targets: ['moon'], tone: 5 }, { id: 'mountain', label: 'Mountain', targets: ['mountain'], tone: 3 }];
const COUNTS = [{ label: 'English', n: 26, tone: 's1' }, { label: 'Hindi', n: 50, tone: 's3' }, { label: 'Chinese', n: 3000, tone: 's6' }];

export class LogographVsAlphabetScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Five views. Three old signs to guess. One sign read in two languages. Slow knife strokes against fast brush strokes. Dots to scale: 26 English letters, about 50 Hindi letters, thousands of Chinese characters. Then the old and new forms of sun, moon and mountain.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: SIGNS })];

  tl = tapLight({ chips: SIGNS, onChange: () => { this.animateFor(200); } });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && (this.stage ?? 0) !== 4; }

  enter(s) { this.tl.set({ lit: s === 4 ? 'sun' : null }); }
  busy() { return this.age < 2.4; }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age;
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.14); ctx.fillRect(0, 0, W, H);
    this[['_guess', '_speech', '_speed', '_cost', '_roots'][s]](ctx, c, t);
  }

  _guess(ctx, c, t) {
    pill(ctx, c, 'What do these show?', W / 2, 52, { size: 34, display: true, bg: c.bgSurface, ink: c.label });
    ['sun', 'moon', 'mountain'].forEach((n, i) => {
      const size = 190, x = 26 + i * 216, y = 150, k = outBack(clamp((t - i * 0.15) / 0.4, 0, 1));
      ctx.save(); ctx.translate(x + size / 2, y + size); ctx.scale(k, k); ctx.translate(-size / 2, -size);
      signTile(ctx, c, 0, 0, size, 'bone');
      drawSign(ctx, n, 26, 26, size - 52, mix(c.strata6, c.strata3, 0.2), 9, 0);
      ctx.restore();
    });
    pill(ctx, c, 'Old signs, cut in bone', W / 2, 410, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
  }

  _speech(ctx, c, t) {
    ground(ctx, c, 424);
    const size = 200, x = W / 2 - size / 2, y = 150, k = outBack(clamp(t / 0.4, 0, 1));
    ctx.save(); ctx.translate(W / 2, y + size); ctx.scale(k, k); ctx.translate(-W / 2, -y - size);
    signTile(ctx, c, x, y, size, 'paper');
    drawSign(ctx, 'tree', x + 26, y + 26, size - 52, c.strata6, 15, 1);
    ctx.restore();
    pill(ctx, c, 'tree', W / 2, 382, { size: 30, display: true, bg: c.s3 });
    const a = figureFor(this, { role: 'student', pose: 'stand', x: 96, y: 452, height: 240, facing: 1, i: 1 }), b = figureFor(this, { role: 'adult', pose: 'stand', x: 584, y: 452, height: 250, facing: -1, i: 2 });
    drawFigure(ctx, c, a, a.look); drawFigure(ctx, c, b, b.look);
    speechBubble(ctx, c, 'mu', 112, 84, 110, 200, { size: 34 });
    speechBubble(ctx, c, 'muk', 566, 84, 570, 196, { size: 34 });
    pill(ctx, c, 'Mandarin', 112, 492, { size: 24, display: false, bg: c.bgSurface, ink: c.label });
    pill(ctx, c, 'Cantonese', 568, 492, { size: 24, display: false, bg: c.bgSurface, ink: c.label });
    pill(ctx, c, 'One sign, two sounds', W / 2, 40, { size: 30, display: true, bg: c.bgSurface, ink: c.label });
  }

  _speed(ctx, c, t) {
    const k = inOutSine(clamp((t - 0.2) / 0.6, 0, 1)), size = 280, y = 110;
    pill(ctx, c, 'Curves become straight strokes', W / 2, 44, { size: 30, display: true, bg: c.bgSurface, ink: c.label });
    signTile(ctx, c, 40, y, size, 'bone');
    drawSign(ctx, 'mountain', 80, y + 40, size - 80, mix(c.strata6, c.strata3, 0.2), 10, 0);
    signTile(ctx, c, 360, y, size, 'paper');
    ctx.save(); ctx.globalAlpha = k;
    drawSign(ctx, 'mountain', 400, y + 40, size - 80, c.strata6, 22, 1);
    ctx.restore();
    pill(ctx, c, 'Slow: knife', 180, 440, { size: 30, display: true, bg: c.s2 });
    pill(ctx, c, 'Fast: brush', 500, 440, { size: 30, display: true, bg: c.s1, alpha: k });
  }

  _cost(ctx, c, t) {
    pill(ctx, c, 'How many signs to learn?', W / 2, 44, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    // One dot is one sign, so the three blocks are to scale.
    const d = 6, rows = 57, y0 = 88;
    const grid = (n, x, col, k) => { ctx.fillStyle = col; const shown = Math.floor(n * k); for (let i = 0; i < shown; i++) ctx.fillRect(x + Math.floor(i / rows) * d, y0 + (i % rows) * d, d - 1.4, d - 1.4); };
    COUNTS.forEach((b, i) => {
      const col = c[b.tone], k = clamp((t - i * 0.4) / 0.7, 0, 1), x = [60, 186, 318][i];
      grid(b.n, x, col, k);
      pill(ctx, c, b.label, x + (i === 2 ? 160 : 3), 454, { size: 26, display: true, bg: col, ink: inkOn(c, col) });
      pill(ctx, c, i === 2 ? 'thousands' : i === 1 ? 'about 50' : '26', x + (i === 2 ? 160 : 3), 494, { size: 28, display: true, bg: c.bgSurface, ink: c.label });
    });
  }

  _roots(ctx, c, t) {
    const lit = this.tl.lit()[0], size = 250, y = 100, k = outBack(clamp(t / 0.3, 0, 1));
    if (!lit) { // no chip: all three, old form above today's form
      pill(ctx, c, 'Three signs', W / 2, 44, { size: 34, display: true, bg: c.bgSurface, ink: c.label });
      SIGNS.forEach((g, i) => {
        const x = 40 + i * 212, s0 = 176;
        signTile(ctx, c, x, 90, s0, 'bone'); drawSign(ctx, g.id, x + 28, 118, s0 - 56, mix(c.strata6, c.strata3, 0.2), 8, 0);
        signTile(ctx, c, x, 290, s0, 'paper'); drawSign(ctx, g.id, x + 28, 318, s0 - 56, c.strata6, 13, 1);
      });
      return;
    }
    pill(ctx, c, SIGNS.find((g) => g.id === lit).label, W / 2, 44, { size: 36, display: true, bg: c.bgSurface, ink: c.label });
    ctx.save(); ctx.globalAlpha = clamp(k, 0, 1);
    signTile(ctx, c, 60, y, size, 'bone'); drawSign(ctx, lit, 96, y + 36, size - 72, mix(c.strata6, c.strata3, 0.2), 11, 0);
    signTile(ctx, c, 370, y, size, 'paper'); drawSign(ctx, lit, 406, y + 36, size - 72, c.strata6, 20, 1);
    ctx.restore();
    pill(ctx, c, 'Old form', 185, 400, { size: 28, display: true, bg: c.s2 });
    pill(ctx, c, 'Today', 495, 400, { size: 28, display: true, bg: c.s1 });
    pill(ctx, c, 'Now find two more', W / 2, 468, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
  }
}
