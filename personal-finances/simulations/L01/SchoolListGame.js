// SchoolListGame - L01 mini-game (blk-l01-s07): pack Meera's school list with Rs 3,000.
//   The board: a fund meter (spent of Rs 3,000, left), a bag, and the shop's list: ten item cards in ONE mixed
//   list, order shuffled with Math.random every round (no crypto). The cards do not say need or want: deciding is
//   the game. Tap a card to put it in the bag; tap it in the bag to take it out. Over Rs 3,000 the meter turns the
//   warning colour and says "over by Rs N".
//   Check (checkObjective, real): win = all six needs in the bag AND the total within Rs 3,000. Then the bag
//   closes, every card shows its word (need / want, in its colour) and the meter shows "savings Rs N" (Rs 600 with
//   only the needs; less if wants that still fit went in). Not yet: one short reason, never the answer list.
// Numbers from STORYBOARD section 0 (school list). Colours are tokens only. ASCII only.
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';

const RS = '\u20B9';
const FUND = 3000;
const ITEMS = [
  { n: 'school bag', p: 550, need: true },
  { n: 'books', p: 700, need: true },
  { n: 'uniform and shoes', p: 600, need: true },
  { n: 'notebooks', p: 250, need: true },
  { n: 'pens and pencils', p: 120, need: true },
  { n: 'art supplies', p: 180, need: true },
  { n: 'new sports shoes', p: 900, need: false },
  { n: 'comic books', p: 250, need: false },
  { n: 'fancy pencil box', p: 90, need: false },
  { n: 'sticker set', p: 60, need: false },
];
const NEEDS = ITEMS.filter((it) => it.need).length;

function group(n) {
  const s = String(Math.round(Math.abs(n)));
  if (s.length <= 3) return s;
  let rest = s.slice(0, -3);
  const parts = [];
  while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2); }
  if (rest) parts.unshift(rest);
  return parts.join(',') + ',' + s.slice(-3);
}
const rs = (n) => RS + group(n);

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

const NEED = 'var(--sim-series-5)', WANT = 'var(--sim-series-8)', SAVE = 'var(--sim-series-3)', BAG = 'var(--sim-series-1)';

