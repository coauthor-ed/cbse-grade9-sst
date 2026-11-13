// StallPriceGame - L01 game (blk-l01-s04): the festival price game. Three rounds (morning, hot afternoon, last
// hour); a glass costs Rs 6 to make in every round; prices Rs 5, 10, 15, 20. Each round shows the stall (small,
// with the round's sun), a big 4-column demand board (price -> buyers, a bar per price) and a result card.
// Tap a price: the card shows (price - 6) x buyers = profit and a profit bar on one fixed scale for the whole
// game (a loss goes left of zero, bad token, the word "loss"). Right: a short why and Next round. Wrong: a short
// reason that says which way to go, then try again (the tried price stays marked on the bar's track).
// The price buttons show price and buyers only, never the profit. Win (checkObjective): the best price picked
// in all three rounds; finishGame after round 3. Made-up numbers (said once, in the kicker).
// Prices stay in rising order on purpose: the board teaches "higher price, fewer buyers" by position, and the
// best price moves (15, 20, 10), so the order never gives the answer away. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { RS, group } from '../shared/MoneyKit.js';
import { stall, stallTop, glass, STALL_CSS } from '../shared/StallKit.js';

const COST = 6;
const PRICES = [5, 10, 15, 20];
const TIMES = '\u00d7';
const ROUNDS = [
  { name: 'Morning', buyers: [200, 150, 80, 30], profit: [-200, 600, 720, 420], best: 15,
    good: 'Fewer buyers than at ' + RS + '10, but ' + RS + '9 on each glass.' },
  { name: 'Hot afternoon', buyers: [260, 200, 120, 90], profit: [-260, 800, 1080, 1260], best: 20,
    good: 'It is hot: many buyers still come at ' + RS + '20.' },
  { name: 'Last hour', buyers: [120, 90, 30, 10], profit: [-120, 360, 270, 140], best: 10,
    good: 'Few visitors are left, so a lower price sells more glasses.' },
];
const profitOf = (p, n) => (p - COST) * n;
// The numbers come from price, cost and buyers; the table above is the storyboard's, checked here.
for (const r of ROUNDS) {
  PRICES.forEach((p, i) => {
    if (profitOf(p, r.buyers[i]) !== r.profit[i]) throw new Error(`StallPriceGame: ${r.name} ${p} profit mismatch`);
  });
  const best = PRICES[r.buyers.map((n, i) => profitOf(PRICES[i], n)).reduce((b, v, i, a) => (v > a[b] ? i : b), 0)];
  if (best !== r.best) throw new Error(`StallPriceGame: ${r.name} best price mismatch`);
}
const rs = (n) => (n < 0 ? '-' : '') + RS + group(Math.abs(n));
const MAX_BUYERS = 260;
const LO = -300, HI = 1300;                     // the profit bar's fixed scale, the same in every round
const f1 = (v) => (+v).toFixed(1);

// The stall in its round: the sun low on the left (morning), high and big (hot afternoon), low on the right (last hour).
function stallFig(round) {
  const sun = [{ x: 22, y: 104, r: 13, rays: 0 }, { x: 100, y: -8, r: 17, rays: 1 }, { x: 178, y: 104, r: 13, rays: 0 }][round];
  let s = '<svg viewBox="0 -40 200 240" aria-hidden="true">';
  s += '<rect x="0" y="-40" width="200" height="240" rx="14" style="fill:color-mix(in oklab, var(--sim-series-1) 12%, var(--sim-bg-surface))"/>';
  if (sun.rays) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4, r0 = sun.r + 5, r1 = sun.r + 13;
      s += `<path d="M${f1(sun.x + Math.cos(a) * r0)} ${f1(sun.y + Math.sin(a) * r0)}L${f1(sun.x + Math.cos(a) * r1)} ${f1(sun.y + Math.sin(a) * r1)}" style="stroke:var(--sim-gold);stroke-width:4;stroke-linecap:round"/>`;
    }
  }
  s += `<circle cx="${sun.x}" cy="${sun.y}" r="${sun.r}" style="fill:${round === 2 ? 'color-mix(in oklab, var(--sim-gold) 70%, var(--sim-series-6))' : 'var(--sim-gold)'}"/>`;
  s += '<rect x="0" y="182" width="200" height="18" style="fill:color-mix(in oklab, var(--sim-series-3) 30%, var(--sim-bg-surface))"/>';
  s += stall(100, 186, 112, { signSize: 17 });
  const top = stallTop(186, 112);
  s += glass(78, top, 26) + glass(100, top, 26) + glass(122, top, 26);
  return s + '</svg>';
}

