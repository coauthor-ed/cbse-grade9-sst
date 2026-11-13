// BeatThePriceGame - L02 mini-game (blk-l02-s06): keep the money for one year where it still buys the item.
//   Three rounds in a fixed order (numbers from the old game):
//     1 school shoes Rs 1,000, prices +6% -> Rs 1,060. gullak 0% -> 1,000; savings account 4% -> 1,040;
//       deposit 7.5% (after 1 year) -> 1,075. Win: deposit.
//     2 table fan Rs 2,000, +9% -> 2,180. gullak 2,000; savings account 8% -> 2,160; deposit 9.5% (after 1 year)
//       -> 2,190. Win: deposit.
//     3 bicycle Rs 5,000, +4% -> 5,200. gullak 5,000; savings account 4.5% (any day) -> 5,225; deposit 7.5% but
//       only after 5 years -> not free in time. Win: savings account.
//   The board: the item with its price tag (today, then a year later), three place cards (rate + rule: any day /
//   after 1 year / after 5 years; order shuffled with Math.random each round, no crypto), and "your money" with
//   the place it waits in. Tap a card, then "one year later": money and price count up together (0.8 s). Win
//   when the money is at least the new price and free in time; else one short reason and "try again".
//   checkObjective is real: all three rounds won (finishGame after the third). The cards never show the result.
// Numbers checked with node. Colours are tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { civicHtml } from 'simulations/base/kit/SimCivic.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { shade, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, gullak, bicycle, tag, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const PLACES = {
  gullak: { name: 'gullak', rule: 'any day', wait: 0 },
  account: { name: 'savings account', rule: 'any day', wait: 0 },
  deposit: { name: 'deposit', rule: 'after 1 year', wait: 1 },
};
const ROUNDS = [
  { item: 'school shoes', poss: 'shoes\'', art: 'shoes', price: 1000, up: 6, rates: { gullak: 0, account: 4, deposit: 7.5 }, waits: {} },
  { item: 'table fan', poss: 'fan\'s', art: 'fan', price: 2000, up: 9, rates: { gullak: 0, account: 8, deposit: 9.5 }, waits: {} },
  { item: 'bicycle', poss: 'bicycle\'s', art: 'bicycle', price: 5000, up: 4, rates: { gullak: 0, account: 4.5, deposit: 7.5 }, waits: { deposit: 5 } },
];
const KEYS = ['gullak', 'account', 'deposit'];
const after1 = (v, pct) => Math.round(v * (1 + pct / 100));
const waitOf = (r, k) => r.waits[k] ?? PLACES[k].wait;
const ruleOf = (r, k) => { const w = waitOf(r, k); return w === 0 ? 'any day' : `after ${w} year${w > 1 ? 's' : ''}`; };
const pctText = (p) => `${p}%`;

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

const SAVE = 'var(--sim-series-3)', BAD = 'var(--sim-bad)';

