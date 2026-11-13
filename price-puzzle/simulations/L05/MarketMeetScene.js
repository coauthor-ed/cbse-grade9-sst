/**
 * MarketMeetScene - L05 s01 "Buyers and Sellers Meet" (2 beats). SvgScene, design units 560 x 500 landscape,
 * 390 x 600 portrait (shared/MeetParts.js). The mango market: Srivalli, Alex and Israt on one side, Seller A,
 * B and C behind one long stall on the other.
 *   b0  one big price board (Rs 100 / kg) where the two sides meet; a "willing to pay" chip (market demand
 *       colour) over the buyers, a "willing to accept" chip (market supply colour) over the sellers, an arrow
 *       from each chip to the board. No quantities.
 *   b1  the three price boards Rs 150 / 100 / 50 in the figure. A "buyers want" crate in front of the buyers and
 *       a "sellers offer" crate in front of the stall, each with a big kg number: 6 vs 18, 12 vs 12, 18 vs 6
 *       (STORYBOARD 0). Tap a board: the crates fill. Cold start Rs 150. No surplus / shortage words (s03).
 * Colours are tokens only. ASCII only.
 */
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, paintPeople, frontSvg } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, pill, arrow } from '../shared/MarketParts.js';
import { SUP, INK } from '../shared/SupplyParts.js';
import { PRICES, WANT, OFFER, MEET_H, meetGeo, people, bigCrate, priceRow } from '../shared/MeetParts.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];

export class MarketMeetScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The mango market. Srivalli, Alex and Israt, the buyers, think about how much they are willing to pay. Seller A, Seller B and Seller C, behind their stall, think about how much they are willing to accept. The price board, 100 rupees a kg, sits where the two sides meet. Then the three prices: at 150 rupees buyers want 6 kg and sellers offer 18 kg; at 100 rupees buyers want 12 kg and sellers offer 12 kg; at 50 rupees buyers want 18 kg and sellers offer 6 kg.';

  async setup() {
    this.sel = 0;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b && b.dataset.act === 'price' && this.stepIndex === 1) this.pick(Number(b.dataset.val));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.sel = 0;
    if (step === 1) this.pick(0, true);
    else this.burst(1.0);
  }

  burst(sec) {
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(sec, () => { this.anim = false; this.repaint(); });
  }

  pick(i, quiet) {
    this.clear();
    this.sel = i;
    this.burst(0.9);
    if (quiet) this.after(0.95, () => this.repaint());
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? MEET_H.port : MEET_H.land) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, G = meetGeo(P), k = (st.W / G.DW).toFixed(4), b1 = this.stepIndex === 1, fresh = this.fresh;
    let svg = '', over = '', front = '';
    const pop = (d) => (fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
    const fade = (d) => (fresh ? ` class="mq-fade" style="--d:${d}s"` : '');
    const ppl = people(G, { row: !b1 });
    over += ppl.over;
    front += ppl.front;
    const cs = P ? 21 : 22;
    if (!b1) {
      // one big board where the two sides meet; the two chips point at it
      const [bx, by, bw, bh] = G.big;
      svg += `<g${pop(0.1)}>${priceBoard(bx, by, 100, { w: bw, h: bh, active: true })}</g>`;
      const cB = G.chipB, cS = G.chipS;
      front += `<g${pop(0.4)}>${pill(cB[0], cB[1], 'willing to pay', { size: cs, bg: MKT, ink: INK(5), edge: MKT })}</g>`;
      front += `<g${pop(0.6)}>${pill(cS[0], cS[1], 'willing to accept', { size: cs, bg: SUP, ink: INK(7), edge: SUP })}</g>`;
      if (!P) {
        svg += `<g${fade(0.8)}>${arrow(cB[0] + 30, cB[1] - 20, bx - bw / 2 - 6, by + 12, MKT, 5)}${arrow(cS[0] - 10, cS[1] - 20, bx + bw / 2 + 6, by + 12, SUP, 5)}</g>`;
      }
    } else {
      const i = this.sel, row = priceRow(G, i);
      svg += row.svg;
      over += row.over;
      if (!this.anim && !P) svg += txt(G.boards.xs[1], G.hint, 'tap a price', 19, 'var(--sim-label-muted)');
      const cB = G.chipB, cS = G.chipS;
      front += pill(cB[0], cB[1], 'buyers want', { size: cs, bg: MKT, ink: INK(5), edge: MKT });
      front += pill(cS[0], cS[1], 'sellers offer', { size: cs, bg: SUP, ink: INK(7), edge: SUP });
      const [bx, by, bw] = G.crB, [sx, sy, sw] = G.crS, fs = P ? 28 : 32;
      front += bigCrate(bx, by, bw, WANT[i], { cls: fresh ? 'mq-fade' : '', style: '--d:0.1s' });
      front += bigCrate(sx, sy, sw, OFFER[i], { cls: fresh ? 'mq-fade' : '', style: '--d:0.3s' });
      front += `<g${pop(0.4)}>${pill(bx, by - bw * 0.16, `${WANT[i]} kg`, { size: fs, bg: MKT, ink: INK(5), edge: MKT })}</g>`;
      front += `<g${pop(0.6)}>${pill(sx, sy - sw * 0.16, `${OFFER[i]} kg`, { size: fs, bg: SUP, ink: INK(7), edge: SUP })}</g>`;
    }
    over += frontSvg(G.DW, G.DH, front);
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${G.DW}px;height:${G.DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, price: this.stepIndex === 1 ? PRICES[this.sel] : 100, want: this.stepIndex === 1 ? WANT[this.sel] : null, offer: this.stepIndex === 1 ? OFFER[this.sel] : null, anim: this.anim }; }
}