const CSS = `
.sl { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.sl .gm-head { padding-right: 60px; }
.sl .sl-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 596px minmax(0, 1fr); gap: 22px; align-items: start; }
.sl .sl-list { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.sl .sl-item, .sl .sl-gone { min-height: 92px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 6px 6px; text-align: center; }
.sl .sl-item { border-radius: var(--sim-radius-lg, 14px); }
.sl .sl-gone { border: 2.5px dashed var(--sim-stroke); border-radius: var(--sim-radius-lg, 14px); opacity: 0.55; }
.sl .sl-n { font: 800 17px/1.15 var(--sim-font); color: var(--sim-label); }
.sl .sl-p { font: 800 23px/1 var(--sim-font); color: var(--sim-label); }
.sl .sl-w { display: inline-block; font: 800 15px/1 var(--sim-font); padding: 4px 9px; border-radius: 99px; color: var(--sim-label);
  border: 2px solid color-mix(in oklab, var(--c) 64%, black); background: color-mix(in oklab, var(--c) 40%, var(--sim-bg-surface)); }
.sl .sl-act { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.sl .sl-say { flex: 1 1 auto; margin: 0; min-height: 48px; display: flex; align-items: center; font: 800 18px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.sl .sl-say[data-tone="good"] { color: var(--sim-good); }
.sl .sl-say[data-tone="bad"] { color: var(--sim-bad); }
.sl .sl-checkslot { flex: none; }
.sl .sl-meter { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md, 12px); padding: 6px 12px 8px; }
.sl .sl-mrow { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font: 700 17px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.sl .sl-mrow b { font: 800 22px/1 var(--sim-font); color: var(--sim-label); }
.sl .sl-track { position: relative; height: 22px; margin-top: 7px; border-radius: 11px; background: var(--sim-bg-deep); border: 2px solid var(--sim-stroke); overflow: hidden; }
.sl .sl-fill { position: absolute; left: 0; top: 0; bottom: 0; background: ${BAG}; transition: width 0.4s ease, background 0.2s; }
.sl .sl-meter[data-over="1"] { border-color: var(--sim-bad); }
.sl .sl-meter[data-over="1"] .sl-fill { background: var(--sim-bad); }
.sl .sl-meter[data-over="1"] .sl-left, .sl .sl-meter[data-over="1"] .sl-left b { color: var(--sim-bad); }
.sl .sl-meter[data-won="1"] .sl-left, .sl .sl-meter[data-won="1"] .sl-left b { color: color-mix(in oklab, ${SAVE} 70%, var(--sim-label)); }
.sl .sl-meter[data-won="1"] .sl-left b { font-size: 26px; }
.sl .sl-bag { position: relative; margin-top: 22px; border: 3px solid color-mix(in oklab, ${BAG} 64%, black); border-radius: 16px 16px 26px 26px;
  background: color-mix(in oklab, ${BAG} 12%, var(--sim-bg-surface)); padding: 0 7px 7px; min-height: 120px; }
.sl .sl-bag::before { content: ''; position: absolute; left: 50%; top: -21px; width: 100px; height: 22px; transform: translateX(-50%);
  border: 6px solid color-mix(in oklab, ${BAG} 64%, black); border-bottom: 0; border-radius: 40px 40px 0 0; }
.sl .sl-flap { margin: 0 -7px 6px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 12px 12px 0 0;
  font: 800 17px/1 var(--sim-font); color: var(--sim-label); background: color-mix(in oklab, ${BAG} 28%, var(--sim-bg-surface));
  border-bottom: 3px dashed color-mix(in oklab, ${BAG} 64%, black); transform-origin: top center; }
.sl .sl-bag[data-closed="1"] .sl-flap { height: 30px; background: ${BAG}; color: var(--sim-ink-on-1, var(--sim-bg-deep)); border-bottom: 3px solid color-mix(in oklab, ${BAG} 55%, black);
  border-radius: 12px 12px 22px 22px; animation: sl-close 0.5s cubic-bezier(.3,1.4,.5,1) both; }
@keyframes sl-close { from { transform: scaleY(0.3); } to { transform: none; } }
.sl .sl-in { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; }
.sl .sl-chip { min-height: 30px; height: 30px; display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 2px 9px; font: 800 15px/1 var(--sim-font); text-align: left; white-space: nowrap; }
.sl .sl-chip .sl-w { font-size: 14px; padding: 2px 7px; }
.sl .sl-chip b { font-size: 16px; }
.sl .sl-empty { grid-column: 1 / -1; margin: 18px 0; text-align: center; font: 700 17px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.sl [aria-disabled="true"] { cursor: default; }
@media (prefers-reduced-motion: reduce) { .sl .sl-bag[data-closed="1"] .sl-flap { animation: none; } .sl .sl-fill { transition: none; } }
.sim-dom-root--portrait .sl .gm-head { padding-right: 46px; }
.sim-dom-root--portrait .sl .sl-body { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.sim-dom-root--portrait .sl .sl-left { display: contents; }
.sim-dom-root--portrait .sl .sl-right { order: 1; }
.sim-dom-root--portrait .sl .sl-list { order: 2; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.sim-dom-root--portrait .sl .sl-act { order: 3; flex-direction: column; align-items: stretch; gap: 8px; margin-top: 0; }
.sim-dom-root--portrait .sl .sl-gone { display: none; }
.sim-dom-root--portrait .sl .sl-item { min-height: 66px; }
.sim-dom-root--portrait .sl .sl-n { font-size: 16px; }
.sim-dom-root--portrait .sl .sl-p { font-size: 20px; }
.sim-dom-root--portrait .sl .sl-say { font-size: 16px; min-height: 0; text-align: center; justify-content: center; }
.sim-dom-root--portrait .sl .sl-of { display: none; }
.sim-dom-root--portrait .sl .sl-chip { height: auto; white-space: normal; min-height: 44px; flex-direction: column; align-items: flex-start; justify-content: center; gap: 2px; font-size: 15px; }
.sim-dom-root--portrait .sl .sl-mrow { font-size: 15px; }
.sim-dom-root--portrait .sl .sl-mrow b { font-size: 19px; }
`;

const wordChip = (it) => `<span class="sl-w" style="--c:${it.need ? NEED : WANT}">${it.need ? 'need' : 'want'}</span>`;

export class SchoolListGame extends GameBoard {
  static HEIGHT = 405;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Put all six needs in the bag, keep the total within \u20B93,000, and keep what is left as savings.' } };
  static ARIA_LABEL = 'Meera has 3,000 rupees for the school list. Ten items in one mixed list: school bag 550, books 700, uniform and shoes 600, notebooks 250, pens and pencils 120, art supplies 180, new sports shoes 900, comic books 250, fancy pencil box 90, sticker set 60. Tap an item to put it in the bag, tap it in the bag to take it out. Put every need in the bag and keep the total within 3,000 rupees.';

