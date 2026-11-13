// ActionMatchGameScene - L06 game (blk-l06-s08): which government action fits each case?
//   Six cases, shuffled with Math.random (no crypto), one at a time on a big card (a picture and one line).
//   Five actions, always in the same order: highest price | lowest price | regulator | government provides |
//   leave it to the market. Wrong: that action is struck out for this case and one short reason shows; try again.
//   Right: the card gets the action as a green chip, a short "why" line, and a "Next case" button. A row of six
//   marks shows how many are done. Win (checkObjective, real): all six right; finishGame -> the host's verdict.
// Cases and keys (STORYBOARD L06 s08): medicine too costly -> highest price; workers paid too little -> lowest
// price; one company runs all phone services -> regulator; the neighbourhood needs a park -> government
// provides; shopkeepers hide sanitisers in a pandemic -> highest price; mango prices fall when the crop is
// large -> leave it to the market. No rupee numbers. Colours are tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { arrow } from '../shared/MarketParts.js';
import { heap } from '../shared/MangoKit.js';
import { medBox, icon, govBuilding } from '../shared/GovParts.js';

const f1 = (v) => (+v).toFixed(1);
const ACTS = ['highest price', 'lowest price', 'regulator', 'government provides', 'leave it to the market'];
const CASES = [
  { line: 'Medicine costs too much for many families.', key: 0, pic: 'med',
    why: 'Medicine is essential and costs too much: the price must not go above a limit.',
    ok: 'A highest price keeps medicine within reach.' },
  { line: 'Workers are paid too little.', key: 1, pic: 'wage',
    why: 'The wage is too low: the pay must not go below a limit.',
    ok: 'A minimum wage is a lowest price for work.' },
  { line: 'One company runs all the phone services.', key: 2, pic: 'phone',
    why: 'There is only one seller: someone must watch how it sets prices.',
    ok: 'TRAI watches phone and internet services.' },
  { line: 'The neighbourhood needs a park.', key: 3, pic: 'park',
    why: 'Each family waits for others to pay, so the park is never built.',
    ok: 'A park is a public good: the government pays for it.' },
  { line: 'In a pandemic, shopkeepers hide sanitisers to sell them at a higher price.', key: 0, pic: 'hide',
    why: 'Hiding goods pushes the price up in an emergency: the price needs an upper limit.',
    ok: 'In 2020 sanitisers were capped at a highest price.' },
  { line: 'Mango prices fall when the crop is large.', key: 4, pic: 'mango',
    why: 'A big crop and a lower price is the market working: buyers get more, and no rule is needed.',
    ok: 'Demand and supply find the new price by themselves.' },
];

/** The case picture, viewBox 0 0 240 130. */
function picture(kind) {
  const up = (x) => arrow(x, 112, x, 26, 'var(--sim-bad)', 9);
  const dn = (x, col = 'var(--sim-bad)') => arrow(x, 24, x, 110, col, 9);
  let s = '';
  if (kind === 'med') s = medBox(70, 108, 76) + medBox(130, 108, 60) + up(196);
  else if (kind === 'wage') s = icon('person', 90, 66, 104, 'var(--sim-series-1)') + dn(180);
  else if (kind === 'phone') s = icon('phone', 66, 66, 92, 'var(--sim-series-6)') + icon('phone', 128, 66, 92, 'var(--sim-series-6)') + icon('phone', 190, 66, 92, 'var(--sim-series-6)');
  else if (kind === 'park') s = icon('house', 52, 74, 80, 'var(--sim-series-8)') + icon('tree', 128, 64, 104, 'var(--sim-series-3)') + icon('house', 204, 74, 80, 'var(--sim-series-8)');
  else if (kind === 'hide') s = icon('shop', 84, 66, 112, 'var(--sim-series-4)') + up(186);
  else s = heap(92, 112, 4, { r: 15 }) + dn(196, 'var(--sim-label-muted)');
  return `<svg viewBox="0 0 240 130" class="am-pic" aria-hidden="true">${s}</svg>`;
}

