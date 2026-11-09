// SameVotesScene - L02 s07. b0 one set of votes, A 40, B 35, C 25, under three rules: three results.
// b1 the rules come from written laws: a book and a question for the next lesson.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from '../shared/CivicArt.js';
import { VOTE_CSS, bars, panel, text, soft } from './VoteArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const VOTES = [{ m: 'A', tone: 1, v: 40 }, { m: 'B', tone: 2, v: 35 }, { m: 'C', tone: 3, v: 25 }];
const RULES = [['FPTP', 1, 'A wins the seat'], ['Majority system', 4, 'A and B compete again'], ['PR, 100 seats', 2, 'A 40, B 35, C 25 seats']];

export class SameVotesScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'One set of votes, A 40, B 35, C 25, under three rules. FPTP: A wins the seat. Majority system: A and B compete again. PR: seats A 40, B 35, C 25. Then a book of election laws.';
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 560;

  stageHeight(st) { return st.portrait ? 520 : 440; }
  css() { return VOTE_CSS; }

  paint(st) {
    const W = st.W, P = st.portrait, b = this.stepIndex;
    let s = panel(0, 4, W, 170, 'var(--sim-stroke)');
    s += text('va-h', W / 2, 34, 20, 'The same votes, as a what-if', 'middle') + bars(10, 50, W - 20, VOTES, { h: 30, gap: 8, fs: 21, lx: 28, rw: 40 });
    if (b === 0) {
      RULES.forEach(([n, tone, r], i) => {
        const w = P ? W : (W - 16) / 3, x = P ? 0 : i * (w + 8), y = P ? 188 + i * 106 : 190, h = P ? 96 : 170;
        s += panel(x, y, w, h, tone, soft(tone, 12));
        s += text('va-h', x + w / 2, y + 34, 21, n, 'middle') + text('va-t', x + w / 2, y + (P ? 68 : 96), P ? 18 : 15.5, r, 'middle');
      });
    } else {
      const h = P ? 300 : 240, y = 190;
      s += panel(0, y, W, h, 'var(--sim-gold)', soft('var(--sim-gold)', 14));
      s += civicSvg('book', W / 2, y + h - 54, { h: 110 });
      s += text('va-h', W / 2, y + 38, 24, 'Rules are written in laws', 'middle');
      s += text('va-t', W / 2, y + h - 20, 19, 'What do these laws say?', 'middle');
    }
    return { svg: s };
  }
}
