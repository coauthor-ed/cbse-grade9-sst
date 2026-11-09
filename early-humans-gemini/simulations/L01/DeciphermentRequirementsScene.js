// DeciphermentRequirementsScene - L01 s06. Three locks along the top, one idea per beat beneath.
// Left side: what scripts we can read had. Right side: what the Sindhu lipi has.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { rr, alpha, mix, darken, pill, font, outBack, clamp01, drawBackdrop, drawCard } from 'simulations/base/kit/SimLook.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_OPEN = 0, S_KEY = 1, S_SHORT = 2, S_LANG = 3, S_YOURS = 4;
const LOCKS = ['known script', 'enough writing', 'the language'];

// Five signs in the manner of a seal line: plain strokes, each drawn from its own path. No reading is implied.
const SIGNS = [
  (g, s) => { g.moveTo(-s, 0); g.quadraticCurveTo(0, -s, s, 0); g.quadraticCurveTo(0, s, -s, 0); g.moveTo(s * 0.9, 0); g.lineTo(s * 1.3, -s * 0.5); g.moveTo(s * 0.9, 0); g.lineTo(s * 1.3, s * 0.5); },
  (g, s) => { g.moveTo(-s * 0.7, -s); g.lineTo(s * 0.7, -s); g.lineTo(s * 0.4, s); g.lineTo(-s * 0.4, s); g.closePath(); g.moveTo(-s * 0.6, -s * 0.4); g.lineTo(s * 0.6, -s * 0.4); },
  (g, s) => { g.moveTo(0, -s); g.lineTo(0, s); g.moveTo(-s, -s * 0.2); g.lineTo(s, -s * 0.2); g.moveTo(-s * 0.7, s); g.lineTo(0, s * 0.2); g.lineTo(s * 0.7, s); },
  (g, s) => { for (const x of [-0.7, -0.24, 0.24, 0.7]) { g.moveTo(x * s, -s); g.lineTo(x * s, s); } },
  (g, s) => { g.moveTo(-s, s); g.lineTo(-s, -s); g.lineTo(s, -s); g.lineTo(s, s); g.moveTo(-s * 0.4, s); g.lineTo(-s * 0.4, -s * 0.2); g.lineTo(s * 0.4, -s * 0.2); g.lineTo(s * 0.4, s); },
];

