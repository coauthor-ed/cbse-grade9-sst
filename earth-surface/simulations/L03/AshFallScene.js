// AshFallScene - a drawn section of an eruption: magma below, a column of ash and gas, coarse pieces landing
// near, fine ash drifting further, grey settling on roofs and trees. No people and no named event.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01, outBack, drawBackdrop, mulberry32, rr } from 'simulations/base/kit/SimLook.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawHotRock, drawEarthSky, drawTree, drawFlowArrow, roughen } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const BASE = 380, VX = 230, TOP = 170;

export class AshFallScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static ARIA_LABEL = 'A section through an erupting volcano. Magma rises from below, a column of ash goes up, and grey ash falls on the roofs and trees of the land nearby.';

  constructor(container, config) { super(container, config); this._s = 0; }
  enter(stage) { this._s = stage; }
  busy() { return this.age < 1; }

  _house(ctx, c, x, y, s, grey) {
    const ink = earthColour(c, 'ink'), ash = earthColour(c, 'slateLit');
    ctx.save();
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = mix(c.strata1, ash, grey); ctx.strokeStyle = ink; ctx.lineWidth = 3;
    ctx.fillRect(-30, -40, 60, 40); ctx.strokeRect(-30, -40, 60, 40);
    ctx.fillStyle = mix(c.strata3, ash, grey);
    ctx.beginPath(); ctx.moveTo(-38, -40); ctx.lineTo(0, -68); ctx.lineTo(38, -40); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = mix(earthColour(c, 'bark'), ash, grey); ctx.fillRect(-9, -24, 18, 24);
    ctx.restore();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this._s, ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow');
    const fall = s === 0 ? 0 : clamp01(this.age / 0.8), grey = s === 0 ? 0 : 0.86 * fall;
    drawEarthSky(ctx, c, 0, 0, 680, 400, { dusk: 0.14 });
    // ground
    // a cone's layers of ash and lava lie along its slopes; the rock under it lies flat
    drawRock(ctx, c, [[-10, BASE], [690, BASE - 4], [690, 530], [-10, 530]], { seed: 4, bands: ['strata3', 'strata2', 'strata4'], bandH: 40, cracks: 8, grain: false, lit: false });
    drawRock(ctx, c, roughen([[VX - 210, BASE + 2], [VX - 30, TOP], [VX, TOP], [VX, BASE + 2]], { amp: 3, seed: 4, step: 26 }), { seed: 4, bands: ['strata5', 'strata6'], bandH: 30, dip: -48, cracks: 4, grain: false });
    drawRock(ctx, c, roughen([[VX, TOP], [VX + 30, TOP], [VX + 210, BASE + 2], [VX, BASE + 2]], { amp: 3, seed: 6, step: 26 }), { seed: 6, bands: ['strata5', 'strata6'], bandH: 30, dip: 48, cracks: 4, grain: false });
    // conduit and magma
    ctx.save(); ctx.fillStyle = c.magma; ctx.strokeStyle = ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(VX - 16, TOP + 4); ctx.lineTo(VX + 16, TOP + 4); ctx.lineTo(VX + 24, 440); ctx.lineTo(VX - 24, 440); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    drawHotRock(ctx, c, [[VX - 120, 440], [VX - 60, 416], [VX + 60, 416], [VX + 130, 446], [VX + 90, 500], [VX - 90, 500]], { seed: 3, glow: 0.8 });
    // column
    const k = outBack(clamp01(this.age / 0.7)), rnd = mulberry32(7);
    ctx.save();
    for (let i = 0; i < 26; i++) {
      const u = i / 25, y = TOP - 12 - u * 150 * k, x = VX + (rnd() - 0.5) * (30 + u * 150) + u * 34, r = 14 + u * 26 + rnd() * 10;
      ctx.fillStyle = mix(earthColour(c, 'slateDark'), earthColour(c, 'slateLit'), rnd());
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    // the cloud trails away with the wind; ash falls from it
    for (let i = 0; i < 16; i++) {
      const u = i / 15, x = VX + 60 + u * 390 * Math.max(fall, 0.12), y = 44 + (rnd() - 0.5) * 34 + u * 16;
      ctx.fillStyle = mix(earthColour(c, 'slateDark'), earthColour(c, 'slateLit'), 0.3 + rnd() * 0.7);
      ctx.beginPath(); ctx.arc(x, y, 22 - u * 6, 0, 7); ctx.fill();
    }
    ctx.restore();
    if (s >= 1) {
      ctx.save();
      for (let i = 0; i < 120; i++) {
        const u = rnd(), x = VX + 90 + u * 380, y = 80 + rnd() * (BASE - 90);
        ctx.fillStyle = earthColour(c, 'slate');
        ctx.globalAlpha = fall * (0.4 + rnd() * 0.5);
        ctx.beginPath(); ctx.arc(x, y, u < 0.3 ? 4.5 : 2.4, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    for (const [x, sz] of [[468, 0.9], [640, 1]]) drawTree(ctx, c, x, BASE - 2, sz, { kind: 'round', seed: x, alpha: 1 });
    if (grey > 0) for (const [x, sz] of [[468, 0.9], [640, 1]]) {
      ctx.save(); ctx.globalAlpha = grey * 0.8; ctx.fillStyle = earthColour(c, 'slateLit');
      ctx.beginPath(); ctx.arc(x, BASE - 2 - 60 * sz, 34 * sz, 0, 7); ctx.fill(); ctx.restore();
    }
    this._house(ctx, c, 546, BASE, 1.1, grey);
    if (grey > 0) { ctx.save(); ctx.fillStyle = earthColour(c, 'slateLit'); rr(ctx, 440, BASE - 8, 250, 12 * fall, 5); ctx.fill(); ctx.restore(); }
    const tag = (t, x, y, o = {}) => pill(ctx, c, t, x, y, { bg: ink, ink: snow, size: 26, display: true, ...o });
    if (s === 0) { tag('Magma', VX, 470, { bg: snow, ink }); tag('Rock, gas and ash', 500, 150); }
    if (s === 1) { tag('Tephra falls', 520, 150, { bg: c.gold, ink }); tag('Grey ash on roofs and trees', 400, 480, { size: 25 }); }
    if (s === 2) {
      drawFlowArrow(ctx, c, VX + 70, 430, VX + 70, 200, { col: c.warning, w: 13 });
      tag('From deep below', 480, 300, { bg: c.gold, ink });
      tag('Magma', VX, 470, { bg: snow, ink });
    }
  }
}
