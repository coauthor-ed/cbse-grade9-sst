// BakeryWeekGame - L04 game (blk-l04-s06): sharing out ABC Bakery's weekly hours across the four functional areas.
// Four weeks. Four area rows (management and operations, finance and accounting, human resources, marketing and
// sales; the same names and box colours as FourAreasBoardScene: series 1, 3, 5, 6), each with - / + hour buttons,
// an hours-left counter and a "Done for the week" button. The usual need every week is operations 4, finance 2,
// HR 2, marketing 2 = 10 hours (made-up numbers, from the block text). Weeks 2-4 have 12 hours and a note says
// what is happening; the extra 2 go to the area the news needs (festival orders: operations; a new helper who has
// never worked in a bakery: HR; a new bakery nearby: marketing). Week 1 starts at zero; each later week starts
// from last week's hours, so the learner moves the extra rather than retyping the usual hours.
// Done is live only when every hour is shared out. Wrong: each area that is off gets one short line (short of its
// need: what goes wrong; extra in the wrong area: "this week's news needed them in <area>"), its row is marked,
// and the learner fixes it and taps Done again. The buttons never show the answer.
// Win (checkObjective): all four weeks right; finishGame after week 4. Text-L04 report rules (python-checked
// table asserted at load). ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { shade } from 'simulations/base/kit/SimSvg.js';
import { bakery, bunting, cakeJar, STALL_CSS } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAX = 8;

const AREAS = [
  { key: 'ops', t: ['Management', 'and operations'], name: 'management and operations', short: 'Operations', s: 1, need: 4,
    low: 'bread comes out late or gets wasted.' },
  { key: 'fin', t: ['Finance', 'and accounting'], name: 'finance and accounting', short: 'Finance', s: 3, need: 2,
    low: 'costs are not planned.' },
  { key: 'hr', t: ['Human', 'resources'], name: 'human resources', short: 'Human resources', s: 5, need: 2,
    low: 'staff are not trained.' },
  { key: 'mkt', t: ['Marketing', 'and sales'], name: 'marketing and sales', short: 'Marketing', s: 6, need: 2,
    low: 'fewer people hear about the bakery.' },
];

const WEEKS = [
  { title: 'A usual week', tag: 'usual', art: 'usual', hours: 10, extra: null, note: 'Nothing new this week.',
    good: 'Every area got its usual hours.' },
  { title: 'Festival orders', tag: 'festival', art: 'festival', hours: 12, extra: 'ops', note: 'Festival time: many orders for cakes.',
    good: 'The 2 extra hours went to operations, to bake the festival cakes.' },
  { title: 'A new helper', tag: 'new helper', art: 'helper', hours: 12, extra: 'hr', note: 'A new helper joins. She has never worked in a bakery.',
    good: 'The 2 extra hours went to human resources, to train the new helper.' },
  { title: 'A new bakery nearby', tag: 'new bakery', art: 'rival', hours: 12, extra: 'mkt', note: 'A new bakery opens nearby.',
    good: 'The 2 extra hours went to marketing, so people keep hearing about ABC Bakery.' },
];
const RIGHT = [[4, 2, 2, 2], [6, 2, 2, 2], [4, 2, 4, 2], [4, 2, 2, 4]];
const want = (w) => AREAS.map((a) => a.need + (WEEKS[w].extra === a.key ? 2 : 0));
// The text-L04 table, checked here so a typo in AREAS or WEEKS cannot slip through.
WEEKS.forEach((wk, i) => {
  if (want(i).join() !== RIGHT[i].join()) throw new Error(`BakeryWeekGame: week ${i + 1} answer mismatch`);
  if (RIGHT[i].reduce((t, h) => t + h, 0) !== wk.hours) throw new Error(`BakeryWeekGame: week ${i + 1} hours mismatch`);
});

const col = (a) => `var(--sim-series-${a.s})`;
const ic = (name, tone, x, y, s) => iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}"`);

