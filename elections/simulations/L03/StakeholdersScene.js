// StakeholdersScene - L03 s07. The book's five stakeholders as tiles; a chip lights one and says its part.
// b1 the ECI is lit, and the question for the next lesson stands under it.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { civicSvg } from '../shared/CivicArt.js';
import { VOTE_CSS, panel, text, para, soft, col } from '../L02/VoteArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const ALL = [
  { id: 'eci', label: 'ECI', name: 'Election Commission of India', art: 'office', tone: 1, verb: 'conducts it', part: 'Conducts the elections, under the Constitution.' },
  { id: 'par', label: 'Parties', name: 'Political parties', art: 'mike', tone: 2, verb: 'contest it', part: 'Put up candidates and present their agenda to voters.' },
  { id: 'civ', label: 'Civil society', name: 'Civil society', art: 'square', tone: 3, verb: 'takes part', part: 'Groups of citizens who take part in public life.' },
  { id: 'med', label: 'Media', name: 'Media', art: 'newspaper', tone: 4, verb: 'carries news', part: 'Carries news and debate on the issues.' },
  { id: 'vot', label: 'Voters', name: 'Voters', art: 'ballotBox', tone: 5, verb: 'choose', part: 'Use the right to vote and fulfil a responsibility.' },
];
const CHIPS = ALL.map((a) => ({ id: a.id, label: a.label, targets: [a.id], tone: a.tone }));

export class StakeholdersScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'Five tiles: the Election Commission of India conducts the election, political parties contest it, civil society takes part, the media carries news and voters choose. A chip lights one and says its part. On the second step the Election Commission is lit.';
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 620;
  tl = tapLight({ label: 'Stakeholders', chips: CHIPS, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 382 : 340; }
  css() { return VOTE_CSS; }
  enter(step) { this.tl.set({ lit: step === 1 ? ['eci'] : null, disabled: step === 1 }); }

  paint(st) {
    const P = st.portrait, W = st.W, cols = P ? 2 : 5, gap = 8, w = (W - gap * (cols - 1)) / cols, h = P ? 84 : 178;
    const lit = this.tl.lit()[0];
    let s = '';
    ALL.forEach((a, i) => {
      const wide = P && i === 4, tw = wide ? W : w;
      const x = P ? (wide ? 0 : (i % 2) * (w + gap)) : i * (w + gap), y = P ? Math.floor(i / 2) * (h + gap) + 4 : 8, on = lit === a.id, off = lit && !on;
      // Art, name and what it does in the election, so the tiles say the point before any tap.
      const art = P ? civicSvg(a.art, x + 34, y + h - 14, a.art === 'office' || a.art === 'square' ? { w: 52 } : { h: 56 }) : civicSvg(a.art, x + w / 2, y + h - 56, { h: 88 });
      const words = P ? text('va-h', x + 66, y + 37, 16, a.label) + text('va-t', x + 66, y + 59, 15, a.verb) : text('va-h', x + w / 2, y + h - 32, 16, a.label, 'middle') + text('va-t', x + w / 2, y + h - 12, 14.5, a.verb, 'middle');
      s += `<g opacity="${off ? 0.3 : 1}">${panel(x, y, tw, h, a.tone, on ? soft(a.tone, 26) : soft(a.tone, 10), on ? 5 : 3)}${art}${words}</g>`;
    });
    const y = P ? 3 * (h + gap) + 8 : h + 24, a = ALL.find((q) => q.id === lit);
    s += panel(0, y, W, P ? 96 : 104, a ? a.tone : 'var(--sim-stroke)');
    if (a) s += text('va-h', 14, y + 32, 20, a.name) + para('va-t', 14, y + 60, 17, this.stepIndex === 1 ? 'Who runs an election?' : a.part, Math.floor((W - 24) / 8.8), 22);
    else s += text('va-h', W / 2, y + 42, 20, 'Five stakeholders, one election', 'middle') + text('va-t', W / 2, y + 68, 16, 'Tap a name to see its part', 'middle');
    return { svg: s };
  }
}
