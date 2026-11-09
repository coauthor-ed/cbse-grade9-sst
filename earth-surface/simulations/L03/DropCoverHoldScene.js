// DropCoverHoldScene - what to do. Beat 1: a room, three tap steps, Drop, Cover, Hold On. Beat 2: outdoors, open
// ground, away from buildings, walls and poles. Beat 3: before it happens. The advice is the slide's, word for word.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, rr, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { drawFigure } from 'simulations/base/kit/SimFigure.js';
import { EARTH_COLOR_MAP, earthColour, drawEarthSky, drawGrass, drawTree, drawFlowArrow, drawRock } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const FLOOR = 452;
const LOOK = { top: null, bottom: null, skin: 1, hairStyle: 'short', mood: 'calm' };

export class DropCoverHoldScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A student in a room drops to the floor, takes cover under a strong table and holds on. Outdoors, a person moves to open ground away from buildings and poles.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'step', label: 'Step', value: 'drop', options: [{ value: 'drop', label: 'Drop' }, { value: 'cover', label: 'Cover' }, { value: 'hold', label: 'Hold On' }] }];

  constructor(container, config) { super(container, config); this._b = 0; this._step = 'drop'; this._seen = new Set(); this._found = false; }
  enter(stage) { this._b = stage; this._step = 'drop'; this.requestUiUpdate?.(); }
  isControlHidden(id) { return id === 'step' && this._b !== 0; }
  getControlValue(id) { return id === 'step' ? this._step : super.getControlValue(id); }
  onControlChange(id, v) {
    if (id !== 'step') return;
    this._step = String(v); this._seen.add(this._step);
    if (this._seen.has('cover') && this._seen.has('hold') && !this._found) { this._found = true; this.celebrate(340, 330, 12, { key: 'drill' }); }
    this.animateFor?.(400); this.requestUiUpdate?.();
  }

  _room(ctx, c) {
    const wall = mix(c.strata1, c.elevPeak, 0.62), ink = earthColour(c, 'ink');
    ctx.save();
    ctx.fillStyle = wall; ctx.fillRect(0, 0, 680, FLOOR);
    ctx.fillStyle = earthColour(c, 'bark'); ctx.fillRect(0, FLOOR, 680, 70);
    ctx.fillStyle = earthColour(c, 'barkDark'); ctx.fillRect(0, FLOOR, 680, 8);
    ctx.fillStyle = mix(c.skyDay, c.elevPeak, 0.4); ctx.strokeStyle = ink; ctx.lineWidth = 4;
    rr(ctx, 40, 60, 150, 150, 8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(115, 60); ctx.lineTo(115, 210); ctx.moveTo(40, 135); ctx.lineTo(190, 135); ctx.stroke();
    ctx.restore();
  }
  _shelf(ctx, c, fixed) {
    const ink = earthColour(c, 'ink'), wood = earthColour(c, 'bark');
    ctx.save();
    ctx.fillStyle = wood; ctx.strokeStyle = ink; ctx.lineWidth = 4;
    rr(ctx, 540, 110, 110, FLOOR - 110, 6); ctx.fill(); ctx.stroke();
    for (const y of [190, 270, 350]) { ctx.beginPath(); ctx.moveTo(540, y); ctx.lineTo(650, y); ctx.stroke(); }
    for (const [x, y, k] of [[560, 176, 's1'], [588, 170, 's2'], [612, 180, 's3'], [566, 256, 's5'], [604, 250, 's6']]) { ctx.fillStyle = c[k]; rr(ctx, x - 9, y - 40, 20, 56, 3); ctx.fill(); ctx.stroke(); }
    if (fixed) { ctx.fillStyle = c.gold; ctx.fillRect(560, 92, 70, 24); ctx.strokeRect(560, 92, 70, 24); }
    ctx.restore();
  }
  _table(ctx, c, x, w) {
    const ink = earthColour(c, 'ink'), wood = earthColour(c, 'barkDark');
    ctx.save();
    ctx.fillStyle = earthColour(c, 'bark'); ctx.strokeStyle = ink; ctx.lineWidth = 4;
    rr(ctx, x, 260, w, 30, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = wood;
    for (const lx of [x + 16, x + w - 42]) { ctx.fillRect(lx, 290, 26, FLOOR - 290); ctx.strokeRect(lx, 290, 26, FLOOR - 290); }
    ctx.restore();
  }
  _person(ctx, c, x, pose, h, hands) {
    drawFigure(ctx, c, { x, y: FLOOR + 2, height: h, facing: -1, pose, hands }, { ...LOOK, top: c.s1, bottom: c.strata5 });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow');
    const tag = (t, x, y, o = {}) => pill(ctx, c, t, x, y, { bg: ink, ink: snow, size: 27, display: true, ...o });
    if (this._b === 0) {
      this._room(ctx, c); this._shelf(ctx, c, false); this._table(ctx, c, 220, 280);
      const st = this._step;
      if (st === 'drop') this._person(ctx, c, 150, { name: 'stand', crouch: 0.8 }, 250);
      if (st === 'cover') this._person(ctx, c, 372, { name: 'stand', crouch: 0.9 }, 186);
      if (st === 'hold') this._person(ctx, c, 340, { name: 'stand', crouch: 0.9 }, 186, [{ x: 254, y: 366 }, { x: 254, y: 392 }]);
      tag({ drop: 'Drop to the floor', cover: 'Cover your head', hold: 'Hold on to the table' }[st], 340, 44, { bg: c.gold, ink, size: 30 });
    }
    if (this._b === 1) {
      drawEarthSky(ctx, c, 0, 0, 680, 400);
      drawRock(ctx, c, [[-10, 400], [690, 400], [690, 530], [-10, 530]], { seed: 4, fill: 'grass', outline: false, grain: false, lit: false });
      drawGrass(ctx, c, 0, 402, 680, 402, { seed: 3, n: 60 });
      ctx.save();
      ctx.fillStyle = mix(c.strata1, c.elevPeak, 0.4); ctx.strokeStyle = ink; ctx.lineWidth = 4;
      rr(ctx, 30, 110, 170, 292, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = mix(c.skyDay, c.seaDeep, 0.3);
      for (const [x, y] of [[56, 140], [130, 140], [56, 220], [130, 220], [56, 300], [130, 300]]) { rr(ctx, x, y, 46, 54, 4); ctx.fill(); ctx.stroke(); }
      ctx.strokeStyle = ink; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(260, 402); ctx.lineTo(260, 120); ctx.moveTo(232, 142); ctx.lineTo(288, 142); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(288, 142); ctx.quadraticCurveTo(460, 190, 700, 120); ctx.stroke();
      ctx.restore();
      drawTree(ctx, c, 640, 402, 1.2, { kind: 'round', seed: 3 });
      drawFigure(ctx, c, { x: 470, y: 450, height: 220, facing: 0, pose: 'stand' }, { ...LOOK, top: c.s1, bottom: c.strata5 });
      drawFlowArrow(ctx, c, 300, 440, 396, 440, { col: c.warning, w: 13 });
      tag('Open ground', 470, 44, { bg: c.gold, ink, size: 30 });
      tag('Away from buildings and poles', 340, 494, { size: 25 });
    }
    if (this._b === 2) {
      this._room(ctx, c); this._shelf(ctx, c, true); this._table(ctx, c, 220, 280);
      tag('Fixed to the wall', 480, 44, { bg: c.gold, ink });
      tag('A strong table', 360, 228);
      tag('Know the way to open ground', 240, 490, { size: 25 });
    }
  }
}