// The bakery in the week: sun (usual), bunting and cake jars (festival orders), a new helper at the door, or a
// second shop next door (a new bakery). Neutral tones only, so the art never colour-codes the answer.
function weekFig(wk) {
  let s = '<svg viewBox="0 0 200 128" aria-hidden="true" class="bw-figsvg">';
  s += '<rect x="0" y="0" width="200" height="128" rx="14" style="fill:color-mix(in oklab, var(--sim-series-1) 10%, var(--sim-bg-surface))"/>';
  s += '<rect x="0" y="116" width="200" height="12" style="fill:color-mix(in oklab, var(--sim-series-3) 26%, var(--sim-bg-surface))"/>';
  if (wk.art === 'usual') s += bakery(84, 120, 104, { signSize: 15 }) + ic('sun', 'var(--sim-gold)', 150, 12, 40);
  if (wk.art === 'festival') {
    s += bunting(4, 10, 196, 10, 9, { sag: 10, size: 13 }) + bakery(76, 120, 100, { signSize: 15 });
    s += cakeJar(150, 118, 40) + cakeJar(176, 118, 34) + cakeJar(163, 84, 30);
  }
  if (wk.art === 'helper') s += bakery(76, 120, 104, { signSize: 15 }) + ic('person', 2, 140, 54, 64) + ic('question', 'var(--sim-gold)', 168, 20, 30);
  if (wk.art === 'rival') s += bakery(54, 120, 92, { signSize: 15, sign: 'ABC' }) + bakery(150, 120, 88, { signSize: 15, sign: 'New' });
  return s + '</svg>';
}

