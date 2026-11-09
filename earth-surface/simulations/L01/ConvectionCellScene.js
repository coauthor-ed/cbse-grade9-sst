// ConvectionCellScene - a pot of dal, then one slice of the mantle. The loop is the same; the speed is not.
// Hot rock rises under the place where plates part, and cool rock sinks where plates are drawn together.
// The plates ride the top of the loops. Nothing stops dead: there is no stop control.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, rr, outBack, clamp01, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawHotRock, drawEarthSky, drawFlowArrow } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const TOP = 132, BOT = 448;

export class ConvectionCellScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static ARIA_LABEL = 'A pot of dal with hot dal rising and cool dal sinking, then a slice of the mantle with the same loops turning very slowly under two plates that are pulled apart above the rising rock.';

  constructor(container, config) { super(container, config); this._s = 0; }
  enter(stage) { this._s = stage; }

  _pot(ctx, c) {
    const ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow'), hot = c.magma, cool = c.seaDeep;
    const x = 110, y = 110, w = 460, h = 280;
    // stove and flame
    ctx.save();
    ctx.fillStyle = earthColour(c, 'slateDark');
    rr(ctx, 70, 432, 540, 34, 12); ctx.fill();
    for (let i = 0; i < 7; i++) {
      const fx = 170 + i * 57;
      ctx.fillStyle = c.flame; ctx.beginPath(); ctx.moveTo(fx - 18, 432); ctx.quadraticCurveTo(fx - 12, 408, fx, 398); ctx.quadraticCurveTo(fx + 12, 408, fx + 18, 432); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.gold; ctx.beginPath(); ctx.moveTo(fx - 8, 432); ctx.quadraticCurveTo(fx - 5, 420, fx, 414); ctx.quadraticCurveTo(fx + 5, 420, fx + 8, 432); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = earthColour(c, 'metal'); rr(ctx, x - 16, y - 16, w + 32, h + 32, 26); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = mix(c.bgSurface, c.strata1, 0.2); rr(ctx, x, y, w, h, 16); ctx.fill();
    ctx.save(); rr(ctx, x, y, w, h, 16); ctx.clip();
    ctx.fillStyle = c.strata1; ctx.fillRect(x, y + 34, w, h);
    ctx.fillStyle = mix(c.strata1, c.magma, 0.34); ctx.fillRect(x, y + h - 74, w, 74);
    ctx.fillStyle = mix(c.strata1, c.strata2, 0.34); ctx.fillRect(x, y + 34, w, 16);
    ctx.restore();
    ctx.restore();
    const mid = 340, up = 184, dn = 344;
    for (const d of [-1, 1]) {
      drawFlowArrow(ctx, c, mid + d * 26, dn + 12, mid + d * 26, up + 8, { col: hot, w: 12, bend: 0 });
      drawFlowArrow(ctx, c, mid + d * 46, up - 16, mid + d * 186, up + 4, { col: mix(hot, cool, 0.5), w: 12, bend: d * 12 });
      drawFlowArrow(ctx, c, mid + d * 200, up + 24, mid + d * 200, dn + 6, { col: cool, w: 12 });
      drawFlowArrow(ctx, c, mid + d * 186, dn + 30, mid + d * 50, dn + 26, { col: mix(hot, cool, 0.5), w: 12, bend: d * 8 });
    }
    pill(ctx, c, 'Hot dal rises', 340, 44, { bg: hot, ink, size: 28, display: true });
    pill(ctx, c, 'Cool dal sinks', 150, 44, { bg: cool, ink: snow, size: 26, display: true });
    pill(ctx, c, 'Heat', 620, 416, { bg: ink, ink: snow, size: 26, display: true });
  }

  _mantle(ctx, c, s) {
    const ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow'), hot = c.magma, cool = c.seaDeep;
    drawEarthSky(ctx, c, 0, 0, 680, 90);
    drawHotRock(ctx, c, [[-10, TOP], [690, TOP], [690, BOT + 8], [-10, BOT + 8]], { seed: 7, glow: 0.3 });
    ctx.save();
    ctx.fillStyle = mix(hot, c.strata3, 0.66); ctx.fillRect(0, TOP, 680, 120);
    ctx.fillStyle = mix(hot, c.strata3, 0.44); ctx.fillRect(0, TOP + 120, 680, 110);
    ctx.fillStyle = mix(hot, c.gold, 0.2); ctx.fillRect(0, TOP + 230, 680, 90);
    ctx.fillStyle = mix(c.gold, c.elevPeak, 0.3);
    ctx.beginPath(); ctx.moveTo(0, 520); ctx.lineTo(0, 464); ctx.quadraticCurveTo(340, 424, 680, 464); ctx.lineTo(680, 520); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    const part = s === 2 ? 26 * outBack(clamp01(this.age / 0.8)) : 0;
    const plate = (pts, seed) => drawRock(ctx, c, pts, { seed, bands: ['strata5', 'strata2'], bandH: 15, cracks: 5, grain: false });
    const seam = s === 2 ? 8 : 0;
    plate([[-20, 74], [340 - seam - part, 80], [340 - seam - part, TOP], [-20, TOP]], 3);
    plate([[340 + seam + part, 80], [700, 74], [700, TOP], [340 + seam + part, TOP]], 5);
    if (s === 2 && part > 10) {
      ctx.save(); ctx.fillStyle = hot; ctx.fillRect(340 - part + 2, 96, 2 * part - 4, TOP - 96); ctx.restore();
    }
    const mid = 340, up = TOP + 44, dn = BOT - 30;
    for (const d of [-1, 1]) {
      drawFlowArrow(ctx, c, mid + d * 36, dn, mid + d * 36, up, { col: hot, w: 13 });
      drawFlowArrow(ctx, c, mid + d * 66, up - 18, mid + d * 250, up - 6, { col: mix(hot, cool, 0.45), w: 13, bend: d * 10 });
      drawFlowArrow(ctx, c, mid + d * 280, up + 30, mid + d * 280, dn, { col: cool, w: 13 });
      drawFlowArrow(ctx, c, mid + d * 256, dn + 16, mid + d * 74, dn + 14, { col: mix(hot, cool, 0.45), w: 13, bend: d * 10 });
    }
    const tag = (t, x, y, o = {}) => pill(ctx, c, t, x, y, { bg: ink, ink: snow, size: 26, display: true, ...o });
    if (s === 1) {
      tag('Hot rock rises', 340, 300, { bg: snow, ink });
      tag('Cool rock sinks', 110, 40, { bg: cool, ink: snow });
      tag('A few cm a year', 340, 40);
      tag('Plate', 170, 108); tag('Plate', 510, 108);
      tag('Heat from the core', 340, 490, { bg: snow, ink });
    } else {
      tag('Pulled apart', 340, 40, { bg: c.gold, ink });
      tag('Drawn together', 118, 40);
      tag('Drawn together', 562, 40);
      drawFlowArrow(ctx, c, 220, 108, 120, 108, { col: c.warning, w: 12 });
      drawFlowArrow(ctx, c, 460, 108, 560, 108, { col: c.warning, w: 12 });
      tag('Hot rock rises', 340, 300, { bg: snow, ink });
    }
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    if (this._s === 0) this._pot(ctx, c); else this._mantle(ctx, c, this._s);
  }
}