/** A small icon for an action button (24 px, viewBox 0 0 48 48). */
function actIcon(a) {
  const bar = (y) => `<rect x="6" y="${y}" width="36" height="7" rx="3.5" style="fill:var(--sim-label)"/>`;
  let s = '';
  if (a === 0) s = bar(10) + '<rect x="17" y="4" width="14" height="6" rx="3" style="fill:var(--sim-label)"/>' + '<path d="M24 42V22M16 28l8-8 8 8" style="fill:none;stroke:var(--sim-bad);stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>';
  else if (a === 1) s = bar(31) + '<path d="M24 6v20M16 20l8 8 8-8" style="fill:none;stroke:var(--sim-bad);stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>';
  else if (a === 2) return `<span class="am-ic" aria-hidden="true">${icon('eye', 24, 24, 44, 'var(--sim-series-4)').replace(/^<svg/, '<svg style="display:block"')}</span>`;
  else if (a === 3) return `<span class="am-ic" aria-hidden="true"><svg viewBox="0 0 48 48">${govBuilding(24, 44, 46, { label: false }).svg}</svg></span>`;
  else s = '<path d="M6 34L18 22 28 30 42 14" style="fill:none;stroke:var(--sim-series-5);stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/><path d="M6 14L18 26 28 20 42 34" style="fill:none;stroke:var(--sim-series-7);stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>';
  return `<span class="am-ic" aria-hidden="true"><svg viewBox="0 0 48 48">${s}</svg></span>`;
}

const CSS = `
.am { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.am .am-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 470px minmax(0, 1fr); gap: 22px; align-items: start; }
.am .am-card { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 16px 14px;
  background: var(--sim-bg-surface); border: 3px solid var(--sim-series-4); border-radius: calc(18px * var(--look-radius, 1)); }
.am .am-card--ok { border-color: var(--sim-good); }
.am .am-pic { display: block; width: 240px; height: 130px; }
.am .am-line { margin: 0; text-align: center; font: 800 22px/1.25 var(--sim-font); color: var(--sim-label); min-height: 56px; display: flex; align-items: center; }
.am .sub { font-size: 17px; }
.am .am-n { position: absolute; left: 14px; top: 10px; font: 800 17px/1 var(--sim-font); color: var(--sim-label-muted); }
.am .am-chip { display: inline-block; padding: 6px 16px; border-radius: 999px; font: 800 19px/1.1 var(--sim-font);
  background: var(--sim-good); color: var(--sim-bg-deep); }
.am .am-marks { display: flex; gap: 8px; justify-content: center; margin-top: 8px; }
.am .am-mark { width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid var(--sim-label-muted); background: var(--sim-bg-surface); }
.am .am-mark--done { background: var(--sim-good); border-color: var(--sim-good); }
.am .am-mark--now { border-color: var(--sim-accent); border-width: 4px; }
.am .am-right { display: flex; flex-direction: column; gap: 10px; }
.am .am-acts { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 9px; }
.am .am-a { display: flex; align-items: center; gap: 10px; min-height: 62px; padding: 4px 12px; font: 800 19px/1.15 var(--sim-font); text-align: left; }
.am .am-a:last-child { grid-column: 1 / -1; justify-content: center; }
.am .am-ic { flex: 0 0 auto; width: 30px; height: 30px; display: block; }
.am .am-ic svg { display: block; width: 30px; height: 30px; }
.am .am-a[aria-disabled="true"] { opacity: 0.4; text-decoration: line-through; cursor: default; }
.am .am-a--ok { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); }
.am .am-row { display: flex; gap: 12px; align-items: center; min-height: 52px; }
.am .am-say { flex: 1 1 auto; margin: 0; font: 700 18px/1.3 var(--sim-font); color: var(--sim-label); }
.am .am-say b { color: var(--sim-accent); }
.am .am-say[data-tone="good"] { color: var(--sim-good); }
.am .am-say[data-tone="bad"] { color: var(--sim-bad); }
.am .am-next { flex: 0 0 auto; min-width: 140px; min-height: 60px; background: var(--sim-accent); color: var(--sim-bg-deep); border-color: transparent; font: 800 18px/1 var(--sim-font); }
.am .am-pop { animation: am-pop 0.4s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes am-pop { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .am .am-pop { animation: none; } }
.sim-dom-root--portrait .am .am-body { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.sim-dom-root--portrait .am .am-card { padding: 8px 10px 10px; gap: 4px; }
.sim-dom-root--portrait .am .am-pic { width: 180px; height: 98px; }
.sim-dom-root--portrait .am .am-line { font-size: 18px; min-height: 46px; }
.sim-dom-root--portrait .am .sub { font-size: 15px; }
.sim-dom-root--portrait .am .am-n { font-size: 14px; left: 10px; top: 8px; }
.sim-dom-root--portrait .am .am-chip { font-size: 16px; }
.sim-dom-root--portrait .am .am-marks { margin-top: 4px; gap: 6px; }
.sim-dom-root--portrait .am .am-acts { grid-template-columns: minmax(0, 1fr); gap: 7px; }
.sim-dom-root--portrait .am .am-a { min-height: 48px; font-size: 17px; }
.sim-dom-root--portrait .am .am-a:last-child { justify-content: flex-start; }
.sim-dom-root--portrait .am .am-row { flex-direction: column; align-items: stretch; gap: 8px; min-height: 0; }
.sim-dom-root--portrait .am .am-say { font-size: 16px; text-align: center; }
.sim-dom-root--portrait .am .am-next { width: 100%; min-height: 48px; }
`;

