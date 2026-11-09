// VerseSourceScene - L09 blk-l09-s06, 3 beats. A verse on a palm leaf, the book's English word for word; then a verse beside a
// copper-plate grant, two kinds of source; then the plain statement of change. Evidence carries no face.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, rr, drawBackdrop, drawVignette } from 'simulations/base/kit/SimLook.js';
import { ease, seg, say, plate, sky } from './SstWorld.js';

const W = 680, H = 520;
const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const LINES = ['\u201CWhere women, verily, are honoured,', 'there gods rejoice;', 'where, however, they are not honoured,', 'there all sacred rites prove fruitless.\u201D'];

export class VerseSourceScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A palm-leaf page with the Manu-smriti verse. Then the verse beside a copper-plate land grant: one shows what an author held to be right, the other what one person did. Last, both sources under the words: position and roles changed over time.';
  static CONTROLS = [];

  busy() { return this.age < 1.2; }

  _leaf(ctx, c, x, y, w, h) {
    const col = mix(c.gold, c.bgSurface, 0.45);
    ctx.fillStyle = darken(col, 0.18); rr(ctx, x, y + 6, w, h, 16); ctx.fill();
    ctx.fillStyle = col; rr(ctx, x, y, w, h, 16); ctx.fill();
    ctx.fillStyle = darken(col, 0.34);
    ctx.beginPath(); ctx.arc(x + 22, y + h / 2, 7, 0, Math.PI * 2); ctx.arc(x + w - 22, y + h / 2, 7, 0, Math.PI * 2); ctx.fill();
  }

  _plate(ctx, c, x, y, w, h) {
    const cu = mix(c.s8, c.gold, 0.35);
    ctx.fillStyle = darken(cu, 0.24); rr(ctx, x, y + 6, w, h, 10); ctx.fill();
    ctx.fillStyle = cu; rr(ctx, x, y, w, h, 10); ctx.fill();
    ctx.fillStyle = darken(cu, 0.34);
    for (let r = 0; r < 5; r++) { rr(ctx, x + 22, y + 22 + r * ((h - 44) / 5), w - 44 - (r === 4 ? 70 : 0), 9, 3); ctx.fill(); }
    ctx.beginPath(); ctx.arc(x + w / 2, y + 8, 12, Math.PI, 0); ctx.fill();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, H);
    const s = this.stage ?? 0, a = this.age;
    if (s === 0) {
      this._leaf(ctx, c, 24, 112, W - 48, 310);
      plate(ctx, c, 'Manu-sm\u1E5Biti 3.56', W / 2, 62, { size: 30 });
      LINES.forEach((t, i) => say(ctx, c, t, W / 2, 180 + i * 58, { size: 28, a: ease(seg(a, i * 0.15, i * 0.15 + 0.4)), weight: 600, display: false }));
    } else {
      const top = s === 1 ? 110 : 90;
      this._leaf(ctx, c, 24, top, 300, 210);
      this._plate(ctx, c, 356, top, 300, 210);
      for (let r = 0; r < 4; r++) { ctx.fillStyle = mix(c.label, c.gold, 0.5); rr(ctx, 66, top + 40 + r * 36, 216 - (r === 3 ? 60 : 0), 12, 5); ctx.fill(); }
      plate(ctx, c, 'a verse', 174, top - 34, { size: 28 });
      plate(ctx, c, 'a land grant', 506, top - 34, { size: 28 });
      if (s === 1) {
        plate(ctx, c, 'an ideal', 174, top + 256, { size: 30, ink: c.s5ink });
        plate(ctx, c, 'an act by one person', 506, top + 256, { size: 28, ink: c.s8ink });
        say(ctx, c, 'Ask what each kind can show', W / 2, 462, { size: 30 });
      } else {
        const k = ease(seg(a, 0.2, 0.8));
        say(ctx, c, 'Position and roles of women:', W / 2, 368, { size: 30, a: k });
        say(ctx, c, 'fluctuated, even declined', W / 2, 416, { size: 36, a: k });
        say(ctx, c, 'as conditions changed', W / 2, 462, { size: 30, a: k });
      }
    }
    drawVignette(ctx, c, 0.25);
  }
}
