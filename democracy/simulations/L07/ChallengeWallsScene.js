// ChallengeWallsScene - blk-l07-s03. One citizen on a road to a polling booth, and what stands in
// the way. Beat 0 a false message; beat 1 the book's five barriers, tap one to see a plain case;
// beat 2 our own actions; beat 3 a law that stops before it reaches the citizen. No walls.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { wrapText, font, mix } from 'simulations/base/kit/SimLook.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, tile, say, folk, tag, pop, rr } from '../L06/CivicWorld.js';

// Five long names in a TapLight row left the figure 284 px wide at 1280, so one Next button walks them.
const BARRIERS = [
  { id: 'illiteracy', label: 'Illiteracy', targets: ['Illiteracy', 'A notice is put up, but she cannot read it.'] },
  { id: 'poverty', label: 'Poverty', targets: ['Poverty', 'He cannot leave work, because he would lose a day of wages.'] },
  { id: 'region', label: 'Regionalism', targets: ['Regionalism', 'People from another region are treated as outsiders.'] },
  { id: 'gender', label: 'Gender inequality', targets: ['Gender inequality', 'Her family does not want her to speak at the meeting.'] },
  { id: 'caste', label: 'Social discrimination', targets: ['Social discrimination', 'Some people are kept out of the village meeting.'] },
];
const S_FALSE = 0, S_BARRIERS = 1, S_ACTIONS = 2, S_GAPS = 3;
const MAP = [S_FALSE, S_BARRIERS, S_ACTIONS, S_GAPS].map((idx) => [{ idx, dwellMs: null }]);
const G = 176, ROAD = 212, CARD = { x: 18, y: 268, w: 644, h: 176 };

export class ChallengeWallsScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A citizen walks a road towards a polling booth. A false message stops her. Then a button walks through five barriers from the book, each with a plain case. Then our own actions. Last, a law on paper stops at a gap in the road and does not reach her.';
  static CONTROLS = [{ type: 'button', id: 'next', label: 'Next barrier' }];

  constructor(container, config) { super(container, config); this._i = 0; }
  onControlChange(id) { if (id === 'next' && this._guard(id)) { this._i = (this._i + 1) % BARRIERS.length; this.requestUiUpdate?.(); } }
  pointerDown() { if (this.stage === S_BARRIERS) this.onControlChange('next'); }
  isControlHidden(id) { return id === 'next' && this.stage !== S_BARRIERS; }
  enter() { this._i = 0; }
  busy() { return this.age < 1; }

  _world(ctx, c, gap) {
    const t = tones(c);
    day(ctx, c, 680, 520, { ground: G });
    ctx.fillStyle = t.road; ctx.fillRect(0, ROAD - 26, 680, 52);
    ctx.fillStyle = t.roadEdge; ctx.fillRect(0, ROAD - 26, 680, 4); ctx.fillRect(0, ROAD + 24, 680, 4);
    if (gap) { ctx.fillStyle = t.groundDark; rr(ctx, 300, ROAD - 34, 86, 68, 12); ctx.fill(); }
    drawCivic(ctx, c, 'booth', 590, ROAD - 8, { h: 160 });
  }

  _card(ctx, c, title, text, k = 1) {
    ctx.save(); ctx.globalAlpha *= Math.min(1, k);
    tile(ctx, c, CARD.x, CARD.y, CARD.w, CARD.h, { fill: c.bgSurface });
    say(ctx, c, title, 340, CARD.y + 34, { size: 34 });
    ctx.font = font(c, 700, 28); ctx.fillStyle = c.label;
    wrapText(ctx, text, CARD.x + 22, CARD.y + 64, CARD.w - 44, { lineH: 36, align: 'center', maxLines: 3 });
    ctx.restore();
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    this._world(ctx, c, s === S_GAPS);
    if (s === S_FALSE) {
      folk(ctx, this, { role: 'adult', x: 300, y: ROAD + 10, height: 138, pose: 'stand', facing: 1, i: 1, mood: 'think' });
      drawCivic(ctx, c, 'phone', 366, ROAD - 40, { h: 84 });
      tag(ctx, c, 'Voting date moved?', 210, 34, { bg: c.waste });
      this._card(ctx, c, 'False news', 'It can influence opinion, create confusion and sometimes lead to conflict.', pop(a, 0.1));
    } else if (s === S_BARRIERS) {
      const [title, line] = BARRIERS[this._i].targets;
      folk(ctx, this, { role: 'adult', x: 230, y: ROAD + 10, height: 138, pose: 'stand', facing: 1, i: 1, mood: 'think' });
      {
        tile(ctx, c, 306, ROAD - 72, 200, 100, { fill: mix(c.bgSurface, c.waste, 0.3), r: 12 });
        ctx.font = font(c, 800, 27, true); ctx.fillStyle = c.label;
        const two = title.includes(' ');
        wrapText(ctx, title, 314, ROAD - (two ? 56 : 38), 184, { lineH: 34, align: 'center', maxLines: 2 });
        this._card(ctx, c, 'Barrier ' + (this._i + 1) + ' of ' + BARRIERS.length, line);
      }
    } else if (s === S_ACTIONS) {
      folk(ctx, this, { role: 'adult', x: 140, y: ROAD + 10, height: 138, pose: 'relax', facing: 1, i: 3, mood: 'think' });
      const tn = tones(c);                       // a roadside bench with a broken seat
      ctx.fillStyle = tn.wood;
      rr(ctx, 296, ROAD - 46, 8, 50, 3); ctx.fill(); rr(ctx, 416, ROAD - 46, 8, 50, 3); ctx.fill();
      ctx.save(); ctx.translate(296, ROAD - 44); ctx.rotate(0.16); rr(ctx, 0, -7, 66, 13, 4); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(424, ROAD - 44); ctx.rotate(Math.PI - 0.2); rr(ctx, 0, -7, 50, 13, 4); ctx.fill(); ctx.restore();
      ['Damaging public property', 'Spreading misinformation', 'Violating public rules', 'Indifference to public issues'].forEach((text, i) => {
        const k = pop(a, 0.05 + i * 0.16), y = CARD.y - 8 + i * 46;
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, CARD.x, y, CARD.w, 40, { fill: c.bgSurface, r: 10 });
        say(ctx, c, text, 340, y + 21, { size: 28 });
        ctx.restore();
      });
    } else {
      drawCivic(ctx, c, 'book', 128, ROAD + 6, { h: 130 });
      tag(ctx, c, 'Law on paper', 150, 44);
      folk(ctx, this, { role: 'adult', x: 464, y: ROAD + 10, height: 138, pose: 'stand', facing: -1, i: 1, mood: 'think' });
      ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.setLineDash([12, 12]); ctx.beginPath(); ctx.moveTo(196, ROAD - 40); ctx.lineTo(296, ROAD - 40); ctx.stroke(); ctx.setLineDash([]);
      tag(ctx, c, 'Gap', 343, ROAD - 62, { bg: c.waste });
      this._card(ctx, c, 'Laws not carried out', 'Gaps in implementation may reduce public trust in institutions.', pop(a, 0.1));
    }
  }
}
