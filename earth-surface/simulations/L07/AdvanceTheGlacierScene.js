// AdvanceTheGlacierScene ("Read the glacier") - three pictures: a glacier with its moraines, bare ground after the ice,
// and a carved mountain. Tap a label, tap its number. Control names: .lab[data-l], .spot[data-s], .next. No timer.
import { GameBoard } from 'simulations/base/kit/GameFrame.js';
import { svgEarthSky } from '../shared/EarthArt.js';
import { mountLabels } from '../L05/LabelRounds.js';
import { moraineSvg, mountainSvg, MOUNT } from './IceArt.js';

const pic = (b, id) => `<svg viewBox="0 0 320 240" aria-hidden="true"><defs>${svgEarthSky(`ag-${id}`)}</defs><rect width="320" height="240" style="fill:url(#ag-${id})"/>${b}</svg>`;
const pct = ([u, v]) => ({ x: Math.round(u * 100), y: Math.round(v * 100) });
const ROUNDS = [
  { title: 'a glacier', pic: pic(moraineSvg(320, 240, {}), 'a'), spots: [
    { id: 'lat', label: 'Lateral moraine', x: 30, y: 65, no: 'A lateral moraine lies along the side of the glacier.', yes: 'Right: along the side.' },
    { id: 'med', label: 'Medial moraine', x: 50, y: 46, no: 'A medial moraine runs down the middle, where two glaciers join.', yes: 'Right: down the middle.' },
    { id: 'ter', label: 'Terminal moraine', x: 50, y: 88, no: 'A terminal moraine lies across the end of the glacier.', yes: 'Right: at the furthest reach.' },
  ] },
  { title: 'bare ground after the ice', pic: pic(moraineSvg(320, 240, { melt: 1 }), 'b'), spots: [
    { id: 'reach', label: 'Furthest reach of the ice', x: 48, y: 86, no: 'Look for the ridge lying across the valley.', yes: 'Right: the terminal moraine marks it.' },
    { id: 'edge', label: 'Old edge of the ice', x: 30, y: 62, no: 'Look for a ridge along the valley side.', yes: 'Right: a lateral moraine marks it.' },
  ] },
  { title: 'a carved mountain', pic: pic(mountainSvg(320, 240, {}), 'c'), spots: [
    { id: 'cq', label: 'Cirque', ...pct(MOUNT.cirque), no: 'A cirque is a bowl-shaped hollow.', yes: 'Right: a bowl at the head of a glacier.' },
    { id: 'ar', label: 'Arete', ...pct(MOUNT.arete), no: 'An arete is a sharp ridge.', yes: 'Right: a sharp ridge.' },
    { id: 'ps', label: 'Pass', ...pct(MOUNT.pass), no: 'A pass is a low gap in a ridge.', yes: 'Right: a low gap.' },
  ] },
];

export class AdvanceTheGlacierScene extends GameBoard {
  static ARIA_LABEL = 'A game: label the moraines of a glacier, read the ridges left on bare ground, and label a carved mountain.';
  static OBJECTIVE = { prompt: { en: 'Read the glacier, then place each moraine where it belongs.' } };
  static HEIGHT = 370;
  async setup() { await super.setup(); mountLabels(this, 'Read the glacier', ROUNDS); }
  checkObjective() { return this._lr?.won ? { ok: true } : null; }
  resetChallenge() { super.resetChallenge(); this._lrShow?.(); }
}