export class DeciphermentRequirementsScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'A Sindhu seal with five signs, and three locks: a text with a known script, enough writing, and the language. Each beat compares what scripts we can read had with what the Sindhu lipi has. The last beat shows three open locks for cuneiform and hieroglyphs and three shut locks for the Sindhu lipi.';

  busy() { return this.age < 1.4; }

  _lock(ctx, c, x, y, s, open, lit, dim = 1) {
    const col = open ? c.good : lit ? c.gold : mix(c.track, c.label, 0.28);
    ctx.save(); ctx.globalAlpha *= dim; ctx.translate(x, y);
    ctx.lineWidth = s * 0.24; ctx.lineCap = 'round'; ctx.strokeStyle = darken(col, 0.3);
    ctx.beginPath();
    if (open) { ctx.moveTo(s * 0.62, -s * 0.1); ctx.lineTo(s * 0.62, -s * 0.5); ctx.arc(s * 0.06, -s * 0.5, s * 0.56, 0, Math.PI, true); ctx.lineTo(-s * 0.5, -s * 0.42); }
    else { ctx.moveTo(s * 0.56, -s * 0.1); ctx.lineTo(s * 0.56, -s * 0.5); ctx.arc(0, -s * 0.5, s * 0.56, 0, Math.PI, true); ctx.lineTo(-s * 0.56, -s * 0.1); }
    ctx.stroke();
    rr(ctx, -s * 0.9, -s * 0.1 + 4, s * 1.8, s * 1.24, s * 0.2); ctx.fillStyle = darken(col, 0.35); ctx.fill();
    rr(ctx, -s * 0.9, -s * 0.1, s * 1.8, s * 1.24, s * 0.2); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = darken(col, 0.6); ctx.beginPath(); ctx.arc(0, s * 0.36, s * 0.17, 0, 6.3); ctx.fill(); ctx.fillRect(-s * 0.06, s * 0.36, s * 0.12, s * 0.4);
    ctx.restore();
  }

  _top(ctx, c, lit) {
    LOCKS.forEach((t, i) => {
      const x = 118 + i * 222;
      this._lock(ctx, c, x, 42, 20, false, lit === i, lit == null || lit === i ? 1 : 0.5);
      pill(ctx, c, t, x, 88, { size: 25, bg: lit === i ? c.gold : c.bgSurface, ink: lit === i ? undefined : c.label, display: true });
    });
  }

  _seal(ctx, c, x, y, s) {
    const col = mix(c.strata5, c.strata1, 0.35);
    rr(ctx, x - s, y - s + 6, s * 2, s * 2, s * 0.14); ctx.fillStyle = darken(col, 0.4); ctx.fill();
    rr(ctx, x - s, y - s, s * 2, s * 2, s * 0.14); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = darken(col, 0.45); ctx.lineWidth = 3; ctx.stroke();
    this._signs(ctx, c, x, y - s * 0.62, s * 0.155, darken(col, 0.62), 5);
    // The bull in profile, plain and low on the seal.
    const b = s * 0.86, ink = darken(col, 0.55);
    ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(x + b * 0.06, y + s * 0.3, b * 0.56, b * 0.27, 0, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - b * 0.62, y + s * 0.16, b * 0.17, b * 0.14, -0.4, 0, 6.3); ctx.fill();
    ctx.lineWidth = s * 0.05; ctx.strokeStyle = ink; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - b * 0.66, y + s * 0.04); ctx.quadraticCurveTo(x - b * 0.5, y - s * 0.16, x - b * 0.3, y - s * 0.06); ctx.stroke();
    for (const lx of [-0.34, -0.2, 0.3, 0.44]) { ctx.beginPath(); ctx.moveTo(x + b * lx, y + s * 0.42); ctx.lineTo(x + b * lx, y + s * 0.8); ctx.stroke(); }
  }

  _signs(ctx, c, x, y, s, col, n) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = Math.max(3, s * 0.2); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 0; i < n; i++) { const sx = x + (i - (n - 1) / 2) * s * 3; ctx.save(); ctx.translate(sx, y); ctx.beginPath(); SIGNS[i % 5](ctx, s); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }

  _pair(ctx, c, leftName, rightName, left, right) {
    const a = { x: 14, w: 320 }, b = { x: 346, w: 320 }, y = 120, h = 386;
    [a, b].forEach((p, i) => {
      drawCard(ctx, c, p.x, y, p.w, h);
      ctx.font = font(c, 700, 28, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(i ? rightName : leftName, p.x + p.w / 2, y + 34);
    });
    const k = outBack(clamp01(this.age / 0.45));
    ctx.save(); ctx.translate(a.x + a.w / 2, y + 210); ctx.scale(k, k); left(0, 0); ctx.restore();
    ctx.save(); ctx.translate(b.x + b.w / 2, y + 210); ctx.scale(k, k); right(0, 0); ctx.restore();
  }

  _tablet(ctx, c, x, y, w, h, bands) {
    const col = mix(c.strata5, c.bgSurface, 0.15);
    rr(ctx, x - w / 2, y - h / 2 + 5, w, h, 12); ctx.fillStyle = darken(col, 0.4); ctx.fill();
    rr(ctx, x - w / 2, y - h / 2, w, h, 12); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = darken(col, 0.5); ctx.lineWidth = 3; ctx.stroke();
    bands(col);
  }

  draw(ctx, c) {
    const st = this.stage;
    drawBackdrop(ctx, c, 'dots');
    if (st === S_OPEN) {
      this._top(ctx, c, null);
      const k = outBack(clamp01(this.age / 0.5));
      ctx.save(); ctx.translate(340, 306); ctx.scale(k, k); this._seal(ctx, c, 0, 0, 180); ctx.restore();
      return;
    }
    if (st === S_YOURS) {
      this._top(ctx, c, null);
      const rows = [['Cuneiform', true], ['Hieroglyphs', true], ['Sindhu lipi', false]];
      rows.forEach(([name, open], r) => {
        const y = 128 + r * 130;
        drawCard(ctx, c, 14, y, 652, 118);
        pill(ctx, c, name, 110, y + 59, { size: 25, bg: open ? c.good : c.gold, display: true });
        [0, 1, 2].forEach((i) => this._lock(ctx, c, 276 + i * 150, y + 54, 26, open, false));
      });
      return;
    }
    this._top(ctx, c, st - 1);
    if (st === S_KEY) {
      this._pair(ctx, c, 'Scripts we read', 'Sindhu lipi',
        () => this._tablet(ctx, c, 0, 0, 260, 250, (col) => {
          const ink = darken(col, 0.62);
          [-1, 0, 1].forEach((r) => {
            ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
            for (let i = 0; i < 9; i++) { const x = -102 + i * 25, y = r * 76; ctx.beginPath();
              if (r === -1) { ctx.arc(x, y, 8, 0, 6.3); } else if (r === 0) { ctx.moveTo(x - 7, y - 10); ctx.lineTo(x + 7, y + 10); ctx.moveTo(x + 7, y - 10); ctx.lineTo(x, y); } else { ctx.moveTo(x, y - 11); ctx.lineTo(x, y + 11); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); }
              ctx.stroke(); }
          });
          [-38, 38].forEach((y) => { ctx.fillStyle = alpha(ink, 0.5); ctx.fillRect(-116, y - 1.5, 232, 3); });
        }),
        () => {
          ctx.setLineDash([14, 12]); rr(ctx, -130, -125, 260, 250, 12); ctx.strokeStyle = c.labelMuted; ctx.lineWidth = 4; ctx.stroke(); ctx.setLineDash([]);
          ctx.font = font(c, 700, 32, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.fillText('none found', 0, 0);
        });
    } else if (st === S_SHORT) {
      this._pair(ctx, c, 'A long text', 'Sindhu lipi',
        () => this._tablet(ctx, c, 0, 0, 260, 270, (col) => {
          ctx.strokeStyle = darken(col, 0.6); ctx.lineWidth = 5; ctx.lineCap = 'round';
          for (let r = 0; r < 8; r++) for (let i = 0; i < 12; i++) { const x = -108 + i * 20, y = -110 + r * 31; ctx.beginPath(); ctx.moveTo(x - 5, y - 8); ctx.lineTo(x + 5, y + 8); ctx.moveTo(x + 5, y - 8); ctx.lineTo(x, y); ctx.stroke(); }
        }),
        () => {
          const col = mix(c.strata5, c.strata1, 0.35);
          this._signs(ctx, c, 0, -30, 16, darken(col, 0.62), 5);
          pill(ctx, c, 'about 5 signs', 0, 66, { size: 30, bg: c.gold, display: true });
        });
    } else if (st === S_LANG) {
      this._pair(ctx, c, 'Cuneiform', 'Sindhu lipi',
        () => {
          this._bubble(ctx, c, 0, -20, c.good);
          ctx.font = font(c, 700, 30, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('known', 0, -36); ctx.fillText('languages', 0, -2);
        },
        () => {
          this._bubble(ctx, c, 0, -20, c.gold);
          ctx.font = font(c, 700, 84, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('?', 0, -18);
        });
    }
  }

  _bubble(ctx, c, x, y, col) {
    const f = mix(col, c.bgSurface, 0.55);
    ctx.beginPath(); ctx.ellipse(x, y, 130, 92, 0, 0, 6.3); ctx.moveTo(x - 50, y + 80); ctx.lineTo(x - 76, y + 136); ctx.lineTo(x - 6, y + 90);
    ctx.fillStyle = f; ctx.fill(); ctx.strokeStyle = darken(f, 0.45); ctx.lineWidth = 3; ctx.stroke();
  }
}
