/**
 * LibraryScene - L01 s01 "Five Books, Twenty Readers" (3 beats). Canvas, because the queue is SimFigure people.
 *   b0 setup:    5 copies of the storybook pop onto a shelf; 20 students queue in two rows; Meera (in her
 *                school uniform) is marked. Chips: "5 copies", "20 students".
 *   b1 rules:    a rule switch (host control, in sight): first come, lottery, take turns, buy more. The books
 *                fly from the shelf to the readers that rule picks; everyone else dims. Meera's marker says
 *                whether she reads now. Rest (cold start): first come, students 1-5 read, Meera waits.
 *                Lottery: a seeded draw (draw 1 is the same on every cold start; "Draw again" makes the next).
 *                Take turns: groups of 5; "Next turn" moves the books on (Meera reads in turn 3).
 *                Buy more: 5 more copies, with a cost tag; 10 read, 10 wait.
 *   b2 scarcity: "only 5 at a time" stays up while the scene walks through the four rules (1.3 s each) and
 *                comes to rest on "buy more": 10 at a time, the extra copies tagged "costs money" and
 *                "money that cannot buy other things". The switch still works.
 * Colours are tokens only (this.colors). Lottery uses the kit's seeded PRNG, never Math.random. ASCII only.
 */
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, pill, rr, alpha, mix, darken, clamp01, outBack, inOutSine, mulberry32, lerp } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { drawCivic } from 'simulations/base/kit/SimCivic.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const N = 20, COPIES = 5, MEERA = 12;
const RULES = ['first', 'lottery', 'turns', 'buy'];
const RULE_LABEL = { first: 'first come', lottery: 'lottery', turns: 'take turns', buy: 'buy more' };
const SHELF_Y = 140;               // the books stand on this line
const FRONT_Y = 482, BACK_Y = 430, FIG_H = 86, PITCH = 50;
const FLY_S = 0.55, FLY_LAG = 0.07;
const CYCLE_S = 1.3;               // beat 3: one rule every 1.3 s
const SW = 80, SH = 112;           // a student sprite, ground SH - 6

/** Five distinct students from a seeded generator. */
function drawLots(seed) {
  const r = mulberry32(seed), pool = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, COPIES).sort((a, b) => a - b);
}
/** Seeds for the draws; draw 1 is the first seed that gives Meera a copy (fixed, so a cold start is the same). */
const SEED0 = (() => { for (let s = 1; s < 500; s++) if (drawLots(s).includes(MEERA)) return s; return 1; })();
const seedOf = (k) => SEED0 + k * 7919;

/** Where student i stands: front row 0-9, back row 10-19 (half a step over, so faces show between). */
function spot(i) {
  const back = i >= 10, k = i % 10;
  return { x: (back ? 77 : 52) + k * PITCH, y: back ? BACK_Y : FRONT_Y, back };
}

export class LibraryScene extends SimScene {
  static WIDTH = 560;
  static HEIGHT = 500;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS_IN_SIGHT = true;
  static CONTROLS = [
    { id: 'rule', type: 'segmented', label: 'Rule', value: 'first',
      options: RULES.map((v) => ({ value: v, label: RULE_LABEL[v] })) },
    { id: 'draw', type: 'button', label: 'Draw again' },
    { id: 'turn', type: 'button', label: 'Next turn' },
  ];
  static ARIA_LABEL = 'A school library has 5 copies of a new storybook on a shelf. 20 students queue for it, Meera among them. Choose a rule: first come, a lottery, take turns, or buy more copies. Each rule gives the 5 books to different students. With 5 copies only 5 can read at one time, whatever the rule; buying 5 more copies lets 10 read, but that money cannot buy something else.';

  enter() {
    this.rule = 'first';
    this.lot = 0;
    this.turnNo = 0;
    this.ruleT = 0;
    this.cycling = this.stage === 2;
    this.prevRd = null;
    this.prevT = 0;
    if (!this.sprites) this.sprites = new Map();
  }

  /** Student i as a cached sprite (20 SimFigure people per frame are too slow to paint live). */
  sprite(ctx, c, i) {
    const t = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null;
    const s = Math.min(3, Math.max(1, Math.ceil((t ? Math.hypot(t.a || 0, t.b || 0) : 1) - 0.01)));
    const key = `${i}|${s}|${c.bgSurface}|${c.s1}`;
    let cv = this.sprites.get(key);
    if (cv === undefined) {
      cv = null;
      try {
        cv = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(SW * s, SH * s) : document.createElement('canvas');
        cv.width = SW * s; cv.height = SH * s;
        const g = cv.getContext('2d');
        if (!g) cv = null;
        else {
          g.setTransform?.(s, 0, 0, s, 0, 0);
          this.paintStudent(g, c, i, SW / 2, SH - 6);
        }
      } catch (_) { cv = null; }
      if (this.sprites.size > 80) this.sprites.clear();
      this.sprites.set(key, cv);
    }
    return cv;
  }

