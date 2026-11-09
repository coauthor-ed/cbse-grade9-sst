// BuildTheLandformScene ("Label the river") - three pictures: a meander, a delta, a whole river. Tap a label, tap its
// number. Control names: .lab[data-l], .spot[data-s], .next. No timer. Wins through finishGame.
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { svgWater, svgRock, svgSnow } from '../shared/EarthArt.js';
import { ec, strand, shape } from '../L04/EarthBits.js';
import { meanderLine, toPath, water, neck, normal, outerSign } from './RiverArt.js';
import { mountLabels } from './LabelRounds.js';

const frame = (b, g) => `<svg viewBox="0 0 320 200" aria-hidden="true"><rect width="320" height="200" style="fill:${ec(g)}"/>${b}</svg>`;
const MLINE = meanderLine({ x: -10, y: 100, len: 340, cross: 122, vertical: false }, 2.05, 2);
const at = (t, off) => { const i = Math.round((MLINE.length - 1) * t), p = MLINE[i], [nx, ny] = normal(p), o = outerSign(MLINE, t); return { x: +((p[0] + nx * o * off) / 3.2).toFixed(1), y: +((p[1] + ny * o * off) / 2).toFixed(1) }; };
function meanderPic() {
  const line = MLINE, nk = neck(line);
  const lake = toPath(line.slice(nk.i + 6, nk.j - 5)), main = [...toPath(line.slice(0, nk.i + 1)), ...toPath(line.slice(nk.j))];
  return frame(strand(lake, 'soilDark', 15) + strand(lake, 'seaFar', 11) + water(main, 15), 'grass');
}
function deltaPic() {
  let b = svgWater([[-5, 70], [325, 70], [325, 205], [-5, 205]], { t: 2, ripples: 5 });
  b += shape([[-5, -5], [325, -5], [325, 74], [250, 72], [160, 70], [70, 72], [-5, 74]], { f: 'grass', s: 'grassDark' });
  b += shape([[86, 72], [90, 124], [130, 160], [190, 160], [230, 124], [234, 72]], { f: 'grassLit', s: 'sandDark', w: 3 });
  b += strand([[160, -5], [160, 72]], 'sea', 14);
  for (const e of [[104, 142], [134, 170], [160, 174], [186, 170], [216, 142]]) b += strand([[160, 70], [(160 + e[0]) / 2, 112], e], 'sea', 6);
  return frame(b, 'grass');
}
function coursePic() {
  let b = svgRock([[-5, 40], [40, 24], [90, 90], [150, 130], [230, 150], [300, 156], [300, 205], [-5, 205]], { seed: 6, fill: 'rock', cracks: 3, outline: true });
  b = svgWater([[280, 154], [325, 154], [325, 205], [280, 205]], { t: 1, ripples: 2 }) + b + svgSnow([[14, 34], [40, 24], [60, 50], [34, 54]], { seed: 2 });
  b += strand([[52, 56], [90, 92], [150, 132], [230, 152], [296, 158]], 'seaDeep', 8) + strand([[52, 56], [90, 92], [150, 132], [230, 152], [296, 158]], 'sea', 4);
  return frame(b, 'skyLow');
}
const ROUNDS = [
  { title: 'a meander', pic: meanderPic(), spots: [
    { id: 'ox', label: 'Oxbow lake', ...at(.5, 0), no: 'That part is not cut off from the river.', yes: 'Right: an old loop left behind.' },
    { id: 'steep', label: 'Steep bank', ...at(.75, 14), no: 'A steep bank is on the outside of a bend, where the river cuts.', yes: 'Right: the outside of a bend is cut.' },
    { id: 'bar', label: 'Bar', ...at(.25, -32), no: 'A bar lies on the inside of a bend, where the water is slow.', yes: 'Right: slow water drops sediment here.' },
  ] },
  { title: 'a delta', pic: deltaPic(), spots: [
    { id: 'riv', label: 'River', x: 50, y: 12, no: 'The river arrives from upstream as one channel.', yes: 'Right.' },
    { id: 'dis', label: 'Distributary', x: 33, y: 60, no: 'A distributary is a smaller channel that splits from the river.', yes: 'Right: a smaller channel.' },
    { id: 'isl', label: 'Islands/Bars', x: 52, y: 80, no: 'Islands and bars are the new land between channels.', yes: 'Right: new land between channels.' },
    { id: 'sea', label: 'Sea', x: 88, y: 88, no: 'The sea lies beyond the land.', yes: 'Right.' },
  ] },
  { title: 'a whole river', pic: coursePic(), spots: [
    { id: 'v', label: 'V-shaped valley', x: 26, y: 38, no: 'V-shaped valleys are cut on steep ground high up.', yes: 'Right: steep ground, strong cutting.' },
    { id: 'mea', label: 'Meander', x: 56, y: 62, no: 'Meanders form where the land gets gentler.', yes: 'Right: gentler land, wide bends.' },
    { id: 'del', label: 'Delta', x: 90, y: 72, no: 'A delta forms at the mouth of a river.', yes: 'Right: at the mouth.' },
  ] },
];

export class BuildTheLandformScene extends GameBoard {
  static ARIA_LABEL = 'A game: label a meander, a delta and a whole river. Tap a label, then tap its number on the picture.';
  static OBJECTIVE = { prompt: { en: 'Label a meander and a delta, then place each landform along the river.' } };
  static HEIGHT = 332;
  async setup() { await super.setup(); mountLabels(this, 'Label the river', ROUNDS); }
  checkObjective() { return this._lr?.won ? { ok: true } : null; }
  resetChallenge() { super.resetChallenge(); this._lrShow?.(); }
}
