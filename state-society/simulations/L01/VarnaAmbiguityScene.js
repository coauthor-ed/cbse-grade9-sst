// VarnaAmbiguityScene - L01 s05. Three cards: a concept, a text, a group of people, spelled as
// the book prints them. b0 cards. b1 a sentence: tap the card it means. No answer is carried
// over from an earlier beat: the round starts fresh on every landing.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, mix, pill, wrapText, font } from 'simulations/base/kit/SimLook.js';
import { pal, panel, palmLeaf, person, reading, TAU } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const CARDS = [
  { id: 'concept', head: 'Br\u0101hman', tag: 'a concept', tone: 's5', x: 12 },
  { id: 'text', head: 'Br\u0101hma\u1E47as', tag: 'texts', tone: 's3', x: 232 },
  { id: 'people', head: 'Br\u0101hma\u1E47as', head2: 'or Brahmins', tag: 'var\u1E47a category', tone: 's2', x: 452 },
];
const CW = 216, CY = 170, CH = 340;
const ROUNDS = [
  { say: 'The Upani\u1E63hads ask about Br\u0101hman, the Ultimate Universal Being.', is: 'concept', no: 'This sentence is about an idea, not a book or a group.' },
  { say: 'The Br\u0101hma\u1E47as are composed in prose and explain rituals.', is: 'text', no: 'Prose that explains rituals is a text.' },
  { say: 'A Br\u0101hma\u1E47a is a member of one var\u1E47a category.', is: 'people', no: 'A var\u1E47a is a group in society.' },
];

export class VarnaAmbiguityScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'Three cards. Brahman is a concept, the Ultimate Universal Being, drawn as a sun. Brahmanas are texts, drawn as palm leaves. Brahmanas or Brahmins are a varna category, drawn as people. On the second beat a sentence appears; tap the card it means.';
  round = 0;
  found = [];
  miss = null;

  enter() { this.round = 0; this.found = []; this.miss = null; }

  pointerDown(p) {
    if (this.stage !== 1 || this.round >= ROUNDS.length) return;
    const card = CARDS.find((k) => p.x >= k.x && p.x <= k.x + CW && p.y >= CY && p.y <= CY + CH);
    if (!card) return;
    const r = ROUNDS[this.round];
    if (card.id === r.is) {
      this.found.push(card.id); this.miss = null; this.round += 1;
      this.celebrate(card.x + CW / 2, CY + 60, 16);
    } else { this.miss = r.no; this.oops(card.x + CW / 2, CY + 100); }
  }

  _art(ctx, c, k, cx, cy) {
    if (k.id === 'concept') {
      ctx.beginPath(); ctx.arc(cx, cy, 34, 0, TAU); ctx.fillStyle = c.gold; ctx.fill();
      ctx.strokeStyle = c.gold; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44); ctx.lineTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60); ctx.stroke(); }
    } else if (k.id === 'text') {
      for (let i = 0; i < 3; i++) palmLeaf(ctx, c, cx - 86, cy - 52 + i * 34, 172, 44, { rows: 2, seed: i + 2 });
    } else {
      person(ctx, this, { role: 'elder', x: cx - 40, y: cy + 72, height: 138, i: 0, facing: 1 });
      person(ctx, this, { role: 'adult', x: cx + 40, y: cy + 72, height: 130, i: 1, facing: -1 });
    }
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    const b1 = this.stage === 1, done = this.round >= ROUNDS.length;
    const p = pal(c);
    panel(ctx, c, 12, 12, 656, 146, { fill: p.panel, rim: this.miss ? c.bad : c.stroke });
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    if (!b1) reading(ctx, c, 'Three words that look alike', 340, 84, 34);
    else {
      ctx.font = font(c, 700, 28, true); ctx.fillStyle = c.label;
      const text = done ? 'All three found. The sentence tells you which word is meant.' : ROUNDS[this.round].say;
      wrapText(ctx, text, 30, 34, 620, { lineH: 36, align: 'center' });
      if (this.miss) { ctx.font = font(c, 800, 28); ctx.fillStyle = c.bad; ctx.textAlign = 'center'; ctx.fillText(this.miss, 340, 122); }
    }
    for (const k of CARDS) {
      const ok = this.found.includes(k.id);
      panel(ctx, c, k.x, CY, CW, CH, { fill: mix(c.bgSurface, c[k.tone], ok ? 0.3 : 0.14), lit: ok, litCol: c.good });
      const cx = k.x + CW / 2;
      this._art(ctx, c, k, cx, CY + 86);
      reading(ctx, c, k.head, cx, CY + 206, 30);
      if (k.head2) reading(ctx, c, k.head2, cx, CY + 240, 28);
      pill(ctx, c, k.tag, cx, CY + 296, { size: 28, bg: c[k.tone], display: true });
    }
    drawVignette(ctx, c, 0.35);
  }
}
