/**
 * SurplusGapScene - L05 s02 (predict, setup mount) and s03 "Surplus, Shortage and Equilibrium" (3 beats).
 * SvgScene, design units 560 x 500 landscape, 390 x 600 portrait (shared/MeetParts.js). The mango market:
 * a "sellers offer" crate in front of the stall, a "buyers want" crate in front of Srivalli, Alex and Israt.
 * Numbers (STORYBOARD 0): Rs 150 offer 18, want 6; Rs 100 12 = 12; Rs 50 offer 6, want 18.
 *   setup  one Rs 150 board with a "?" beside it; 18 kg in the sellers' crate, 6 kg in the buyers' crate.
 *          No arrow, no words on what comes next, nothing to tap.
 *   b0     Rs 150: 6 kg moves from the sellers' crate to the buyers'; 12 kg stays, lit, "12 kg unsold"; the
 *          board gets a down arrow; chip "surplus (excess supply)".
 *   b1     Rs 50: all 6 kg move; the buyers' crate is a third full (the 18 kg they want shows faint behind),
 *          lit, "12 kg missing"; two buyers look let down; up arrow; chip "shortage (excess demand)".
 *   b2     Rs 100: all 12 kg move, the sellers' crate is empty and the buyers' full; no arrow; everyone smiles;
 *          big chip "equilibrium: Rs 100, 12 kg".
 *   b0-b2 keep the three price boards, so the learner can compare; the rest state is the beat's price.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, RS, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, paintPeople, frontSvg } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, pill } from '../shared/MarketParts.js';
import { SUP, INK } from '../shared/SupplyParts.js';
import { PRICES, WANT, OFFER, MEET_H, meetGeo, people, bigCrate, priceRow } from '../shared/MeetParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const BEAT_SEL = [0, 2, 1];
const SOLD = PRICES.map((_, i) => Math.min(WANT[i], OFFER[i]));
const CASE = ['surplus (excess supply)', 'equilibrium', 'shortage (excess demand)'];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';

export class SurplusGapScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN, [Number.MAX_SAFE_INTEGER]: [[{ idx: 3, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'The mango market. At 150 rupees a kg the sellers offer 18 kg but the buyers want only 6 kg, so 12 kg is left unsold: a surplus, and the price falls. At 50 rupees the buyers want 18 kg but the sellers offer only 6 kg, so 12 kg is missing: a shortage, and the price rises. At 100 rupees buyers want 12 kg and sellers offer 12 kg: nothing is left over and no buyer goes without. That is equilibrium, 100 rupees and 12 kg.';

  async setup() {
    this.sel = 0;
    this.phase = 'done';
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b && b.dataset.act === 'price' && this.view < 3) this.pick(Number(b.dataset.val));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  get view() { return this.hostRole === 'setup' ? 3 : this.stepIndex; }

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    const v = this.hostRole === 'setup' ? 3 : step;
    this.phase = 'done';
    if (v === 3) { this.sel = 0; return; }
    this.pick(BEAT_SEL[v] ?? 0);
  }

  // the sold kg moves from the sellers' crate to the buyers'; then the tag, the arrow and the chip
  pick(i) {
    this.clear();
    this.sel = i;
    this.anim = true;
    this.phase = 'pre';
    this.repaint();
    this.after(0.35, () => { this.phase = 'fly'; this.repaint(); });
    this.after(1.1, () => { this.phase = 'done'; this.fresh = true; this.repaint(); this.fresh = false; });
    this.after(1.75, () => { this.anim = false; this.repaint(); });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.phase = 'done';
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? MEET_H.port : MEET_H.land) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, G = meetGeo(P), k = (st.W / G.DW).toFixed(4), setup = this.view === 3;
    const i = setup ? 0 : this.sel, ph = setup ? 'setup' : this.phase, done = ph === 'done', fresh = this.fresh;
    const pop = (d) => (fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
    let svg = '', over = '', front = '';
    const surplus = OFFER[i] > WANT[i], shortage = WANT[i] > OFFER[i];
    const moods = setup ? ['think', 'think', 'think'] : !done ? ['smile', 'smile', 'smile']
      : shortage ? ['smile', 'oops', 'sad'] : surplus ? ['smile', 'smile', 'smile'] : ['happy', 'happy', 'happy'];
    const ppl = people(G, { moods, sMood: setup ? 'think' : done && surplus ? 'oops' : done && !shortage ? 'happy' : 'smile' });
    over += ppl.over;
    front += ppl.front;
    // prices
    if (setup) {
      const [bx, by, bw, bh] = G.big;
      svg += priceBoard(bx, by, 150, { w: bw, h: bh, active: true });
      svg += pill(bx + bw / 2 + 34, by + 2, '?', { size: P ? 30 : 34, bg: ACC, ink: ACC_INK, edge: ACC, padX: 30 });
    } else {
      const row = priceRow(G, i, { dir: done ? (surplus ? 1 : shortage ? -1 : 0) : 0, pop: fresh });
      svg += row.svg;
      over += row.over;
    }
    // the two crates
    const [bx, by, bw] = G.crB, [sx, sy, sw] = G.crS, fs = P ? 22 : 24;
    const inB = setup ? 6 : ph === 'pre' || ph === 'fly' ? 0 : SOLD[i];
    const inS = setup ? 18 : ph === 'pre' ? OFFER[i] : OFFER[i] - SOLD[i];
    const litS = done && surplus, litB = done && shortage;
    front += bigCrate(sx, sy, sw, inS, { ring: litS });
    front += bigCrate(bx, by, bw, inB, { ring: litB, ghost: litB ? WANT[i] : 0, cls: fresh ? 'mk-drop' : '' });
    front += pill(bx, by - bw * 0.16, `${setup ? 6 : WANT[i]} kg wanted`, { size: fs, bg: MKT, ink: INK(5), edge: MKT });
    front += pill(sx, sy - sw * 0.16, `${setup ? 18 : OFFER[i]} kg offered`, { size: fs, bg: SUP, ink: INK(7), edge: SUP });
    if (ph === 'fly') {
      const ty = by - bw * 0.7, fy = sy - sw * 0.7;
      front += `<g class="mq-fly" style="--dx:${f1(sx - bx)}px;--dy:${f1(fy - ty)}px;--dur:0.7s">${pill(bx, ty, `${SOLD[i]} kg`, { size: fs + 2, bg: 'var(--sim-series-2)', ink: 'var(--sim-ink-on-2, var(--sim-bg-deep))', edge: 'var(--sim-series-2)' })}</g>`;
    }
    if (litS || litB) {
      const [tx, ty0] = litS ? [sx, sy] : [bx, by], tw = litS ? sw : bw;
      const ty = P && litB ? G.tagB[1] : ty0 - tw * 0.55 - tw * 0.12 - 26;
      front += `<g${pop(0.1)}>${pill(tx, ty, litS ? '12 kg unsold' : '12 kg missing', { size: P ? 21 : 23, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    }
    if (done && !setup) {
      const [cx, cy] = G.case, eq = !surplus && !shortage;
      const t = eq ? `equilibrium: ${RS}100, 12 kg` : CASE[surplus ? 0 : 2];
      svg += `<g${pop(0.3)}>${pill(cx, cy, t, { size: eq ? (P ? 26 : 28) : (P ? 21 : 23), bg: eq ? ACC : 'var(--sim-bg-surface)', ink: eq ? ACC_INK : 'var(--sim-label)', edge: ACC })}</g>`;
    }
    if (!setup && !this.anim && !P) svg += txt(G.case[0], G.case[1] + 34, 'tap a price to compare', 17, 'var(--sim-label-muted)');
    over += frontSvg(G.DW, G.DH, front);
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${G.DW}px;height:${G.DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() {
    const i = this.view === 3 ? 0 : this.sel;
    return { view: this.view, price: PRICES[i], want: WANT[i], offer: OFFER[i], sold: SOLD[i], phase: this.phase, anim: this.anim,
      case: this.view === 3 ? null : OFFER[i] > WANT[i] ? 'surplus' : WANT[i] > OFFER[i] ? 'shortage' : 'equilibrium' };
  }
}