// The profit bar: a track from LO to HI with a zero line; the current pick as a bar; earlier tries as ticks.
function profitBar(cur, tried, W) {
  const H = 84, L = 8, R = W - 8, X = (v) => L + ((v - LO) / (HI - LO)) * (R - L), y0 = 24, bh = 32, z = X(0);
  const word = (t, x, anchor, y = y0 + bh / 2 + 6) => `<text x="${f1(x)}" y="${y}" text-anchor="${anchor}" style="fill:var(--sim-label-muted);font:800 15px var(--sim-font)">${t}</text>`;
  let s = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  s += `<rect x="${L}" y="${y0}" width="${R - L}" height="${bh}" rx="8" style="fill:var(--sim-bg-deep);stroke:var(--sim-stroke);stroke-width:1.5;opacity:0.9"/>`;
  // earlier tries: a dashed tick with its price above the track
  for (const t of tried) {
    s += `<path d="M${f1(X(t.v))} ${y0 - 4}V${y0 + bh + 2}" style="stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:4 3"/>`;
    s += word(`${RS}${t.p}`, X(t.v), 'middle', y0 - 8);
  }
  // the side words, unless a bar or a tried tick sits on them
  if ((!cur || cur.v >= 0) && !tried.some((t) => t.v < 0)) s += word('loss', z - 7, 'end');
  if ((!cur || cur.v <= 0) && !tried.some((t) => t.v > 0 && X(t.v) < z + 70)) s += word('profit', z + 9, 'start');
  if (cur) {
    const x0 = Math.min(z, X(cur.v)), w = Math.abs(X(cur.v) - z), loss = cur.v < 0;
    const col = loss ? 'var(--sim-bad)' : 'var(--sim-good)';
    s += `<rect class="ps-grow" x="${f1(x0)}" y="${y0 + 4}" width="${f1(Math.max(w, 3))}" height="${bh - 8}" rx="6" style="fill:${col};transform-origin:${f1(z)}px 0"/>`;
    s += `<text x="${f1(X(cur.v))}" y="${y0 + bh + 22}" text-anchor="${loss ? 'start' : 'middle'}" style="fill:var(--sim-label);font:800 17px var(--sim-font)">${RS}${cur.p}</text>`;
  }
  s += `<path d="M${f1(z)} ${y0 - 6}V${y0 + bh + 6}" style="stroke:var(--sim-label);stroke-width:3;stroke-linecap:round"/>`;
  return s + '</svg>';
}

