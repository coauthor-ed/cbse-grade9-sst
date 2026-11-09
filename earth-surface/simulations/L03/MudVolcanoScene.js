// MudVolcanoScene - a low grey mound of mud after the book's photograph: a wet tongue, polygon cracks in the
// dry mud round it, a stick in the top, a fence behind. The cut below shows gas and water pushing clay up a crack.
// There is no magma in this drawing, because there is none at a mud volcano.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01, drawBackdrop, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawEarthSky, drawTree, drawFlowArrow } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }]];
const G = 300, CX = 330;

export class MudVolcanoScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static ARIA_LABEL = 'A low mound of grey mud with cracked dry mud around it. A cut below shows gas and pressure pushing water and clay up through a crack. There is no lava.';

  constructor(container, config) { super(container, config); this._s = 0; }
  enter(stage) { this._s = stage; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this._s, ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow');
    const mud = mix(earthColour(c, 'slate'), earthColour(c, 'slateLit'), 0.4), wet = earthColour(c, 'slateDark');
    drawEarthSky(ctx, c, 0, 0, 680, 200);
    for (const x of [40, 120, 560, 640]) drawTree(ctx, c, x, 200, 1.05, { kind: 'palm', seed: x });
    // fence
    ctx.save();
    ctx.strokeStyle = earthColour(c, 'bark'); ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let x = 20; x < 680; x += 80) { ctx.beginPath(); ctx.moveTo(x, 214); ctx.lineTo(x, 140); ctx.stroke(); }
    ctx.lineWidth = 5;
    for (const y of [160, 186]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(680, y); ctx.stroke(); }
    ctx.restore();
    // layers under
    drawRock(ctx, c, [[-10, G], [690, G], [690, 530], [-10, 530]], { seed: 6, bands: ['strata4', 'strata2', 'strata5'], bandH: 42, warp: 3, cracks: 6, grain: false, lit: false, outline: false });
    // dry mud flat with polygon cracks
    ctx.save();
    ctx.fillStyle = mud; ctx.fillRect(0, 200, 680, G - 200);
    ctx.strokeStyle = wet; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    const r = mulberry32(5);
    for (let i = 0; i < 26; i++) {
      const x = r() * 680, y = 214 + r() * 80, w = 34 + r() * 34, h = 10 + r() * 10;
      ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x - w * 0.4, y - h); ctx.lineTo(x + w * 0.5, y - h * 0.8); ctx.lineTo(x + w, y + 2); ctx.lineTo(x + w * 0.2, y + h); ctx.lineTo(x - w * 0.5, y + h * 0.9); ctx.closePath(); ctx.stroke();
    }
    // the mound and its wet tongue
    ctx.fillStyle = mix(mud, earthColour(c, 'snow'), 0.1); ctx.strokeStyle = ink; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(CX - 200, G - 8); ctx.quadraticCurveTo(CX - 130, 190, CX - 16, 178); ctx.lineTo(CX + 22, 178); ctx.quadraticCurveTo(CX + 130, 190, CX + 200, G - 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = wet;
    ctx.beginPath(); ctx.moveTo(CX - 8, 182); ctx.quadraticCurveTo(CX - 24, 232, CX - 100, 292); ctx.quadraticCurveTo(CX - 40, 300, CX + 30, 292); ctx.quadraticCurveTo(CX + 8, 236, CX + 14, 182); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.strokeStyle = earthColour(c, 'bark'); ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(CX + 18, 182); ctx.lineTo(CX + 52, 128); ctx.stroke(); ctx.restore();
    // bubbles at the top
    ctx.save(); ctx.fillStyle = mud; ctx.strokeStyle = ink; ctx.lineWidth = 3;
    for (const [x, y, q] of [[CX - 4, 170, 11], [CX + 12, 160, 7], [CX - 16, 156, 6]]) { ctx.beginPath(); ctx.arc(x, y, q, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    const tag = (t, x, y, o = {}) => pill(ctx, c, t, x, y, { bg: ink, ink: snow, size: 26, display: true, ...o });
    if (s === 0) {
      tag('Mud bubbles out', 520, 92, { bg: c.gold, ink });
      tag('No fire, no lava', 340, 420);
    } else {
      const k = clamp01(this.age / 0.6);
      ctx.save();
      ctx.strokeStyle = ink; ctx.lineWidth = 34; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const crack = () => { ctx.beginPath(); ctx.moveTo(CX + 4, 190); ctx.lineTo(CX - 10, G + 30); ctx.lineTo(CX + 18, G + 90); ctx.lineTo(CX - 6, 520); ctx.stroke(); };
      crack(); ctx.strokeStyle = wet; ctx.lineWidth = 26; crack();
      ctx.restore();
      ctx.save(); ctx.fillStyle = snow; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
      for (const [x, y, q] of [[CX - 4, 480, 9], [CX + 8, 430, 8], [CX + 4, 380, 7], [CX - 10, 330, 7], [CX - 2, 280, 6]]) { ctx.globalAlpha = k; ctx.beginPath(); ctx.arc(x, y, q, 0, 7); ctx.fill(); ctx.stroke(); }
      ctx.restore();
      drawFlowArrow(ctx, c, CX + 60, 500, CX + 60, 340, { col: c.warning, w: 13 });
      tag('Gas and pressure', 530, 420, { bg: c.gold, ink });
      tag('Water and clay', 150, 400);
      tag('No magma', 150, 470, { bg: snow, ink });
    }
  }
}
