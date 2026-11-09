// SchoolCompareScene - L10 blk-l10-s03b, 1 beat. The book's Let's Explore: a gurukula beside your school. Five chips, the five
// aspects the book names. The left side states the source; the right side is the learner's own to fill, so it asks.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawCard, drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { hut, tree, ground, say, plate, sky, stone } from '../L09/SstWorld.js';

const W = 680, H = 520, GY = 256;
const MAP = [[{ idx: 0, dwellMs: null }]];
const ROWS = [
  { id: 'rout', label: 'Routine', a: ['study, yoga, meditation,', 'service to the guru'], b: ['your timetable,', 'bell to bell?'] },
  { id: 'subj', label: 'Subjects', a: ['Vedas, grammar, medicine,', 'music, archery'], b: ['your subjects', 'this year?'] },
  { id: 'teach', label: 'Teachers', a: ['one guru, close', 'and supportive'], b: ['your teachers,', 'one for each subject?'] },
  { id: 'disc', label: 'Discipline', a: ['self-control, obedience,', 'devotion'], b: ['your school rules?', ''] },
  { id: 'live', label: 'Living', a: ['in the teacher\u2019s home,', 'as family'], b: ['at home with', 'your own family?'] },
];
const CHIPS = ROWS.map((r, i) => ({ id: r.id, label: r.label, targets: [r.id], tone: i + 1 }));

export class SchoolCompareScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A gurukula hut beside a school building. Five chips for routine, subjects, teachers, discipline and living arrangements show what the sources say of the gurukula and ask about your own school.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Compare', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => this.animateFor(300) });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  enter() { this.tl.set({ lit: 'rout' }); }

  _school(ctx, c, x, y) {
    const st = mix(stone(c), c.s1, 0.2);
    ctx.fillStyle = darken(st, 0.16); rr(ctx, x - 130, y - 136, 260, 138, 8); ctx.fill();
    ctx.fillStyle = st; rr(ctx, x - 130, y - 136, 260, 22, 8); ctx.fill();
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { ctx.fillStyle = lighten(c.s1, 0.3); rr(ctx, x - 112 + i * 46, y - 102 + r * 48, 34, 34, 4); ctx.fill(); }
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    ground(ctx, c, GY);
    ctx.fillStyle = c.stroke; ctx.fillRect(W / 2 - 2, 0, 4, H);
    tree(ctx, c, 66, GY, 170);
    hut(ctx, c, 196, GY + 6, 210);
    this._school(ctx, c, 510, GY + 6);
    plate(ctx, c, 'gurukula', 170, 34, { size: 28 });
    plate(ctx, c, 'your school', 510, 34, { size: 28 });
    const r = ROWS.find((x) => x.id === this.tl.lit()[0]);
    drawCard(ctx, c, 12, 296, W / 2 - 22, 212);
    drawCard(ctx, c, W / 2 + 10, 296, W / 2 - 22, 212);
    if (r) {
      r.a.forEach((t, i) => say(ctx, c, t, W / 4, 368 + i * 46, { size: 28, weight: 700, display: false }));
      r.b.forEach((t, i) => say(ctx, c, t, W * 0.75, 368 + i * 46, { size: 28, weight: 700, display: false, col: mix(c.label, c.s5ink, 0.6) }));
    } else {
      say(ctx, c, 'Tap an aspect', W / 2, 400, { size: 30, col: c.labelMuted });
    }
    drawVignette(ctx, c, 0.2);
  }
}
