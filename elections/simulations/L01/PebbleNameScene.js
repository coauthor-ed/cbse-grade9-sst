// PebbleNameScene - L01 s05. b0 the two pieces of the word; the learner picks what it should mean.
// b1 the word assembled, beside drawn pebbles: in ancient Greece, pebbles were used for voting.
// Written as a scene and not on the kit decoder: that board puts a creature's face on each option.
import { SvgScene, mountEl } from 'simulations/base/kit/SimSvg.js';
import { esc } from 'simulations/base/SimUi.js';
import { VOTE_CSS, panel, text, soft } from '../L02/VoteArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const OPTS = [
  { id: 'rocks', text: 'The study of how pebbles form in rivers', why: 'The pebble here is about voting, so think of what people did with it.' },
  { id: 'elect', text: 'The scientific study of elections', ok: true, why: 'Yes. Psephology is the scientific study of elections.' },
];
const STONES = [[0, 0, 44, 30], [78, 8, 36, 26], [40, 40, 50, 32], [-44, 44, 34, 24], [118, 46, 40, 28], [-80, 6, 30, 22], [-4, 78, 40, 26], [80, 80, 34, 24]];

export class PebbleNameScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'The word psephology in two pieces: psephos means pebble, and logy means systematic study. Pick what the word means. Then the whole word appears beside a pile of pebbles.';
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 560;
  found = false;
  bad = null;

  async setup() {
    await super.setup();
    this._foot = mountEl(this.root, 'pb-foot');
    this._foot.addEventListener('click', (e) => { const b = e.target.closest('[data-opt]'); if (b) this._pick(b.dataset.opt); });
    this._paintFoot();
  }

  css() { return VOTE_CSS + `.pb-foot { display: none; padding-top: 8px; }
.sim-dom-root[data-step="0"] .pb-foot { display: block; }
.pb-opt { display: block; width: 100%; min-height: 52px; margin-bottom: 8px; padding: 6px 12px; font: 800 17px/1.2 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); cursor: pointer;
  border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.pb-opt[data-state="bad"] { border-color: var(--sim-bad); text-decoration: line-through; }
.pb-opt[data-state="good"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 24%, var(--sim-bg-surface)); }
.pb-msg { margin: 0; min-height: 22px; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label); text-align: center; }`; }

  stageHeight(st) { return this.stepIndex === 0 ? 190 : st.portrait ? 440 : 400; }
  enter() { this.bad = null; this.found = false; this._paintFoot(); }

  _pick(id) {
    const o = OPTS.find((x) => x.id === id);
    if (!o) return;
    this.bad = o.ok ? null : id;
    if (o.ok && !this.found) { this.found = true; this.celebrate(); }
    this._msg = o.why;
    this._paintFoot();
  }

  _paintFoot() {
    if (!this._foot) return;
    const state = (o) => (o.ok && this.found ? 'good' : this.bad === o.id ? 'bad' : '');
    this._foot.innerHTML = OPTS.map((o) => `<button type="button" class="pb-opt" data-opt="${o.id}" data-state="${state(o)}">${esc(o.text)}</button>`).join('') + `<p class="pb-msg" aria-live="polite">${esc(this.bad || this.found ? this._msg : 'What should the word mean?')}</p>`;
    this.relayout?.();
  }

  paint(st) {
    const W = st.W, P = st.portrait;
    const w = (W - 44) / 2;
    if (this.stepIndex === 0) {
      let s = panel(0, 14, w, 150, 2, soft(2, 12)) + panel(w + 44, 14, w, 150, 5, soft(5, 12));
      s += text('va-h', w / 2, 76, P ? 28 : 36, 'psēphos', 'middle') + text('va-t', w / 2, 120, 20, 'pebble', 'middle');
      s += text('va-h', w + 44 + w / 2, 76, P ? 28 : 36, 'logy', 'middle') + text('va-t', w + 44 + w / 2, 120, P ? 16 : 19, 'systematic study', 'middle');
      s += text('va-h', W / 2, 100, 38, '+', 'middle');
      return { svg: s };
    }
    const cx = W / 2, y0 = P ? 176 : 170;
    let s = panel(0, 6, W, 126, 'var(--sim-gold)', soft('var(--sim-gold)', 14));
    s += text('va-h', cx, 58, P ? 38 : 44, 'psephology', 'middle') + text('va-t', cx, 100, 19, 'the scientific study of elections', 'middle');
    STONES.forEach(([x, y, rx, ry], i) => {
      const f = ['var(--sim-waste)', 'var(--sim-stroke)', 'var(--sim-track)'][i % 3];
      s += `<ellipse cx="${cx + x}" cy="${y0 + y + 7}" rx="${rx}" ry="${ry}" style="fill:color-mix(in srgb,${f} 70%,var(--sim-label))"/><ellipse cx="${cx + x}" cy="${y0 + y}" rx="${rx}" ry="${ry}" style="fill:${f}"/><ellipse cx="${cx + x - rx * 0.3}" cy="${y0 + y - ry * 0.35}" rx="${rx * 0.34}" ry="${ry * 0.2}" style="fill:var(--sim-bg-surface)" opacity="0.5"/>`;
    });
    return { svg: s + text('va-h', cx, y0 + 150, 21, 'Ancient Greece: pebbles for voting', 'middle') };
  }
}