export class ActionMatchGameScene extends GameBoard {
  static HEIGHT = 400;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'For each of the six cases, choose the government action that fits: a highest price, a lowest price, a regulator, the government provides it, or leave the market alone. Win when every case has the right action.' } };
  static ARIA_LABEL = 'Six cases, one at a time: medicine costs too much; workers are paid too little; one company runs all the phone services; the neighbourhood needs a park; in a pandemic shopkeepers hide sanitisers; mango prices fall when the crop is large. For each, choose an action: highest price, lowest price, regulator, government provides, or leave it to the market. A wrong choice is struck out with a short reason. Win when all six are right.';

  async setup() {
    this.reset();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm am"><div class="gm-head"><h2>Which action fits?</h2><p class="sub">Six cases, one at a time. Choose what the government should do.</p></div>
        <div class="am-body"><div class="am-left"></div><div class="am-right"><div class="am-acts" role="group" aria-label="government actions"></div><div class="am-row"><p class="am-say" aria-live="polite"></p></div></div></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
    this.say('Read the case. Which <b>action</b> fits?');
  }

  reset() {
    const d = CASES.map((_, i) => i);
    for (let n = d.length - 1; n > 0; n--) { const j = Math.floor(Math.random() * (n + 1)); [d[n], d[j]] = [d[j], d[n]]; }
    this.deck = d;
    this.i = 0;
    this.got = false;
    this.bad = new Set();
    this.won = false;
    this.fresh = false;
  }

  get kase() { return CASES[this.deck[this.i]]; }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.am-left')) return;
    const c = this.kase;
    let marks = '';
    for (let n = 0; n < this.deck.length; n++) {
      const done = n < this.i || (n === this.i && this.got);
      marks += `<span class="am-mark${done ? ' am-mark--done' : ''}${n === this.i && !done ? ' am-mark--now' : ''}"></span>`;
    }
    q('.am-left').innerHTML = `<div class="am-card${this.got ? ' am-card--ok' : ''}"><span class="am-n">case ${this.i + 1} of 6</span>${picture(c.pic)}`
      + `<p class="am-line">${c.line}</p>${this.got ? `<span class="am-chip${this.fresh ? ' am-pop' : ''}">${ACTS[c.key]}</span>` : ''}</div>`
      + `<div class="am-marks" aria-label="${this.i + (this.got ? 1 : 0)} of 6 done">${marks}</div>`;
    q('.am-acts').innerHTML = ACTS.map((a, n) => {
      const off = this.bad.has(n) || (this.got && n !== c.key);
      const ok = this.got && n === c.key;
      return `<button type="button" class="tap btn am-a${ok ? ' am-a--ok' : ''}" data-a="${n}"${off ? ' aria-disabled="true"' : ''} aria-label="${a}">${actIcon(n)}<span>${a}</span></button>`;
    }).join('');
    q('.am-acts').querySelectorAll('.am-a').forEach((b) => onTap(b, () => this.answer(Number(b.dataset.a))));
    const row = q('.am-row');
    row.querySelector('.am-next')?.remove();
    if (this.got && !this.won) {
      row.insertAdjacentHTML('beforeend', `<button type="button" class="tap btn am-next">${this.i === this.deck.length - 1 ? 'Finish' : 'Next case'}</button>`);
      onTap(row.querySelector('.am-next'), () => this.next());
    }
    this.fresh = false;
    this.relayout?.();
  }

  say(html, tone) {
    const el = this.root?.querySelector('.am-say');
    if (!el) return;
    el.innerHTML = html;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  answer(a) {
    if (this.won || this.got || this.bad.has(a)) return;
    const c = this.kase;
    if (a !== c.key) {
      this.bad.add(a);
      this.draw();
      this.say(`Not ${ACTS[a]}. ${c.why}`, 'bad');
      return;
    }
    this.got = true;
    this.fresh = true;
    this.draw();
    this.say(`Right: ${c.ok}`, 'good');
  }

  next() {
    if (!this.got) return;
    if (this.i >= this.deck.length - 1) {
      this.won = true;
      this.draw();
      this.say('All six right. Each problem has its own action, and sometimes the best action is none.', 'good');
      finishGame(this);
      return;
    }
    this.i += 1;
    this.got = false;
    this.bad = new Set();
    this.draw();
    this.say('Read the case. Which <b>action</b> fits?');
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.draw();
    this.say('Read the case. Which <b>action</b> fits?');
  }

  testState() { return { won: this.won, i: this.i, got: this.got, deck: this.deck.map((n) => CASES[n].line), bad: [...this.bad] }; }
}