/** A school shoe, side view, (x, y) = ground under the middle, w wide. No logo. */
function shoeArt(x, y, w) {
  const col = 'var(--sim-series-4)', rim = shade(col, 60), h = w * 0.42, x0 = x - w / 2;
  const d = `M${f1(x0 + w * 0.04)} ${f1(y - h * 0.18)}Q${f1(x0)} ${f1(y - h * 0.55)} ${f1(x0 + w * 0.12)} ${f1(y - h * 0.8)}L${f1(x0 + w * 0.2)} ${f1(y - h)}H${f1(x0 + w * 0.46)}Q${f1(x0 + w * 0.52)} ${f1(y - h * 0.6)} ${f1(x0 + w * 0.7)} ${f1(y - h * 0.5)}Q${f1(x0 + w * 0.98)} ${f1(y - h * 0.42)} ${f1(x0 + w)} ${f1(y - h * 0.18)}Z`;
  return `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="${f1(w * 0.52)}" ry="${f1(w * 0.04)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`
    + `<path d="${d}" ${fill(col, `stroke:${rim};stroke-width:3;stroke-linejoin:round`)}/>`
    + `<rect x="${f1(x0 + w * 0.02)}" y="${f1(y - h * 0.2)}" width="${f1(w * 0.98)}" height="${f1(h * 0.2)}" rx="${f1(h * 0.08)}" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:3`)}/>`
    + [0.5, 0.58, 0.66].map((t) => `<path d="M${f1(x0 + w * (t - 0.04))} ${f1(y - h * (0.86 - (t - 0.5) * 1.2))}l${f1(w * 0.08)} ${f1(h * 0.1)}" ${stroke('var(--sim-bg-surface)', 3)}/>`).join('');
}

/** A table fan, (x, y) = ground under the middle, w wide. Three blades in a round guard. No face. */
function fanArt(x, y, w) {
  const col = 'var(--sim-series-7)', rim = shade(col, 60), r = w * 0.36, cy = y - w * 0.62;
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="${f1(w * 0.36)}" ry="${f1(w * 0.05)}" ${fill('color-mix(in oklab, var(--sim-label) 14%, transparent)')}/>`
    + `<path d="M${f1(x - w * 0.05)} ${f1(cy + r * 0.5)}L${f1(x - w * 0.07)} ${f1(y - w * 0.08)}H${f1(x + w * 0.07)}L${f1(x + w * 0.05)} ${f1(cy + r * 0.5)}Z" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - w * 0.3)}" y="${f1(y - w * 0.1)}" width="${f1(w * 0.6)}" height="${f1(w * 0.1)}" rx="${f1(w * 0.04)}" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(cy)}" r="${f1(r)}" ${fill('color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)', `stroke:${rim};stroke-width:3`)}/>`;
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 - 90) * Math.PI / 180, bx = x + Math.cos(a) * r * 0.5, by = cy + Math.sin(a) * r * 0.5;
    s += `<ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="${f1(r * 0.42)}" ry="${f1(r * 0.22)}" transform="rotate(${f1(i * 120 - 90)} ${f1(bx)} ${f1(by)})" ${fill(shade(col, 85), `stroke:${rim};stroke-width:2`)}/>`;
  }
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 6; s += `<path d="M${f1(x - Math.cos(a) * r)} ${f1(cy - Math.sin(a) * r)}L${f1(x + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)}" ${stroke(rim, 1.2, 'opacity:0.45')}/>`; }
  return s + `<circle cx="${f1(x)}" cy="${f1(cy)}" r="${f1(r * 0.14)}" ${fill(rim)}/>`;
}

function itemArt(kind, x, y, w) {
  if (kind === 'shoes') return shoeArt(x, y, w * 0.8);
  if (kind === 'fan') return fanArt(x, y, w * 0.62);
  return bicycle(x, y, w * 0.82);
}

/** The picture of a place, as an inline svg string, s px wide. */
function placeArt(k, s) {
  if (k === 'gullak') return `<svg viewBox="0 0 120 112" width="${s}" height="${Math.round(s * 0.93)}" aria-hidden="true">${gullak(60, 108, { w: 104 })}</svg>`;
  const bank = civicHtml('bank', { size: s });
  if (k === 'account') return bank;
  const cal = iconSvg('calendar', 4).replace(' width="48" height="48"', ` width="${Math.round(s * 0.42)}" height="${Math.round(s * 0.42)}"`);
  return `<span class="bp-dep">${bank}<span class="bp-cal">${cal}</span></span>`;
}