  paintStudent(g, c, i, x, y) {
    const look = i === MEERA ? { outfit: 'uniform', hairStyle: 'braid', top: mix(c.s1, c.bgSurface, 0.55), bottom: c.s5, bottomStyle: 'skirt' } : {};
    const spec = figureFor(this, { role: 'student', pose: 'stand', x, y, height: FIG_H, facing: 0, i: i === MEERA ? 3 : i + 5, look });
    drawFigure(g, c, spec, spec.look);
  }

  /** How bright student i is now: readers 1, the rest 0.42, crossfading for 0.35 s after a change. */
  litOf(i, rd) {
    if (this.stage === 0) return 1;
    const now = rd.includes(i) ? 1 : 0.42;
    if (!this.prevRd) return now;
    const was = this.prevRd.includes(i) ? 1 : 0.42;
    return lerp(was, now, inOutSine(clamp01((this.age - this.prevT) / 0.35)));
  }

  /** Remember who read before a change, so the dimming crossfades instead of jumping. */
  mark() { this.prevRd = this.readers(); this.prevT = this.age; }

  setRule(r) {
    if (!RULES.includes(r)) return;
    this.mark();
    this.rule = r;
    this.turnNo = 0;
    this.ruleT = this.age;
  }

  onControlChange(id, v) {
    if (this.stage === 0) return;
    this.cycling = false;
    if (id === 'rule') this.setRule(String(v));
    else if (id === 'draw' && this.rule === 'lottery') { this.mark(); this.lot += 1; this.ruleT = this.age; }
    else if (id === 'turn' && this.rule === 'turns') { this.mark(); this.turnNo = (this.turnNo + 1) % 4; this.ruleT = this.age; }
  }

  getControlValue(id) { return id === 'rule' ? this.rule : undefined; }

  isControlDisabled(id) {
    if (this.stage === 0) return true;
    if (id === 'draw') return this.rule !== 'lottery';
    if (id === 'turn') return this.rule !== 'turns';
    return false;
  }

  update() {
    if (!this.cycling) return;
    const k = Math.min(3, Math.floor(this.age / CYCLE_S));
    if (RULES[k] !== this.rule) { this.mark(); this.prevT = k * CYCLE_S; this.rule = RULES[k]; this.ruleT = k * CYCLE_S; }
    if (k === 3) this.cycling = false;
  }

  busy() {
    if (this.stage === 0) return this.age < 1.6;
    return this.cycling || this.age - this.ruleT < FLY_S + FLY_LAG * 10 + 0.5;
  }

  copies() { return this.stage > 0 && this.rule === 'buy' ? 10 : COPIES; }

  readers() {
    if (this.stage === 0) return [];
    if (this.rule === 'first') return [0, 1, 2, 3, 4];
    if (this.rule === 'lottery') return drawLots(seedOf(this.lot));
    if (this.rule === 'turns') return [0, 1, 2, 3, 4].map((j) => this.turnNo * 5 + j);
    return Array.from({ length: 10 }, (_, j) => j);
  }

