// EvidenceLimitsScene - L01 s04. Beat 1: what objects can answer, drawn. Beat 2: what they cannot, crossed tags.
// Beat 3: writing opens the crossed tags. Beat 4: 100 squares for the human past, true to the sum.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { rr, alpha, mix, darken, pill, font, outBack, clamp01, drawBackdrop, drawCard } from 'simulations/base/kit/SimLook.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { drawTool, drawBone } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_ASK = 0, S_SILENT = 1, S_WRITE = 2, S_SHARE = 3;
const PL = { x: 14, y: 14, w: 330, h: 492 }, PR = { x: 356, y: 14, w: 310, h: 492 };
const THINGS = [
  { id: 'bone', name: 'diet' }, { id: 'tool', name: 'tools' }, { id: 'shell', name: 'contact' },
  { id: 'post', name: 'house plan' }, { id: 'tooth', name: 'health' },
];
const SILENT = ['names', 'beliefs', 'who gave orders'];

export class EvidenceLimitsScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'Two big columns. The ground shows diet, tools, contact, house plans and health, each drawn as an object. The ground is silent on names, beliefs and who gave orders. Writing opens those tags. The last beat is a grid of 100 squares: more than 99 before writing, less than 1 after it.';

  busy() { return this.age < 1.8; }

  _thing(ctx, c, t, x, y) {
    if (t.id === 'bone') {
      drawBone(ctx, c, x, y - 4, 36, { rot: -0.3 });
      ctx.fillStyle = c.gold; for (const [a, b] of [[34, 22], [46, 12], [20, 26]]) { ctx.beginPath(); ctx.ellipse(x + a, y + b, 8, 5, 0.5, 0, 6.3); ctx.fill(); }
    }
    if (t.id === 'tool') drawTool(ctx, c, 'handaxe', x, y, 46, { rot: 0.4 });
    if (t.id === 'shell') {
      const col = mix(c.strata1, c.s4, 0.2);
      ctx.beginPath(); ctx.ellipse(x, y, 34, 46, 0.3, 0, 6.3); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = darken(col, 0.5); ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.translate(x, y); ctx.rotate(0.3); ctx.strokeStyle = darken(col, 0.6); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -36); ctx.quadraticCurveTo(5, 0, 0, 36); ctx.stroke();
      ctx.lineWidth = 3; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-8, i * 10); ctx.lineTo(8, i * 10); ctx.stroke(); }
      ctx.restore();
    }
    if (t.id === 'post') {
      ctx.fillStyle = mix(c.strata2, c.bgSurface, 0.3); rr(ctx, x - 62, y - 42, 124, 84, 10); ctx.fill();
      for (let i = 0; i < 6; i++) { const a = i % 3, b = i < 3 ? 0 : 1; ctx.fillStyle = darken(c.strata3, 0.45); ctx.beginPath(); ctx.ellipse(x - 44 + a * 44, y - 22 + b * 44, 11, 9, 0, 0, 6.3); ctx.fill(); }
    }
    if (t.id === 'tooth') {
      const col = mix(c.strata1, c.bgSurface, 0.6);
      ctx.beginPath(); ctx.moveTo(x - 26, y - 34); ctx.quadraticCurveTo(x, y - 46, x + 26, y - 34); ctx.quadraticCurveTo(x + 36, y - 6, x + 20, y + 6); ctx.lineTo(x + 14, y + 40); ctx.lineTo(x + 2, y + 12); ctx.lineTo(x - 10, y + 40); ctx.lineTo(x - 18, y + 6); ctx.quadraticCurveTo(x - 36, y - 6, x - 26, y - 34); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = darken(col, 0.5); ctx.lineWidth = 3; ctx.stroke();
    }
  }

  _left(ctx, c) {
    const st = this.stage;
    drawCard(ctx, c, PL.x, PL.y, PL.w, PL.h);
    ctx.font = font(c, 700, 30, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('The ground shows', PL.x + PL.w / 2, PL.y + 36);
    THINGS.forEach((t, i) => {
      const col = i % 2, row = i >> 1, cx = PL.x + 88 + col * 158 + (i === 4 ? 79 : 0), cy = 124 + row * 146;
      const k = st === S_ASK ? outBack(clamp01((this.age - i * 0.14) / 0.4)) : 1;
      if (k <= 0) return;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
      this._thing(ctx, c, t, cx, cy);
      ctx.restore();
      pill(ctx, c, t.name, cx, cy + 62, { size: 25, bg: c.raised, ink: c.label, display: true });
    });
  }

  _tag(ctx, c, text, x, y, w, open, k) {
    ctx.save(); ctx.translate(x + w / 2, y + 42); ctx.scale(k, k); ctx.translate(-x - w / 2, -y - 42);
    const col = open ? mix(c.good, c.bgSurface, 0.6) : mix(c.track, c.bgSurface, 0.3), h = 84;
    rr(ctx, x, y + 4, w, h, 18); ctx.fillStyle = darken(col, 0.3); ctx.fill();
    rr(ctx, x, y, w, h, 18); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = darken(col, 0.45); ctx.lineWidth = 3; ctx.stroke();
    ctx.font = font(c, 700, text.length > 10 ? 26 : 32, true); ctx.fillStyle = c.label; ctx.textAlign = open ? 'center' : 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, open ? x + w / 2 : x + 18, y + h / 2);
    if (!open) {          // a cross beside the word, never through it
      const bx = x + w - 34, by = y + h / 2;
      ctx.beginPath(); ctx.arc(bx, by, 21, 0, 6.3); ctx.fillStyle = c.bad; ctx.fill();
      ctx.strokeStyle = c.bgSurface; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx - 9, by - 9); ctx.lineTo(bx + 9, by + 9); ctx.moveTo(bx + 9, by - 9); ctx.lineTo(bx - 9, by + 9); ctx.stroke();
    }
    ctx.restore();
  }

  _right(ctx, c) {
    const st = this.stage;
    drawCard(ctx, c, PR.x, PR.y, PR.w, PR.h);
    ctx.font = font(c, 700, 30, true); ctx.fillStyle = st === S_ASK ? c.labelMuted : c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(st === S_WRITE ? 'Writing adds' : 'The ground is silent', PR.x + PR.w / 2, PR.y + 36);
    if (st === S_ASK) { ctx.font = font(c, 700, 90, true); ctx.fillStyle = alpha(c.labelMuted, 0.5); ctx.fillText('?', PR.x + PR.w / 2, 270); return; }
    const words = st === S_WRITE ? ['names', 'events', 'dates'] : SILENT;
    words.forEach((t, i) => {
      const k = outBack(clamp01((this.age - i * 0.2) / 0.4));
      if (k > 0) this._tag(ctx, c, t, PR.x + 22, 88 + i * 106, PR.w - 44, st === S_WRITE, k);
    });
    if (st === S_WRITE) {
      const k = outBack(clamp01((this.age - 0.5) / 0.4));
      if (k > 0) drawIcon(ctx, c, 'tablet', PR.x + PR.w / 2, 448, 46 * k, { tone: c.strata2 });
    }
  }

  _share(ctx, c) {
    const N = 10, S = 46, G = 3, X = 22, Y = 24;
    drawCard(ctx, c, 8, 8, 664, 504);
    const n = Math.floor(clamp01(this.age / 1.1) * 100);
    for (let i = 0; i < 100; i++) {
      const x = X + (i % N) * (S + G), y = Y + Math.floor(i / N) * (S + G);
      rr(ctx, x, y, S, S, 6);
      ctx.fillStyle = i < Math.min(n, 99) ? mix(c.strata2, c.bgSurface, 0.1) : alpha(c.track, 0.4); ctx.fill();
      if (i === 99) {
        // Writing's share: 5,000 of 3 million years is one sixth of this square, drawn so.
        ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = mix(c.strata2, c.bgSurface, 0.1); ctx.fillRect(x + 2, y + 2, S - 4, (S - 4) * 0.83);
        ctx.fillStyle = c.s1; ctx.fillRect(x + 2, y + 2 + (S - 4) * 0.83, S - 4, (S - 4) * 0.17);
      }
    }
    const R = 538;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.font = font(c, 700, 52, true); ctx.fillText('99+', R + 54, 120);
    ctx.font = font(c, 800, 25); ctx.fillText('in every 100', R + 54, 166); ctx.fillText('years: no', R + 54, 196); ctx.fillText('writing', R + 54, 226);
    ctx.font = font(c, 700, 34, true); ctx.fillStyle = c.label; ctx.fillText('under 1', R + 54, 330);
    ctx.font = font(c, 800, 25); ctx.fillText('with writing', R + 54, 372);
    ctx.strokeStyle = c.label; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(R + 54, 396); ctx.quadraticCurveTo(R + 54, 470, R - 14, 470); ctx.stroke();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (this.stage === S_SHARE) { this._share(ctx, c); return; }
    this._left(ctx, c); this._right(ctx, c);
  }
}