const CSS = MONEY_CSS + `
.bp { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.bp .gm-head { display: flex; align-items: baseline; gap: 16px; }
.bp .gm-head h2 { white-space: nowrap; }
.bp .bp-dots { display: flex; gap: 6px; margin-left: auto; align-self: center; }
.bp .bp-dot { width: 18px; height: 18px; border-radius: 99px; border: 2.5px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.bp .bp-dot[data-s="won"] { background: ${SAVE}; border-color: color-mix(in oklab, ${SAVE} 60%, black); }
.bp .bp-dot[data-s="now"] { border-color: var(--sim-accent); border-width: 4px; }
.bp .bp-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 250px minmax(0, 1fr) 232px; gap: 14px; align-items: stretch; }
.bp .bp-panel { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg, 14px); padding: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.bp .bp-panel svg.bp-l, .bp .bp-panel svg.bp-p { display: block; width: 100%; height: auto; }
.bp .bp-panel svg.bp-p { display: none; }
.sim-dom-root--portrait .bp .bp-panel svg.bp-l { display: none; }
.sim-dom-root--portrait .bp .bp-panel svg.bp-p { display: block; }
.bp .bp-where { height: 92px; display: flex; align-items: flex-end; justify-content: center; }
.bp .bp-none { width: 96px; height: 80px; display: flex; align-items: center; justify-content: center; border: 3px dashed var(--sim-stroke); border-radius: 14px; font: 800 30px/1 var(--sim-font); color: var(--sim-label-muted); }
.bp .bp-in { margin: 6px 0 0; font: 800 19px/1.2 var(--sim-font); color: var(--sim-label); text-align: center; }
.bp .bp-in[data-none="1"] { color: var(--sim-label-muted); font-weight: 700; }
.bp .bp-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.bp .bp-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 8px 6px; text-align: center; border-radius: var(--sim-radius-lg, 14px); }
.bp .bp-card[aria-pressed="true"] { outline: 4px solid var(--sim-accent); outline-offset: 0; background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.bp .bp-art { height: 74px; display: flex; align-items: flex-end; justify-content: center; }
.bp .bp-dep { position: relative; display: inline-block; }
.bp .bp-cal { position: absolute; right: -14px; top: -8px; }
.bp .bp-n { font: 800 19px/1.15 var(--sim-font); color: var(--sim-label); }
.bp .bp-r { font: 800 27px/1 var(--sim-font); color: var(--sim-label); }
.bp .bp-r small { font-size: 16px; font-weight: 700; color: var(--sim-label-muted); }
.bp .bp-rule { display: inline-block; white-space: nowrap; font: 800 16px/1 var(--sim-font); padding: 5px 10px; border-radius: 99px; color: var(--sim-label);
  border: 2px solid var(--sim-stroke); background: var(--sim-bg-deep); }
.bp .bp-rule[data-wait="1"] { border-color: color-mix(in oklab, var(--sim-series-4) 64%, black); background: color-mix(in oklab, var(--sim-series-4) 22%, var(--sim-bg-surface)); }
.bp .bp-act { display: flex; align-items: center; gap: 14px; min-height: 54px; }
.bp .bp-say { flex: 1 1 auto; margin: 0; font: 800 19px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.bp .bp-say[data-tone="good"] { color: color-mix(in oklab, ${SAVE} 62%, var(--sim-label)); }
.bp .bp-say[data-tone="bad"] { color: var(--sim-bad); }
.bp .bp-go { flex: none; min-width: 210px; min-height: 50px; font: 800 20px/1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.bp .bp-go[aria-disabled="true"] { background: var(--sim-bg-surface); color: var(--sim-label-muted); border-color: var(--sim-stroke); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.bp [aria-disabled="true"] { cursor: default; }
.sim-dom-root--portrait .bp .gm-head { flex-wrap: wrap; gap: 4px 10px; }
.sim-dom-root--portrait .bp .gm-head .sub { flex-basis: 100%; order: 3; }
.sim-dom-root--portrait .bp .bp-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .bp .bp-item { grid-column: 1; grid-row: 1; }
.sim-dom-root--portrait .bp .bp-money { grid-column: 2; grid-row: 1; }
.sim-dom-root--portrait .bp .bp-cards { grid-column: 1 / -1; grid-row: 2; grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .bp .bp-card { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; grid-template-rows: auto auto; column-gap: 8px; row-gap: 3px; justify-items: start; align-items: center; text-align: left; padding: 6px 10px; min-height: 64px; }
.sim-dom-root--portrait .bp .bp-art { grid-row: 1 / 3; height: auto; width: 56px; }
.sim-dom-root--portrait .bp .bp-n { font-size: 17px; }
.sim-dom-root--portrait .bp .bp-r { grid-column: 3; grid-row: 1 / 3; font-size: 24px; }
.sim-dom-root--portrait .bp .bp-rule { font-size: 15px; padding: 3px 8px; }
.sim-dom-root--portrait .bp .bp-cal { right: -8px; top: -6px; }
.sim-dom-root--portrait .bp .bp-where { height: 56px; }
.sim-dom-root--portrait .bp .bp-where > svg, .sim-dom-root--portrait .bp .bp-where .bp-dep > svg { width: 64px; height: auto; }
.sim-dom-root--portrait .bp .bp-art > svg, .sim-dom-root--portrait .bp .bp-art .bp-dep > svg { width: 54px; height: auto; }
.sim-dom-root--portrait .bp .bp-cal svg { width: 24px; height: 24px; }
.sim-dom-root--portrait .bp .bp-none { width: 60px; height: 50px; }
.sim-dom-root--portrait .bp .bp-in { font-size: 15px; }
.sim-dom-root--portrait .bp .bp-act { flex-direction: column; align-items: stretch; gap: 8px; }
.sim-dom-root--portrait .bp .bp-say { font-size: 16px; text-align: center; min-height: 42px; }
.sim-dom-root--portrait .bp .bp-go { width: 100%; }
`;

