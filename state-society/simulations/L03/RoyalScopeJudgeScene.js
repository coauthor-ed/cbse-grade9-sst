import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { cardBox, HUD_H } from 'simulations/base/kit/ArcadeScene.js';
import { W, H, pill, rr, font, mix, alpha, outBack } from 'simulations/base/kit/SimLook.js';
import { ROYAL_SCOPE } from '../L01/StateSocietyDeck.js';

// Royal authority, true or false: seven statements, three true and four false,
// and two doors to choose between. Taught by L03 s04, s05.
//
// The deck is the third export in the chapter deck file; it is imported as it
// stands and nothing in it is changed here. L07's judge game takes the other
// skin (cards) and L01's game the other archetype, so this slide keeps the
// chapter's rotation.
export class RoyalScopeJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'Doors of royal authority: one statement about the power of a king at a time; open the TRUE door or the FALSE door before the candle burns down. Four of the seven are false.';
  static CONFIG = {
    ...ROYAL_SCOPE,
    title: 'Doors of Royal Authority',
    how: 'Four of the seven are false, so guessing one way never works. Open the TRUE door or the FALSE door before the candle burns down.',
    skin: 'doors',
    rounds: 12,
  };

  /**
   * The why card, tall enough for this deck's evidence.
   *
   * The engine's card is a fixed 250px whose budget is a two-line `why`. This
   * deck's whys run 57 to 131 characters and two of them wrap to three lines,
   * so the last line of evidence landed on top of the "tap to go on" hint in
   * both themes (round 1's sheet, bottom right). 300px, moved up to y 88 so
   * the taller card still clears the 520px stage: same card, same rim, same
   * pill, same progress bar, same 0.8s dismissal rule as the engine draws, only
   * the height and top are constants - so the card does not resize between one
   * mix-up and the next.
   *
   * The alternative was shortening the two long `why` strings, which would have
   * cut exactly the ideal-versus-description evidence - the outer ring against
   * the inner one, the claim reaching past the kingdom - that this drill exists
   * to install. Height is a drawing constant; the evidence is content.
   */
  _drawWhy(ctx, c) {
    const w = this.run.why;
    const k = Math.min(1, w.t / 0.25);
    ctx.fillStyle = alpha(c.bgDeep, 0.62 * k);
    ctx.fillRect(0, HUD_H, W, H - HUD_H);
    this.whyHint?.(ctx, c, w);
    const cw = 520, ch = 300, x = (W - cw) / 2, y = 88 + (1 - outBack(k)) * 30;
    ctx.save();
    ctx.globalAlpha = k;
    cardBox(ctx, c, x, y, cw, ch, w.lostLife ? c.bad : c.warning);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    pill(ctx, c, w.lostLife ? 'MISSED' : 'MIX-UP', W / 2, y, { bg: w.lostLife ? c.bad : c.warning, size: 28, display: true });
    ctx.font = font(c, 800, 28, true);
    ctx.fillStyle = c.label;
    const head = this.fitText(ctx, c, w.title, cw - 40, 24, 16, 800, true);
    head.lines.forEach((l, i) => { ctx.font = font(c, 800, head.size, true); ctx.fillText(l, W / 2, y + 42 + i * (head.size + 4)); });
    let yy = y + 50 + head.lines.length * (head.size + 4);
    if (w.answer) {
      const ans = this.fitText(ctx, c, w.answer, cw - 60, 20, 15, 800);
      const box = { x: x + 24, y: yy, w: cw - 48, h: ans.lines.length * (ans.size + 6) + 16 };
      ctx.fillStyle = mix(c.bgSurface, c.good, 0.22);
      rr(ctx, box.x, box.y, box.w, box.h, 12); ctx.fill();
      ctx.font = font(c, 800, ans.size);
      ctx.fillStyle = c.label;
      ans.lines.forEach((l, i) => ctx.fillText(l, W / 2, box.y + 8 + ans.size / 2 + 2 + i * (ans.size + 6)));
      yy = box.y + box.h + 10;
    }
    if (w.why) {
      const why = this.fitText(ctx, c, w.why, cw - 60, 17, 14, 700, false, 4);
      ctx.font = font(c, 700, why.size);
      ctx.fillStyle = c.labelMuted;
      why.lines.forEach((l, i) => ctx.fillText(l, W / 2, yy + why.size / 2 + i * (why.size + 5)));
    }
    const u = Math.min(1, w.t / w.dur);
    ctx.fillStyle = mix(c.bgSurface, c.stroke, 0.5);
    rr(ctx, x + 24, y + ch - 16, cw - 48, 6, 3); ctx.fill();
    ctx.fillStyle = w.lostLife ? c.bad : c.warning;
    rr(ctx, x + 24, y + ch - 16, (cw - 48) * (1 - u), 6, 3); ctx.fill();
    if (w.t >= 0.8) { ctx.font = font(c, 700, 28); ctx.fillStyle = c.labelMuted; ctx.fillText('tap to go on', W / 2, y + ch - 32); }
    ctx.restore();
    ctx.textAlign = 'left';
  }
}
