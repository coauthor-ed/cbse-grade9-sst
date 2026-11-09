// SocietyStateScene - L01 s00. Two worlds side by side: a village run by custom, an office of a
// kingdom run by law. Chips light the part each word names. See the design note.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, pill } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, hut, fire, tree, person, reading, palmLeaf } from '../shared/SstArt.js';

const CHIPS = [
  { id: 'society', label: 'Society', targets: ['village'] },
  { id: 'custom', label: 'Custom', targets: ['elder'] },
  { id: 'state', label: 'State', targets: ['office'] },
  { id: 'law', label: 'Law', targets: ['tablet'] },
];
const S_CLASS = 0, S_SOCIETY = 1, S_STATE = 2, S_FIRST = 3;
const MAP = [S_CLASS, S_SOCIETY, S_STATE, S_FIRST].map((idx) => [{ idx, dwellMs: null }]);
const LEFT = { x: 14, y: 16, w: 322, h: 488 }, RIGHT = { x: 344, y: 16, w: 322, h: 488 };

export class SocietyStateScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Two drawn panels side by side. On the left a village with huts, a fire and an elder speaking to the people. On the right an office of a kingdom with an officer at a desk and a written rule. Chips named Society, Custom, State and Law light the part each word names.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlDisabled(id) { return id === 'lit' && this.tl.disabled(); }

  enter(stage) {
    this.tl.set({ lit: stage === S_SOCIETY ? 'society' : stage === S_STATE ? 'state' : null });
  }

  _dimLeft() { const l = this.tl.lit(); if (l.length) return !l.includes('village') && !l.includes('elder'); return this.stage === S_FIRST ? false : false; }
  _dimRight() { const l = this.tl.lit(); if (l.length) return !l.includes('office') && !l.includes('tablet'); return this.stage === S_FIRST; }

  draw(ctx, c) {
    const p = pal(c), t = this.clock ?? 0;
    drawBackdrop(ctx, c, 'dots');
    const lit = this.tl.lit();
    // ---- the village
    panel(ctx, c, LEFT.x, LEFT.y, LEFT.w, LEFT.h, { fill: mix(c.bgSurface, c.s3, 0.12), lit: lit.includes('village'), off: this._dimLeft() });
    ctx.save();
    if (this._dimLeft()) ctx.globalAlpha = 0.34;
    rr(ctx, LEFT.x + 3, 250, LEFT.w - 6, 251, 16); ctx.fillStyle = p.grass; ctx.fill();
    tree(ctx, c, 56, 262, 1.5, 4); tree(ctx, c, 304, 268, 1.35, 9);
    hut(ctx, c, 122, 290, 1.75); hut(ctx, c, 244, 272, 1.4);
    fire(ctx, c, 176, 470, 0.9, t);
    person(ctx, this, { role: 'elder', x: 88, y: 482, height: 158, pose: 'point', facing: 1, i: 0, look: lit.includes('elder') ? { mood: 'happy' } : {} });
    person(ctx, this, { role: 'adult', x: 244, y: 486, height: 134, facing: -1, i: 1 });
    person(ctx, this, { role: 'child', x: 292, y: 490, height: 96, facing: -1, i: 2 });
    if (lit.includes('elder')) pill(ctx, c, 'custom', 104, 322, { size: 28, bg: c.accent });
    ctx.restore();
    reading(ctx, c, 'Village', LEFT.x + LEFT.w / 2, 62, 34, this._dimLeft() ? c.labelMuted : c.label);
    // ---- the office
    panel(ctx, c, RIGHT.x, RIGHT.y, RIGHT.w, RIGHT.h, { fill: mix(c.bgSurface, c.s8, 0.12), lit: lit.includes('office'), off: this._dimRight() });
    ctx.save();
    if (this._dimRight()) ctx.globalAlpha = 0.34;
    const X = RIGHT.x;
    // wall with pillars
    ctx.fillStyle = p.sand; ctx.fillRect(X + 3, 96, RIGHT.w - 6, 268);
    ctx.fillStyle = p.stone;
    for (const dx of [26, 262]) { rr(ctx, X + dx, 96, 34, 268, 6); ctx.fill(); ctx.fillStyle = p.stoneLight; ctx.fillRect(X + dx + 5, 96, 6, 268); ctx.fillStyle = p.stone; }
    rr(ctx, X + 3, 84, RIGHT.w - 6, 22, 6); ctx.fillStyle = p.earthDark; ctx.fill();
    rr(ctx, X + 3, 364, RIGHT.w - 6, 137, 14); ctx.fillStyle = p.earth; ctx.fill();
    // the written rule on the wall
    const tabLit = lit.includes('tablet');
    palmLeaf(ctx, c, X + 78, 140, 166, 66, { rows: 3, fill: tabLit ? mix(p.palm, c.accent, 0.3) : p.palm });
    palmLeaf(ctx, c, X + 78, 216, 166, 66, { rows: 3, seed: 8, fill: tabLit ? mix(p.palm, c.accent, 0.3) : p.palm });
    person(ctx, this, { role: 'adult', x: X + 86, y: 478, height: 150, pose: 'point', facing: 1, i: 3 });
    person(ctx, this, { role: 'worker', x: X + 240, y: 484, height: 146, facing: -1, i: 4 });
    if (tabLit) pill(ctx, c, 'law', X + 161, 122, { size: 28, bg: c.accent });
    ctx.restore();
    reading(ctx, c, 'Kingdom office', RIGHT.x + RIGHT.w / 2, 54, 30, this._dimRight() ? c.labelMuted : c.label);
    drawVignette(ctx, c, 0.5);
  }
}