export class BeatThePriceGame extends GameBoard {
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'In all three rounds, pick a place where the money grows faster than prices and can be taken out in time, so it still buys the item after one year.' } };
  static ARIA_LABEL = 'Three rounds. Each round shows an item, its price today and how fast prices rise this year. Pick where the money waits for one year: a gullak, a savings account or a deposit, each with its own rate and its own rule for taking the money out. Then tap one year later. You win a round when, after one year, the money still buys the item.';

  async setup() {
    this.resetAll();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm bp"><div class="gm-head"><h2>Beat the price tag</h2><div class="bp-dots" aria-hidden="true"></div><p class="sub"></p></div>
        <div class="bp-body"><div class="bp-panel bp-item"></div><div class="bp-cards"></div><div class="bp-panel bp-money"></div></div>
        <div class="bp-act"><p class="bp-say" aria-live="polite"></p><button type="button" class="tap btn bp-go"></button></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    const go = this.root?.querySelector?.('.bp-go');
    if (go) onTap(go, () => this.go());
    this.draw();
  }

  resetAll() {
    for (const t of (this._bpTimers ?? []).splice(0)) clearTimeout(t);
    this._bpTimers = [];
    this.round = 0;
    this.won = [false, false, false];
    this.newRound();
  }

  newRound() {
    this.order = shuffled(KEYS);
    this.pick = null;
    this.phase = 'pick';    // pick | grow | done
    this.t = 0;             // 0..1 through the year
    this.result = null;     // null | 'win' | 'short' | 'wait'
  }

  get R() { return ROUNDS[this.round]; }

  /** The money at the end of the year for place k (the start amount if it is not free in time). */
  endMoney(k) { const r = this.R; return waitOf(r, k) > 1 ? r.price : after1(r.price, r.rates[k]); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.bp-cards')) return;
    const r = this.R, t = this.t, grown = this.phase !== 'pick';
    const newPrice = after1(r.price, r.up), price = Math.round(r.price + (newPrice - r.price) * t);
    const money = this.pick ? Math.round(r.price + (this.endMoney(this.pick) - r.price) * t) : r.price;
    q('.bp-dots').innerHTML = this.won.map((w, i) => `<span class="bp-dot" data-s="${w ? 'won' : i === this.round ? 'now' : ''}"></span>`).join('');
    q('.sub').textContent = `Round ${this.round + 1} of 3. Pick where the money waits, then tap one year later.`;
    // the item and its price
    const lab = `${r.item}, price ${grown ? 'a year later' : 'today'} ${price} rupees; prices rise ${r.up}% this year`;
    q('.bp-item').innerHTML = `<svg class="bp-l" viewBox="0 0 250 236" role="img" aria-label="${lab}">`
      + itemArt(r.art, 125, 104, 190)
      + `<text x="125" y="136" text-anchor="middle" style="font:800 20px var(--sim-font);fill:${BAD}">prices +${r.up}% this year</text>`
      + tag(132, 190, grown ? 'price a year later' : 'price today', price, { w: 220, labelSize: 19, valueSize: 36, ring: grown && t >= 1 })
      + '</svg>'
      + `<svg class="bp-p" viewBox="0 0 156 184" role="img" aria-label="${lab}">`
      + itemArt(r.art, 78, 74, 124)
      + `<text x="78" y="104" text-anchor="middle" style="font:800 17px var(--sim-font);fill:${BAD}">prices +${r.up}%</text>`
      + tag(82, 146, grown ? 'a year later' : 'today', price, { w: 148, labelSize: 17, valueSize: 28, ring: grown && t >= 1 })
      + '</svg>';
    // the cards
    const done = this.phase === 'done';
    q('.bp-cards').innerHTML = this.order.map((k) => {
      const on = this.pick === k, w = waitOf(r, k);
      return `<button type="button" class="tap btn bp-card" data-k="${k}" aria-pressed="${on}"${grown ? ' aria-disabled="true"' : ''} aria-label="${PLACES[k].name}, ${r.rates[k]}% a year, money out ${ruleOf(r, k)}">`
        + `<span class="bp-art">${placeArt(k, 80)}</span><span class="bp-n">${PLACES[k].name}</span>`
        + `<span class="bp-r">${pctText(r.rates[k])} <small>a year</small></span><span class="bp-rule" data-wait="${w > 0 ? 1 : 0}">${ruleOf(r, k)}</span></button>`;
    }).join('');
    this.root.querySelectorAll('.bp-card').forEach((b) => onTap(b, () => this.choose(b.dataset.k)));
    // your money
    const k = this.pick, stuck = k && waitOf(r, k) > 1 && grown;
    const tone = done && this.result === 'win' ? 'save' : 'plain';
    const where = k ? placeArt(k, 96) : '<span class="bp-none">?</span>';
    q('.bp-money').innerHTML = `<div class="bp-where">${where}</div><p class="bp-in"${k ? '' : ' data-none="1"'}>${k ? `in the ${PLACES[k].name}` : 'pick a place'}</p>`
      + `<svg class="bp-l" viewBox="0 0 232 104" role="img" aria-label="${k ? `your money in the ${PLACES[k].name}: ${money} rupees` : 'your money: pick a place'}">`
      + tag(122, 52, stuck ? 'free in year 5' : 'your money', money, { w: 208, labelSize: 19, valueSize: 36, tone, ring: done && this.result === 'win' }) + '</svg>'
      + `<svg class="bp-p" viewBox="0 0 156 76" aria-hidden="true">`
      + tag(82, 38, stuck ? 'free in year 5' : 'your money', money, { w: 148, labelSize: 17, valueSize: 28, tone, ring: done && this.result === 'win' }) + '</svg>';
    // the action button
    const go = q('.bp-go');
    const allWon = this.won.every(Boolean);
    go.textContent = this.phase === 'pick' ? 'one year later' : this.phase === 'grow' ? 'one year later'
      : this.result === 'win' ? (allWon ? 'all rounds won' : 'next round') : 'try again';
    go.setAttribute('aria-disabled', String((this.phase === 'pick' && !this.pick) || this.phase === 'grow' || allWon));
    this.relayout?.();
  }

  say(text, tone) {
    const el = this.root?.querySelector('.bp-say');
    if (!el) return;
    el.textContent = text;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  choose(k) {
    if (this.phase !== 'pick' || !KEYS.includes(k)) return;
    this.pick = k;
    this.say(`The money waits in the ${PLACES[k].name}. Tap one year later.`);
    this.draw();
  }

  go() {
    if (this.phase === 'pick') {
      if (!this.pick) { this.say('Pick a place for the money first.', 'bad'); return; }
      this.grow();
    } else if (this.phase === 'done') {
      if (this.result === 'win') {
        if (this.won.every(Boolean)) return;
        this.round += 1;
        this.newRound();
        this.say('');
        this.draw();
      } else {
        this.newRound();
        this.say('');
        this.draw();
      }
    }
  }

  /** One year: money and price count up together in 10 steps (0.8 s), then the verdict. */
  grow() {
    this.phase = 'grow';
    this.say('');
    const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const N = calm ? 1 : 10;
    for (let i = 1; i <= N; i++) {
      this._bpTimers.push(setTimeout(() => { this.t = i / N; this.draw(); if (i === N) this.judge(); }, calm ? 50 : i * 80));
    }
    this.draw();
  }

  judge() {
    const r = this.R, k = this.pick, newPrice = after1(r.price, r.up);
    this.phase = 'done';
    if (waitOf(r, k) > 1) {
      this.result = 'wait';
      this.say(`This money is not free until year ${waitOf(r, k)}.`, 'bad');
    } else {
      const m = this.endMoney(k);
      if (m >= newPrice) {
        this.result = 'win';
        this.won[this.round] = true;
        const last = this.won.every(Boolean);
        this.say(`${rs(m)} is more than the ${r.poss} new price ${rs(newPrice)}.${last ? ' All three rounds won.' : ''}`, 'good');
        if (last) finishGame(this);
      } else {
        this.result = 'short';
        this.say(`${rs(m)} is less than the ${r.poss} new price ${rs(newPrice)}.`, 'bad');
      }
    }
    this.draw();
  }

  checkObjective() { return this.won.every(Boolean) ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.resetAll();
    this.say('');
    this.draw();
  }

  destroy() {
    for (const t of (this._bpTimers ?? []).splice(0)) clearTimeout(t);
    super.destroy();
  }

  testState() { return { round: this.round, won: this.won.slice(), order: this.order.slice(), pick: this.pick, phase: this.phase, result: this.result }; }
}