const CSS = STALL_CSS + `
.gm.bw { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md); }
.bw .bw-main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 226px minmax(0, 1fr) 290px; gap: 12px; align-items: stretch; }
.bw .bw-card { background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); padding: 10px 12px; }
.bw .bw-side { display: flex; flex-direction: column; gap: 7px; }
.bw .bw-fig svg { display: block; width: 100%; height: auto; max-height: 104px; }
.bw .bw-sidetext { display: flex; flex-direction: column; gap: 7px; }
.bw .bw-pips { display: flex; justify-content: center; gap: 7px; }
.bw .bw-pip { width: 15px; height: 15px; border-radius: 50%; border: 2px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.bw .bw-pip[data-s="done"] { background: var(--sim-good); border-color: var(--sim-good); }
.bw .bw-pip[data-s="now"] { background: var(--sim-accent); border-color: var(--sim-accent); }
.bw .bw-note { margin: 0; padding: 7px 9px; border-radius: var(--sim-radius-md); font: 800 17px/1.3 var(--sim-font);
  background: color-mix(in oklab, var(--sim-gold) 22%, var(--sim-bg-surface)); border: 2px solid color-mix(in oklab, var(--sim-gold) 60%, var(--sim-stroke)); }
.bw .bw-note b { display: block; font-size: 15px; color: var(--sim-label-muted); }
.bw .bw-usual { display: flex; align-items: center; gap: 5px; margin: 0; font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.bw .bw-usual i { font-style: normal; display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 7px;
  font: 800 16px/1 var(--sim-font); color: var(--sim-label); }
.bw .bw-board { display: flex; flex-direction: column; gap: 6px; }
.bw .bw-left { display: flex; align-items: center; gap: 8px; margin: 0; font: 800 17px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.bw .bw-left svg { width: 30px; height: 30px; flex: none; }
.bw .bw-left b { font: 800 30px/1 var(--sim-font-display, var(--sim-font)); color: var(--sim-accent); min-width: 1.2em; text-align: center; }
.bw .bw-left[data-s="zero"] b { color: var(--sim-good); }
.bw .bw-left small { font: 700 15px/1.2 var(--sim-font); }
.bw .bw-rows { flex: 1 1 auto; display: flex; flex-direction: column; justify-content: space-between; gap: 5px; }
.bw .bw-row { display: grid; grid-template-columns: 168px minmax(0, 1fr) auto; align-items: center; gap: 8px; padding: 3px 6px 3px 3px;
  border-radius: var(--sim-radius-md); border: 2px solid transparent; }
.bw .bw-row[data-s="bad"] { border-color: var(--sim-bad); border-style: dashed; }
.bw .bw-row[data-s="good"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 10%, transparent); }
.bw .bw-name { display: flex; flex-direction: column; justify-content: center; min-height: 46px; padding: 3px 9px; border-radius: 10px;
  font: 800 16px/1.15 var(--sim-font); color: var(--sim-label); border: 2.5px solid; }
.bw .bw-tiles { display: flex; flex-wrap: wrap; gap: 3px; align-items: center; min-width: 0; }
.bw .bw-tile { width: 17px; height: 24px; border-radius: 4px; border: 2px solid; animation: bw-pop 0.3s cubic-bezier(.3,1.4,.5,1) both; }
.bw .bw-ctl { display: flex; align-items: center; gap: 4px; }
.bw .bw-pm { width: 48px; min-height: 46px; padding: 0; font: 800 26px/1 var(--sim-font-display, var(--sim-font)); }
.bw .bw-pm[aria-disabled="true"] { opacity: 0.38; cursor: default; }
.bw .bw-n { min-width: 36px; text-align: center; font: 800 26px/1 var(--sim-font-display, var(--sim-font)); }
.bw .bw-res { display: flex; flex-direction: column; gap: 6px; }
.bw .bw-eq { font: 800 19px/1.2 var(--sim-font); margin: 0; }
.bw .bw-rule { margin: 0; font: 700 16px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.bw .bw-say { margin: 0; font: 700 16px/1.3 var(--sim-font); }
.bw .bw-say[data-tone="good"] { color: var(--sim-good); } .bw .bw-say[data-tone="bad"] { color: var(--sim-bad); }
.bw .bw-say b { color: var(--sim-label); }
.bw .bw-go { margin-top: auto; min-height: 48px; font-size: 17px; font-weight: 800; border: 0; background: var(--sim-accent); color: var(--sim-bg-deep);
  box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.bw .bw-go:active { box-shadow: none; }
.bw .bw-go[aria-disabled="true"] { background: var(--sim-bg-deep); color: var(--sim-label-muted); border: 2px dashed var(--sim-stroke); box-shadow: none; cursor: default; }
.bw .bw-sum { display: grid; gap: 3px; margin: 0; padding: 0; list-style: none; }
.bw .bw-sum li { display: flex; justify-content: space-between; gap: 6px; font: 800 16px/1.3 var(--sim-font); }
.bw .bw-sum li b { color: var(--sim-good); white-space: nowrap; }
.bw-anim .bw-pop { animation: bw-pop 0.4s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes bw-pop { from { transform: scale(0.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .bw-anim .bw-pop, .bw .bw-tile { animation: none; } }
.sim-dom-root--portrait .bw .bw-main { display: flex; flex-direction: column; gap: 6px; }
.sim-dom-root--portrait .bw .bw-side { flex-direction: row; align-items: center; gap: 9px; padding: 6px 8px; }
.sim-dom-root--portrait .bw .bw-fig { width: 96px; flex: none; }
.sim-dom-root--portrait .bw .bw-fig svg { max-height: none; }
.sim-dom-root--portrait .bw .bw-pips { justify-content: flex-start; }
.sim-dom-root--portrait .bw .bw-sidetext { gap: 5px; }
.sim-dom-root--portrait .bw .bw-note { font-size: 15px; padding: 4px 7px; }
.sim-dom-root--portrait .bw .bw-note b { display: none; }
.sim-dom-root--portrait .bw .bw-usual { font-size: 14px; gap: 3px; }
.sim-dom-root--portrait .bw .bw-usual i { width: 22px; height: 22px; font-size: 15px; }
.sim-dom-root--portrait .bw .bw-board { padding: 6px 6px; }
.sim-dom-root--portrait .bw .bw-row { grid-template-columns: minmax(0, 1fr) auto; padding: 2px; gap: 6px; }
.sim-dom-root--portrait .bw .bw-tiles { display: none; }
.sim-dom-root--portrait .bw .bw-name { font-size: 15px; min-height: 44px; padding: 2px 8px; }
.sim-dom-root--portrait .bw .bw-pm { width: 46px; }
.sim-dom-root--portrait .bw .bw-n { min-width: 30px; }
.sim-dom-root--portrait .bw .bw-res { padding: 6px 10px; gap: 4px; }
.sim-dom-root--portrait .bw .bw-res .bw-rule { display: none; }
.sim-dom-root--portrait .bw[data-ph="play"] .bw-res .bw-eq, .sim-dom-root--portrait .bw[data-ph="wrong"] .bw-res .bw-eq { display: none; }
.sim-dom-root--portrait .bw[data-ph="wrong"] .bw-left { display: none; }
.sim-dom-root--portrait .bw[data-ph="won"] .bw-board { display: none; }
.sim-dom-root--portrait .bw .bw-rows { gap: 3px; }
.sim-dom-root--portrait .bw .bw-pm { min-height: 44px; }
.sim-dom-root--portrait .bw .bw-left { margin: 0 0 2px; }
.sim-dom-root--portrait .bw .bw-say { font-size: 15px; }
`;