  async setup() {
    this.reset();
    await super.setup();
    mountGame(this, {
      css: CSS, check: { label: 'Check my bag', in: '.sl-checkslot' },
      html: `<div class="gm sl"><div class="gm-head"><h2>Pack the school list</h2><p class="sub">Tap an item to put it in the bag. Tap it in the bag to take it out.</p></div>
        <div class="sl-body"><div class="sl-left"><div class="sl-list"></div><div class="sl-act"><p class="sl-say" aria-live="polite"></p><div class="sl-checkslot"></div></div></div>
          <div class="sl-right"><div class="sl-meter"></div><div class="sl-bag"><div class="sl-flap"></div><div class="sl-in"></div></div></div></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.order = shuffled(ITEMS.map((_, i) => i));
    this.bag = [];
    this.won = false;
  }

  total() { return this.bag.reduce((s, i) => s + ITEMS[i].p, 0); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.sl-list')) return;
    const W = this.won, inBag = new Set(this.bag), t = this.total(), over = t - FUND;
    q('.sl-list').innerHTML = this.order.map((i) => {
      const it = ITEMS[i];
      if (inBag.has(i)) return `<div class="sl-gone" aria-hidden="true"><span class="sl-n">${it.n}</span></div>`;
      return `<button type="button" class="tap btn sl-item" data-i="${i}"${W ? ' aria-disabled="true"' : ''} aria-label="${it.n}, ${it.p} rupees: put in the bag">`
        + `<span class="sl-n">${it.n}</span><span class="sl-p">${rs(it.p)}</span>${W ? wordChip(it) : ''}</button>`;
    }).join('');
    const meter = q('.sl-meter');
    meter.dataset.over = over > 0 ? '1' : '0';
    meter.dataset.won = W ? '1' : '0';
    const right = W ? `savings <b>${rs(FUND - t)}</b>` : over > 0 ? `over by <b>${rs(over)}</b>` : `left <b>${rs(FUND - t)}</b>`;
    meter.innerHTML = `<div class="sl-mrow"><span>spent <b>${rs(t)}</b><span class="sl-of"> of ${rs(FUND)}</span></span><span class="sl-left">${right}</span></div>`
      + `<div class="sl-track"><div class="sl-fill" style="width:${Math.min(100, (t / FUND) * 100).toFixed(1)}%"></div></div>`;
    const bag = q('.sl-bag');
    bag.dataset.closed = W ? '1' : '0';
    q('.sl-flap').textContent = W ? 'packed' : 'the bag';
    q('.sl-in').innerHTML = this.bag.length === 0 ? '<p class="sl-empty">The bag is empty.</p>'
      : this.bag.map((i) => {
        const it = ITEMS[i];
        return `<button type="button" class="tap btn sl-chip" data-i="${i}"${W ? ' aria-disabled="true"' : ''} aria-label="${it.n}, ${it.p} rupees: take out of the bag"><span>${it.n}</span>${W ? wordChip(it) : `<b>${rs(it.p)}</b>`}</button>`;
      }).join('');
    this.root.querySelectorAll('.sl-item').forEach((b) => onTap(b, () => this.toBag(Number(b.dataset.i))));
    this.root.querySelectorAll('.sl-chip').forEach((b) => onTap(b, () => this.outOfBag(Number(b.dataset.i))));
    this.relayout?.();
  }

  say(text, tone) {
    const el = this.root?.querySelector('.sl-say');
    if (!el) return;
    el.textContent = text;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  toBag(i) {
    if (this.won || this.bag.includes(i)) return;
    this.bag.push(i);
    this.draw();
    this.say('');
  }

  outOfBag(i) {
    if (this.won) return;
    this.bag = this.bag.filter((j) => j !== i);
    this.draw();
    this.say('');
  }

  /** The verdict: a real win, or one short reason (never the list of needs). */
  verdict() {
    if (!this.bag.length) return null;
    const t = this.total(), needsIn = this.bag.filter((i) => ITEMS[i].need).length, wantsIn = this.bag.length - needsIn;
    if (t > FUND) return { ok: false, hint: `Over ${rs(FUND)}: take out something the school day works without.` };
    if (needsIn < NEEDS) {
      const left = NEEDS - needsIn;
      return { ok: false, hint: wantsIn ? 'A want is in the bag while something the school day needs is still out.'
        : `Not yet: ${left} thing${left > 1 ? 's' : ''} the school day cannot do without ${left > 1 ? 'are' : 'is'} still out.` };
    }
    return { ok: true };
  }

  checkObjective() {
    const v = this.verdict();
    if (!v) { this.say('Put something in the bag first.', 'bad'); return null; }
    if (v.ok) {
      if (!this.won) {
        this.won = true;
        this.draw();
        this.say(`Packed. Every need is in, and ${rs(FUND - this.total())} is left as savings.`, 'good');
      }
      return { ok: true };
    }
    this.say(v.hint, 'bad');
    return v;
  }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.say('');
    this.draw();
  }

  testState() { return { won: this.won, order: this.order, bag: this.bag.slice(), total: this.total() }; }
}