const CSS = STALL_CSS + `
.gm.ps { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md); }
.ps .ps-main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 200px minmax(0, 1fr) 340px; gap: 16px; align-items: stretch; }
.ps .ps-card { background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); padding: 10px 12px; }
.ps .ps-side { display: flex; flex-direction: column; gap: 8px; }
.ps .ps-stall svg { display: block; width: 100%; height: auto; }
.ps .ps-round { font: 800 20px/1.15 var(--sim-font-display, var(--sim-font)); text-align: center; margin: 0; }
.ps .ps-pips { display: flex; justify-content: center; gap: 8px; }
.ps .ps-pip { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.ps .ps-pip[data-s="done"] { background: var(--sim-good); border-color: var(--sim-good); }
.ps .ps-pip[data-s="now"] { background: var(--sim-accent); border-color: var(--sim-accent); }
.ps .ps-cost { display: flex; align-items: center; justify-content: center; gap: 6px; font: 800 17px/1.2 var(--sim-font); margin: 0; }
.ps .ps-cost svg { width: 30px; height: 30px; flex: none; }
.ps .ps-board { display: flex; flex-direction: column; gap: 6px; }
.ps .ps-bh { display: flex; align-items: center; gap: 6px; font: 800 16px/1.2 var(--sim-font); color: var(--sim-label-muted); margin: 0; }
.ps .ps-bh svg { width: 26px; height: 26px; }
.ps .ps-cols { flex: 1 1 auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.ps .ps-col { display: flex; flex-direction: column; align-items: stretch; gap: 4px; padding: 8px 6px 6px; border-radius: var(--sim-radius-lg); }
.ps .ps-n { font: 800 24px/1 var(--sim-font-display, var(--sim-font)); text-align: center; color: var(--sim-series-1); }
.ps .ps-well { position: relative; flex: 1 1 auto; min-height: 130px; display: flex; align-items: flex-end; justify-content: center;
  border-bottom: 3px solid var(--sim-label); }
.ps .ps-bar { width: 62%; border-radius: 8px 8px 0 0; background: color-mix(in oklab, var(--sim-series-1) 70%, var(--sim-bg-surface));
  transition: height 0.5s ease; }
.ps .ps-p { font: 800 30px/1.05 var(--sim-font-display, var(--sim-font)); text-align: center; padding-top: 4px; }
.ps .ps-col[data-s="good"] { border-color: var(--sim-good); border-width: 3px; background: color-mix(in oklab, var(--sim-good) 14%, var(--sim-bg-surface)); }
.ps .ps-col[data-s="bad"] { border-color: var(--sim-bad); border-style: dashed; }
.ps .ps-col[data-s="bad"] .ps-p { color: var(--sim-bad); }
.ps .ps-col[aria-disabled="true"] { cursor: default; }
.ps .ps-res { display: flex; flex-direction: column; gap: 6px; }
.ps .ps-eq { font: 800 22px/1.2 var(--sim-font); margin: 0; }
.ps .ps-rule { margin: 0; font: 700 16px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.ps .ps-big { font: 800 34px/1.1 var(--sim-font-display, var(--sim-font)); margin: 0; }
.ps .ps-big[data-tone="good"] { color: var(--sim-good); } .ps .ps-big[data-tone="bad"] { color: var(--sim-bad); }
.ps .ps-big span { font-size: 22px; }
.ps .ps-bar-f svg { display: block; width: 100%; height: auto; }
.ps .ps-say { margin: 0; font: 700 16px/1.35 var(--sim-font); }
.ps .ps-say[data-tone="good"] { color: var(--sim-good); } .ps .ps-say[data-tone="bad"] { color: var(--sim-bad); }
.ps .ps-next { min-height: 48px; font-size: 17px; font-weight: 800; border: 0; background: var(--sim-accent); color: var(--sim-bg-deep);
  box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.ps .ps-next:active { box-shadow: none; }
.ps .ps-sum { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; }
.ps .ps-sum li { display: flex; justify-content: space-between; font: 800 18px/1.3 var(--sim-font); }
.ps .ps-sum b { color: var(--sim-good); }
.ps .ps-grow { animation: ps-grow 0.6s cubic-bezier(.3,1.3,.5,1) both; }
@keyframes ps-grow { from { transform: scaleX(0); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { .ps .ps-grow { animation: none; } .ps .ps-bar { transition: none; } }
.sim-dom-root--portrait .ps .ps-main { display: flex; flex-direction: column; gap: 10px; }
.sim-dom-root--portrait .ps .ps-side { flex-direction: row; align-items: center; gap: 10px; padding: 6px 8px; }
.sim-dom-root--portrait .ps .ps-stall { width: 96px; flex: none; }
.sim-dom-root--portrait .ps .ps-sidetext { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.sim-dom-root--portrait .ps .ps-round { text-align: left; }
.sim-dom-root--portrait .ps .ps-cost { justify-content: flex-start; font-size: 16px; }
.sim-dom-root--portrait .ps .ps-cols { gap: 6px; }
.sim-dom-root--portrait .ps .ps-col { padding: 6px 2px 4px; }
.sim-dom-root--portrait .ps .ps-n { font-size: 19px; }
.sim-dom-root--portrait .ps .ps-p { font-size: 23px; }
.sim-dom-root--portrait .ps .ps-well { min-height: 76px; }
.sim-dom-root--portrait .ps .ps-eq { font-size: 19px; }
.sim-dom-root--portrait .ps .ps-big { font-size: 28px; }
.sim-dom-root--portrait .ps .ps-say { font-size: 15px; }
`;