export class BakeryWeekGame extends GameBoard {
  static HEIGHT = 430;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'In each of four weeks, share out the hours so every area gets its time and any extra goes where the week needs it.' } };
  static ARIA_LABEL = 'The ABC Bakery hours game, with made-up numbers. Four weeks. Each week you share out the hours you have between four areas: management and operations, finance and accounting, human resources, and marketing and sales, with minus and plus buttons. A usual week has 10 hours: operations needs 4, and the other three need 2 each. Some weeks have 12 hours and a note says what is happening; give the extra 2 hours to the area the news needs, then tap Done for the week.';

  async setup() {
    this.reset();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm bw"><div class="gm-head"><h2 class="bw-h"></h2>
        <p class="sub">Made-up numbers. Read the note, then share out the hours.</p></div>
        <div class="bw-main">
          <div class="bw-card bw-side"><div class="bw-fig"></div><div class="bw-sidetext"><div class="bw-pips"></div><p class="bw-note"></p>
            <p class="bw-usual"></p></div></div>
          <div class="bw-card bw-board"></div>
          <div class="bw-card bw-res" aria-live="polite"></div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.week = 0;
    this.hours = [0, 0, 0, 0];
    this.checked = false;      // Done tapped since the last change
    this.bad = [];             // area indexes that were off at the last Done
    this.done = [false, false, false, false];
    this.misses = 0;
    this.won = false;
    this.fresh = false;
  }

  left() { return WEEKS[this.week].hours - this.hours.reduce((t, h) => t + h, 0); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.bw-board')) return;
    const W = WEEKS[this.week];
    q('.bw-h').textContent = this.won ? 'Four weeks done' : `Week ${this.week + 1}${this.portrait() ? '' : ' of 4'}: ${W.title}`;
    q('.gm.bw').dataset.ph = this.won ? 'won' : this.checked && this.bad.length ? 'wrong' : 'play';
    q('.bw-fig').innerHTML = weekFig(W);
    q('.bw-pips').innerHTML = WEEKS.map((w, i) => `<span class="bw-pip" data-s="${this.done[i] ? 'done' : i === this.week && !this.won ? 'now' : ''}" aria-label="week ${i + 1}${this.done[i] ? ': done' : ''}"></span>`).join('');
    q('.bw-note').innerHTML = `<b>${W.hours} hours this week</b>${W.note}`;
    q('.bw-usual').innerHTML = 'Usual week:' + AREAS.map((a) => `<i style="background:color-mix(in oklab, ${col(a)} 22%, var(--sim-bg-surface));border:2px solid ${shade(col(a), 62)}">${a.need}</i>`).join('');
    const board = q('.bw-board');
    board.innerHTML = this.boardHtml();
    board.querySelectorAll('.bw-pm').forEach((b) => onTap(b, () => this.nudge(Number(b.dataset.i), Number(b.dataset.d))));
    const res = q('.bw-res');
    res.classList.toggle('bw-anim', this.fresh);
    res.innerHTML = this.resultHtml();
    const go = q('.bw-go');
    if (go) onTap(go, () => (this.done[this.week] ? this.next() : this.submit()));
    this.fresh = false;
    this.relayout?.();
  }

  portrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  boardHtml() {
    const W = WEEKS[this.week], left = this.won ? 0 : this.left(), locked = this.won || this.done[this.week];
    const hours = this.won ? RIGHT[3] : this.hours;
    const rows = AREAS.map((a, i) => {
      const c = col(a), rim = shade(c, 62), h = hours[i];
      const s = locked ? 'good' : this.checked && this.bad.includes(i) ? 'bad' : '';
      const tiles = Array.from({ length: h }, () => `<span class="bw-tile" style="background:color-mix(in oklab, ${c} 55%, var(--sim-bg-surface));border-color:${rim}"></span>`).join('');
      const minus = locked || h <= 0, plus = locked || left <= 0 || h >= MAX;
      return `<div class="bw-row"${s ? ` data-s="${s}"` : ''}>
        <span class="bw-name" style="background:color-mix(in oklab, ${c} 14%, var(--sim-bg-surface));border-color:${rim}">${a.t[0]}<br>${a.t[1]}</span>
        <span class="bw-tiles" aria-hidden="true">${tiles}</span>
        <span class="bw-ctl"><button type="button" class="tap btn bw-pm" data-i="${i}" data-d="-1"${minus ? ' aria-disabled="true"' : ''} aria-label="One hour less for ${a.name}">-</button>
        <span class="bw-n" aria-label="${a.name}: ${h} hours">${h}</span>
        <button type="button" class="tap btn bw-pm" data-i="${i}" data-d="1"${plus ? ' aria-disabled="true"' : ''} aria-label="One hour more for ${a.name}">+</button></span></div>`;
    }).join('');
    return `<p class="bw-left"${left === 0 ? ' data-s="zero"' : ''}>${iconSvg('clock', 2)}<span>Hours left</span><b>${left}</b><small>of ${W.hours}</small></p>
      <div class="bw-rows">${rows}</div>`;
  }

  resultHtml() {
    if (this.won) {
      return `<p class="bw-eq">Where the extra went</p><ul class="bw-sum">${WEEKS.map((w, i) => {
        const a = AREAS.find((x) => x.key === w.extra);
        return `<li><span>${w.tag}</span><b>${a ? `+2 ${a.short.toLowerCase()}` : 'usual hours'}</b></li>`;
      }).join('')}</ul>
        <p class="bw-say" data-tone="good">Every area needs time every week. The week's news decides where the extra goes.</p>`;
    }
    const W = WEEKS[this.week], left = this.left();
    if (this.done[this.week]) {
      return `<p class="bw-eq bw-pop">Good week!</p><p class="bw-say bw-pop" data-tone="good" style="--d:0.15s">${W.good}</p>
        <button type="button" class="tap btn bw-go">${this.week < 3 ? 'Next week' : 'See the four weeks'}</button>`;
    }
    const go = `<button type="button" class="tap btn bw-go"${left !== 0 ? ' aria-disabled="true"' : ''}>Done for the week</button>`;
    if (this.checked && this.bad.length) {
      const lines = this.bad.map((i, k) => `<p class="bw-say bw-pop" data-tone="bad" style="--d:${(k * 0.12).toFixed(2)}s">${this.reason(i)}</p>`).join('');
      return `<p class="bw-eq">Not yet</p>${lines}<p class="bw-rule">Change the hours, then tap Done again.</p>${go}`;
    }
    const start = this.week === 0 ? 'Use - and + to share them out.' : 'The hours start as last week\'s.';
    return `<p class="bw-eq">${left > 0 ? `Share out all ${W.hours} hours.` : 'All hours shared out.'}</p>
      <p class="bw-rule">${start}</p>
      <p class="bw-rule">Keep each area at its usual hours. Give any extra to the area the week's news needs.</p>${go}`;
  }

  reason(i) {
    const a = AREAS[i], W = WEEKS[this.week], h = this.hours[i], need = want(this.week)[i];
    if (h < need) return `<b>${a.short}</b> is short: ${a.low}`;
    const n = h - need, x = AREAS.find((y) => y.key === W.extra);
    const what = `${n} hour${n > 1 ? 's' : ''} too many`;
    return x ? `<b>${a.short}</b> has ${what}: this week's news needed ${n > 1 ? 'them' : 'it'} in ${x.short.toLowerCase()}.`
      : `<b>${a.short}</b> has ${what}: in a usual week no area needs extra.`;
  }

  nudge(i, d) {
    if (this.won || this.done[this.week]) return;
    const h = this.hours[i] + d;
    if (h < 0 || h > MAX || (d > 0 && this.left() <= 0)) return;
    this.hours[i] = h;
    this.checked = false;
    this.draw();
    this.root?.querySelector(`.bw-pm[data-i="${i}"][data-d="${d}"]`)?.focus?.();
  }

  submit() {
    if (this.won || this.done[this.week] || this.left() !== 0) return;
    const w = want(this.week);
    this.bad = AREAS.map((a, i) => i).filter((i) => this.hours[i] !== w[i]);
    this.checked = true;
    if (!this.bad.length) this.done[this.week] = true;
    else this.misses++;
    this.fresh = true;
    this.draw();
  }

  next() {
    if (!this.done[this.week]) return;
    if (this.week < 3) {
      this.week++;
      this.hours = RIGHT[this.week - 1].slice();   // start from last week's hours
      this.checked = false;
      this.bad = [];
      this.fresh = true;
      this.draw();
      return;
    }
    this.won = true;
    this.fresh = true;
    this.draw();
    finishGame(this);
  }

  checkObjective() { return this.won && this.done.every(Boolean) ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.draw();
  }

  testState() { return { week: this.week, hours: this.hours.slice(), left: this.left(), checked: this.checked, bad: this.bad.slice(), solved: this.done.slice(), won: this.won, misses: this.misses }; }
}
