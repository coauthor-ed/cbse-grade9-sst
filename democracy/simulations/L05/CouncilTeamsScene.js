// CouncilTeamsScene - L05 s05. Four stalls at a school fair. A tap opens one stall, and the card shows
// the Team's rules word for word. No team is judged here: the slide after this one asks.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { day, who, card, rr, mix, darken, font, pop } from '../L04/DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const TEAMS = [
  { id: 'A', tone: 's1', n: 1, words: 'All students gather in one place and elect their president once a year. However, the president has very limited powers. For major decisions, such as the canteen menu, they gather at a designated place and vote using ballot papers.' },
  { id: 'B', tone: 's3', n: 3, words: 'The school holds elections every year. Every class elects a representative, who then participates in the election of the Students\u2019 Council President. The President and the representatives together make decisions.' },
  { id: 'C', tone: 's5', n: 5, words: 'Students directly vote for the School President as well as for members of the Council. The President acts as both the head of the Students\u2019 Council and the chief decision-maker.' },
  { id: 'D', tone: 's2', n: 2, words: 'Elections are held, but only selected candidates are allowed to contest. The School President holds most of the power. The Student Council exists but has very limited authority, and opposition voices are weak or discouraged.' },
];
const CHIPS = TEAMS.map((t) => ({ id: t.id, label: `Team ${t.id}`, targets: [t.id], tone: t.n }));
const SW = 158;
const sx = (i) => 22 + i * 162;

export class CouncilTeamsScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Four stalls at a school fair, for Teams A, B, C and D, each with a student. Tapping a team opens its stall and shows on a card how its Students\u2019 Council works.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Team', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this._at = this.age; } }
  enter(st) { this._at = 0; this.tl.set({ lit: st === 0 ? 'A' : 'C' }); }
  busy() { return this.age - (this._at ?? 0) < 0.6; }

  // A real fair stall: two poles, a scalloped awning, a student behind a counter with the team's letter.
  _stall(ctx, c, T, i, lit) {
    const x = sx(i), y = lit ? 6 : 14, w = SW - 6, col = c[T.tone];
    ctx.save(); if (!lit) ctx.globalAlpha *= 0.82;
    ctx.fillStyle = mix(c.s8, c.label, 0.3);
    rr(ctx, x + 10, y + 34, 8, 124, 3); ctx.fill(); rr(ctx, x + w - 18, y + 34, 8, 124, 3); ctx.fill();
    who(ctx, this, { role: 'student', x: x + w / 2, y: y + 146, height: 112, i: i * 2 + 1 });
    rr(ctx, x + 4, y + 110, w - 8, 52, 8); ctx.fillStyle = mix(col, c.bgSurface, lit ? 0.3 : 0.5); ctx.fill();
    ctx.lineWidth = lit ? 4 : 3; ctx.strokeStyle = darken(col, 0.2); ctx.stroke();
    const n = 5, sw = w / n;
    for (let k = 0; k < n; k++) {
      ctx.fillStyle = k % 2 ? c.bgSurface : col;
      ctx.fillRect(x + k * sw, y, sw + 0.5, 30);
      ctx.beginPath(); ctx.arc(x + k * sw + sw / 2, y + 30, sw / 2, 0, Math.PI); ctx.fill();
    }
    ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.2); ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x + w, y + 1); ctx.stroke();
    ctx.font = font(c, 700, 36, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.fillText(T.id, x + w / 2, y + 137);
    ctx.restore();
  }

  draw(ctx, c) {
    day(ctx, c, { ground: 110, sun: false });
    const L = this.tl.chip()?.id, T = TEAMS.find((t) => t.id === L);
    TEAMS.forEach((t, i) => this._stall(ctx, c, t, i, t.id === L));
    const k = pop(this.age - (this._at ?? 0), 0, 0.3);
    if (T) card(ctx, c, 14, 176, 652, 272, { title: `Team ${L}`, text: T.words, size: 27, titleSize: 30, rim: c[T.tone], alpha: Math.min(1, k + 0.4) });
    else card(ctx, c, 14, 176, 652, 272, { title: 'Four teams', text: 'Tap a team to read how its council works.', size: 28, titleSize: 30 });
    drawVignette(ctx, c, 0.12);
  }
}