export class StallPriceGame extends GameBoard {
  static HEIGHT = 430;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'In all three rounds, pick the price that leaves the most profit.' } };
  static ARIA_LABEL = 'The festival price game, with made-up numbers. Three rounds: morning, hot afternoon and last hour. A glass costs 6 rupees to make. A board shows how many visitors buy at 5, 10, 15 and 20 rupees. Tap the price that leaves the most profit: price minus 6, times the buyers.';

  async setup() {
    this.reset();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm ps"><div class="gm-head"><h2 class="ps-h"></h2>
        <p class="sub">Made-up numbers. Tap the price that leaves the most money after costs.</p></div>
        <div class="ps-main">
          <div class="ps-card ps-side"><div class="ps-stall"></div><div class="ps-sidetext"><p class="ps-round"></p><div class="ps-pips"></div>
            <p class="ps-cost">${glassIcon()}<span>${RS}6 to make</span></p></div></div>
          <div class="ps-card ps-board"><p class="ps-bh">${iconSvg('crowd', 1)}<span>Visitors who buy at each price</span></p><div class="ps-cols"></div></div>
          <div class="ps-card ps-res" aria-live="polite"></div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.round = 0;
    this.pick = null;          // the price tapped last in this round
    this.tried = [];           // wrong prices tried in this round
    this.done = [false, false, false];
    this.misses = 0;
    this.won = false;
    this.fresh = false;
  }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.ps-cols')) return;
    const R = ROUNDS[this.round];
    q('.ps-h').textContent = `Round ${this.round + 1} of 3: ${R.name}`;
    q('.ps-round').textContent = R.name;
    q('.ps-stall').innerHTML = stallFig(this.round);
    q('.ps-pips').innerHTML = ROUNDS.map((r, i) => `<span class="ps-pip" data-s="${this.done[i] ? 'done' : i === this.round ? 'now' : ''}" aria-label="${r.name}${this.done[i] ? ': done' : ''}"></span>`).join('');
    const done = this.done[this.round];
    q('.ps-cols').innerHTML = PRICES.map((p, i) => {
      const n = R.buyers[i];
      const s = done && p === R.best ? 'good' : this.tried.includes(p) ? 'bad' : '';
      return `<button type="button" class="tap btn ps-col" data-p="${p}"${s ? ` data-s="${s}"` : ''}${done ? ' aria-disabled="true"' : ''}
        aria-label="${p} rupees: ${n} buyers"><span class="ps-n">${n}</span><span class="ps-well"><span class="ps-bar" style="height:${f1((n / MAX_BUYERS) * 100)}%"></span></span><span class="ps-p">${RS}${p}</span></button>`;
    }).join('');
    q('.ps-cols').querySelectorAll('.ps-col').forEach((b) => onTap(b, () => this.tap(Number(b.dataset.p))));
    q('.ps-res').innerHTML = this.resultHtml();
    const nx = q('.ps-next');
    if (nx) onTap(nx, () => this.next());
    this.fresh = false;
    this.relayout?.();
  }

  resultHtml() {
    const R = ROUNDS[this.round];
    const W = this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait') ? 300 : 316;
    const tried = this.tried.filter((p) => p !== this.pick).map((p) => ({ p, v: profitOf(p, R.buyers[PRICES.indexOf(p)]) }));
    if (this.won) {
      return `<p class="ps-eq">All three rounds done.</p><ul class="ps-sum">${ROUNDS.map((r) => `<li><span>${r.name}</span><b>${RS}${r.best}</b></li>`).join('')}</ul>
        <p class="ps-say" data-tone="good">The best price changes from round to round, because the crowd changes.</p>`;
    }
    if (this.pick === null) {
      return `<p class="ps-eq">Tap a price.</p><p class="ps-rule">Profit = (price - ${RS}6) ${TIMES} buyers</p>
        <div class="ps-bar-f">${profitBar(null, tried, W)}</div><p class="ps-say">The bar shows what your price leaves.</p>`;
    }
    const p = this.pick, n = R.buyers[PRICES.indexOf(p)], v = profitOf(p, n), right = p === R.best;
    const big = v < 0 ? `${rs(v)} <span>loss</span>` : `${rs(v)} <span>profit</span>`;
    let say, tone;
    if (right) { say = `Best price: ${RS}${p}. ${R.good}`; tone = 'good'; }
    else if (p === 5) { say = `At ${RS}5 each glass loses ${RS}1, so more buyers means a bigger loss. Try again.`; tone = 'bad'; }
    else if (R.best > p) { say = 'Not the most. A higher price leaves more here: enough buyers still come. Try again.'; tone = 'bad'; }
    else { say = 'Not the most. A lower price leaves more here: many more buyers come. Try again.'; tone = 'bad'; }
    const next = right ? `<button type="button" class="tap btn ps-next">${this.round < 2 ? 'Next round' : 'See all three'}</button>` : '';
    return `<p class="ps-eq">(${RS}${p} - ${RS}6) ${TIMES} ${n} buyers</p>
      <p class="ps-big" data-tone="${v < 0 ? 'bad' : right ? 'good' : ''}">= ${big}</p>
      <div class="ps-bar-f">${profitBar({ p, v }, tried, W)}</div>
      <p class="ps-say" data-tone="${tone}">${say}</p>${next}`;
  }

  tap(p) {
    if (this.won || this.done[this.round]) return;
    const R = ROUNDS[this.round];
    this.pick = p;
    if (p === R.best) this.done[this.round] = true;
    else { if (!this.tried.includes(p)) this.tried.push(p); this.misses++; }
    this.fresh = true;
    this.draw();
  }

  next() {
    if (!this.done[this.round]) return;
    if (this.round < 2) {
      this.round++;
      this.pick = null;
      this.tried = [];
      this.draw();
      return;
    }
    this.won = true;
    this.draw();
    finishGame(this);
  }

  checkObjective() { return this.won && this.done.every(Boolean) ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.draw();
  }

  testState() { return { round: this.round, pick: this.pick, tried: this.tried.slice(), solved: this.done.slice(), won: this.won }; }
}

function glassIcon() {
  return `<svg viewBox="0 0 40 40" aria-hidden="true">${glass(20, 38, 34)}</svg>`;
}