  /** Book slot j on the shelf: { x, w }. */
  slot(j, n) {
    const w = n > 5 ? 42 : 58, pitch = n > 5 ? 49 : 70;
    return { x: 280 + (j - (n - 1) / 2) * pitch, w };
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const n = this.copies(), rd = this.readers(), t = this.age - this.ruleT;
    const fly = (j) => (this.stage === 0 ? 0 : inOutSine(clamp01((t - (n > 5 && j >= 5 ? 0.35 : 0) - j * FLY_LAG) / FLY_S)));

    // The shelf and its book slots.
    const sx0 = this.slot(0, n).x - 46, sx1 = this.slot(n - 1, n).x + 46;
    ctx.fillStyle = darken(c.s8, 0.25);
    rr(ctx, sx0, SHELF_Y + 4, sx1 - sx0, 14, 5); ctx.fill();
    ctx.fillStyle = mix(c.s8, c.bgSurface, 0.35);
    rr(ctx, sx0, SHELF_Y, sx1 - sx0, 12, 5); ctx.fill();
    for (let j = 0; j < n; j++) {
      const s = this.slot(j, n), h = s.w * 240 / 190;
      ctx.save(); ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.strokeStyle = alpha(c.stroke, 0.35);
      rr(ctx, s.x - s.w / 2, SHELF_Y - h, s.w, h, 6); ctx.stroke(); ctx.restore();
    }

    // The queue: back row first. Readers stay bright, everyone else dims once a rule is on.
    for (const back of [true, false]) {
      for (let i = 0; i < N; i++) {
        const p = spot(i);
        if (p.back !== back) continue;
        const u = this.stage === 0 ? clamp01((this.age - 0.6 - i * 0.02) / 0.4) : 1;
        ctx.save();
        ctx.globalAlpha *= u * this.litOf(i, rd);
        const cv = this.sprite(ctx, c, i);
        if (cv && typeof ctx.drawImage === 'function') ctx.drawImage(cv, p.x - SW / 2, p.y - SH + 6, SW, SH);
        else this.paintStudent(ctx, c, i, p.x, p.y);
        ctx.restore();
      }
    }

    // The books: on the shelf, or flying to a reader's hands.
    for (let j = 0; j < n; j++) {
      const s = this.slot(j, n);
      const pop = this.stage === 0 ? outBack(clamp01((this.age - j * 0.12) / 0.35)) : (n > 5 && j >= 5 ? outBack(clamp01((t - (j - 5) * 0.05) / 0.3)) : 1);
      if (pop <= 0) continue;
      const f = rd[j] != null ? fly(j) : 0;
      // A book starts where it was: in the hands of the reader before the change, else on the shelf.
      const was = this.prevRd && this.prevRd[j] != null ? spot(this.prevRd[j]) : null;
      const x0 = was ? was.x : s.x, y0 = was ? was.y - FIG_H * 0.36 : SHELF_Y, w0 = was ? 26 : s.w;
      let x = x0, y = y0, w = w0 * pop;
      if (rd[j] != null && (f > 0 || was)) {
        const p = spot(rd[j]);
        x = lerp(x0, p.x, f);
        y = lerp(y0, p.y - FIG_H * 0.36, f) - Math.sin(Math.PI * f) * 40;
        w = lerp(w0, 26, f);
      }
      drawCivic(ctx, c, 'book', x, y, { w });
    }

    // Meera's marker: who she is, and whether she reads now.
    const m = spot(MEERA), meeraReads = rd.includes(MEERA);
    const mText = this.stage === 0 ? 'Meera' : meeraReads ? 'Meera reads now' : 'Meera waits';
    pill(ctx, c, mText, m.x, m.y - FIG_H - 22, { size: 18, bg: this.stage > 0 && meeraReads ? c.good : c.accent });

    const C1 = 194, C2 = 238;
    if (this.stage === 0) {
      const a = clamp01((this.age - 0.7) / 0.3);
      pill(ctx, c, '5 copies', 280, C1, { size: 21, bg: c.bgSurface, ink: c.label, alpha: clamp01(this.age / 0.6) });
      pill(ctx, c, '20 students', 280, C2, { size: 21, bg: c.bgSurface, ink: c.label, alpha: a });
      return;
    }
    const ruleTxt = this.rule === 'turns' ? `take turns: turn ${this.turnNo + 1} of 4` : this.rule === 'lottery' ? `lottery: draw ${this.lot + 1}` : RULE_LABEL[this.rule];
    if (this.stage === 1) {
      pill(ctx, c, ruleTxt, 280, C1, { size: 21, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, `${rd.length} read now, ${N - rd.length} wait`, 280, C2, { size: 20, bg: c.accent });
    } else {
      const buy = this.rule === 'buy';
      pill(ctx, c, buy ? '10 at a time' : 'only 5 at a time', 280, C1, { size: 23, bg: c.warning });
      pill(ctx, c, buy ? 'that money cannot buy other things' : ruleTxt, 280, C2, { size: buy ? 20 : 20, bg: c.bgSurface, ink: c.label });
    }
    if (this.rule === 'buy') {
      // The cost tag over the 5 extra copies (money as words on a tag, no amount: the text gives none).
      const a = this.slot(5, 10).x, b = this.slot(9, 10).x, u = clamp01((t - 0.2) / 0.3);
      pill(ctx, c, '+5 copies: costs money', (a + b) / 2, 40, { size: 18, bg: c.warning, alpha: u,
        icon: (cx, x, y, r) => drawIcon(cx, c, 'coin', x, y, r, { tone: c.gold }) });
      // Each extra copy's slot keeps a coin: these copies were bought.
      for (let j = 5; j < 10; j++) drawIcon(ctx, c, 'coin', this.slot(j, 10).x, SHELF_Y - 26, 15 * u, { tone: c.gold });
      ctx.save(); ctx.globalAlpha *= u; ctx.strokeStyle = c.warning; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
      rr(ctx, a - 26, 64, b - a + 52, SHELF_Y - 62, 8); ctx.stroke(); ctx.restore();
    }
  }

  testState() { return { stage: this.stage, rule: this.rule, readers: this.readers().join(','), copies: this.copies(), meera: this.readers().includes(MEERA) }; }
}
