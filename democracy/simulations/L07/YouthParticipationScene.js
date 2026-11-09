// YouthParticipationScene - blk-l07-s08. Book's Fig 6.9. Beat 0: two students and the civic
// responsibilities a student can practise now. Beat 1: a signpost with the book's five paths;
// tap one and an example shows. The examples are the course's, plain and small.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { wrapText, font, darken, inkOn } from 'simulations/base/kit/SimLook.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, tile, say, folk, tag, pop, rr } from '../L06/CivicWorld.js';

// Five names in a TapLight row left the figure 284 px wide at 1280, so one Next button walks them.
const PATHS = [
  { id: 'constitution', label: 'The Constitution', targets: ['Understand the Constitution', 'Read the Preamble with your class and ask what each word means.'] },
  { id: 'duties', label: 'Duties', targets: ['Follow fundamental duties', 'Keep public places clean, and take care of public property.'] },
  { id: 'lead', label: 'Leadership', targets: ['Take leadership', 'Stand for your class council, or run a cleanliness drive.'] },
  { id: 'media', label: 'Media literate', targets: ['Be media literate', 'Check a message before you share it.'] },
  { id: 'nation', label: 'Nation-building', targets: ['Nation-building activities', 'Join NCC, NSS or Bharat Scouts & Guides.'] },
];
const ARMS = [
  { id: 'constitution', text: 'Constitution', dir: 1 }, { id: 'duties', text: 'Duties', dir: -1 }, { id: 'lead', text: 'Leadership', dir: 1 },
  { id: 'media', text: 'Media', dir: -1 }, { id: 'nation', text: 'Nation-building', dir: 1 },
];
const S_NOW = 0, S_PATHS = 1;
const MAP = [S_NOW, S_PATHS].map((idx) => [{ idx, dwellMs: null }]);
const G = 300;

export class YouthParticipationScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Two students at a school. First, five things they can practise now. Then a signpost with five paths from the book: understand the Constitution, follow fundamental duties, take leadership, be media literate, and take part in nation-building activities. Next path lights each one with an example.';
  static CONTROLS = [{ type: 'button', id: 'next', label: 'Next path' }];

  constructor(container, config) { super(container, config); this._i = 0; }
  onControlChange(id) { if (id === 'next' && this._guard(id)) { this._i = (this._i + 1) % PATHS.length; this.requestUiUpdate?.(); } }
  pointerDown() { if (this.stage === S_PATHS) this.onControlChange('next'); }
  isControlHidden(id) { return id === 'next' && this.stage !== S_PATHS; }
  enter() { this._i = 0; }
  busy() { return this.age < 1; }

  draw(ctx, c) {
    const t = tones(c), a = this.age;
    day(ctx, c, 680, 520, { ground: G });
    if (this.stage === S_NOW) {
      drawCivic(ctx, c, 'school', 170, G + 6, { w: 320 });
      folk(ctx, this, { role: 'student', x: 90, y: 444, height: 226, facing: 1, i: 2 });
      folk(ctx, this, { role: 'student', x: 214, y: 448, height: 216, facing: 1, i: 5, pose: 'point' });
      ['Respect others\' rights', 'Use social media well', 'Follow laws and rules', 'Appreciate diversity', 'Help build unity'].forEach((text, i) =>
        tag(ctx, c, text, 480, 76 + i * 72, { scale: pop(a, 0.1 + i * 0.14), size: 28 }));
    } else {
      const lit = PATHS[this._i].id;
      ctx.fillStyle = t.wood; rr(ctx, 334, 8, 14, 292, 6); ctx.fill();
      ARMS.forEach((arm, i) => {
        const y = 14 + i * 50, w = 250, x = arm.dir > 0 ? 348 : 334 - w, on = arm.id === lit, f = on ? c.accent : c.bgSurface;
        ctx.save();
        if (lit && !on) ctx.globalAlpha *= 0.8;
        ctx.beginPath();
        if (arm.dir > 0) { ctx.moveTo(x, y); ctx.lineTo(x + w - 22, y); ctx.lineTo(x + w, y + 22); ctx.lineTo(x + w - 22, y + 44); ctx.lineTo(x, y + 44); }
        else { ctx.moveTo(x + w, y); ctx.lineTo(x + 22, y); ctx.lineTo(x, y + 22); ctx.lineTo(x + 22, y + 44); ctx.lineTo(x + w, y + 44); }
        ctx.closePath(); ctx.fillStyle = f; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = on ? darken(c.accent, 0.3) : c.stroke; ctx.stroke();
        say(ctx, c, arm.text, x + w / 2, y + 23, { size: 28, col: on ? inkOn(c, c.accent) : c.label });
        ctx.restore();
      });
      folk(ctx, this, { role: 'student', x: 60, y: 296, height: 160, facing: 1, i: 2 });
      folk(ctx, this, { role: 'student', x: 626, y: 296, height: 154, facing: -1, i: 5 });
      const [title, line] = PATHS[this._i].targets;
      tile(ctx, c, 16, 310, 648, 136, { fill: c.bgSurface });
      {
        say(ctx, c, title, 340, 342, { size: 30 });
        ctx.font = font(c, 700, 28); ctx.fillStyle = c.label;
        wrapText(ctx, line, 36, 368, 608, { lineH: 34, align: 'center', maxLines: 2 });
      }
    }
  }
}
