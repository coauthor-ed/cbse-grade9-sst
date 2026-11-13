// BalanceGameScene - L05 game (blk-l05-s09): find the balance in a made-up guava market (said on screen).
//   Stage 1: a 3-row table (price | buyers want | sellers offer | answer), rows in a random order (Math.random).
//   The current row is lit; one bar of three answers in the same order every row: shortage | equilibrium |
//   surplus. Wrong: that answer is struck out for the row and one short reason shows. Right: the answer chip
//   fills the row, and the two points at that price drop onto the graph (buyers want: demand colour, sellers
//   offer: supply colour).
//   Stage 2: the demand curve draws through (15, Rs 20) (8, Rs 50) (4, Rs 80) and the supply curve through
//   (4, Rs 20) (8, Rs 50) (12, Rs 80); the player taps the point where they cross (targets: the four other
//   points and the crossing). Wrong: a reason (the curves are apart there). Right: E ringed, "E: 8 kg at Rs 50".
//   Win (checkObjective, real): all three rows and the point right; finishGame -> the host's verdict.
// Numbers: STORYBOARD L05 s09 (L02 guava demand game x L03 guava supply game). Market demand series-5, market
// supply series-7. Colours are tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';

const RS = '\u20B9';
const PR = [20, 50, 80];
const WANT = [15, 8, 4];
const OFFER = [4, 8, 12];
const ANS = ['shortage', 'equilibrium', 'surplus'];
const KEY = PR.map((_, i) => (WANT[i] > OFFER[i] ? 0 : WANT[i] === OFFER[i] ? 1 : 2));
const DEM = 'var(--sim-series-5)';
const SUP = 'var(--sim-series-7)';
const DEM_INK = 'var(--sim-ink-on-5, var(--sim-bg-deep))';
const SUP_INK = 'var(--sim-ink-on-7, var(--sim-bg-deep))';
// stage 2 targets: [kg, price, 'd' | 's' | 'e']
const PTS = [[15, 20, 'd'], [4, 80, 'd'], [4, 20, 's'], [12, 80, 's'], [8, 50, 'e']];
const f1 = (v) => (+v).toFixed(1);

function why(i, a) {
  const w = WANT[i], o = OFFER[i], head = `Buyers want ${w} kg, sellers offer ${o} kg:`;
  if (a === 1) return `${head} the two are not equal.`;
  if (w === o) return `${head} ${a === 0 ? 'nothing is missing' : 'nothing is left over'}.`;
  return `${head} ${w > o ? 'more is wanted than offered' : 'more is offered than wanted'}.`;
}

function whyPt(n) {
  const [kg, p, c] = PTS[n], i = PR.indexOf(p);
  return c === 'd'
    ? `At ${RS}${p} buyers want ${kg} kg but sellers offer ${OFFER[i]} kg: the curves are apart here.`
    : `At ${RS}${p} sellers offer ${kg} kg but buyers want ${WANT[i]} kg: the curves are apart here.`;
}

const CSS = `
.bg { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.bg .bg-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 540px minmax(0, 1fr); gap: 22px; align-items: center; }
.bg .bg-left { display: flex; flex-direction: column; gap: 7px; }
.bg .bg-tab { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.3fr); gap: 6px; align-items: stretch; }
.bg .bg-h { font: 800 17px/1.15 var(--sim-font); color: var(--sim-label-muted); text-align: center; align-self: end; padding-bottom: 2px; }
.bg .bg-h--d { color: ${DEM_INK}; background: ${DEM}; border-radius: 10px; padding: 5px 2px; }
.bg .bg-h--s { color: ${SUP_INK}; background: ${SUP}; border-radius: 10px; padding: 5px 2px; }
.bg .bg-c { display: flex; align-items: center; justify-content: center; min-height: 38px; border-radius: 12px; white-space: nowrap;
  font: 800 21px/1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2px solid var(--sim-stroke); }
.bg .bg-c--p { background: transparent; border-color: transparent; }
.bg .bg-c--dim { opacity: 0.42; }
.bg .bg-c--on { border-color: var(--sim-accent); border-width: 3px; }
.bg .bg-c--q { color: var(--sim-label-muted); border-style: dashed; }
.bg .bg-c--good { background: color-mix(in oklab, var(--sim-good) 18%, var(--sim-bg-surface)); border-color: var(--sim-good); font-size: 17px; }
.bg .bg-bar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr) minmax(0, 1fr); gap: 8px; }
.bg .bg-ans { min-height: 56px; padding: 4px 6px; font: 800 19px/1.1 var(--sim-font); white-space: nowrap; }
.bg .gm-head .sub { font-size: 17px; }
.bg .bg-ans[aria-disabled="true"] { opacity: 0.4; text-decoration: line-through; cursor: default; }
.bg .bg-say { margin: 0; min-height: 44px; font: 700 17px/1.35 var(--sim-font); color: var(--sim-label); }
.bg .bg-say b { color: var(--sim-accent); }
.bg .bg-say[data-tone="good"] { color: var(--sim-good); }
.bg .bg-say[data-tone="bad"] { color: var(--sim-bad); }
.bg .bg-fig { position: relative; width: 100%; }
.bg .bg-fig svg { display: block; width: 100%; height: auto; }
.bg .bg-pt { position: absolute; transform: translate(-50%, -50%); width: 48px; height: 48px; min-height: 0; padding: 0;
  border-radius: 50%; background: transparent; border: 0; box-shadow: none; cursor: pointer; }
.bg .bg-pt:hover { background: color-mix(in oklab, var(--sim-accent) 14%, transparent); }
.bg .bg-pt:active { transform: translate(-50%, calc(-50% + 2px)); box-shadow: none; }
.bg .bg-pt:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 0; }
.bg .bg-pop { animation: bg-pop 0.4s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes bg-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
@keyframes bg-draw { to { stroke-dashoffset: 0; } }
@keyframes bg-dot { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .bg .bg-pop { animation: none; } .bg-fig path, .bg-fig circle { animation: none !important; stroke-dashoffset: 0 !important; } }
.sim-dom-root--portrait .bg .bg-body { display: flex; flex-direction: column; gap: 8px; align-items: stretch; }
.sim-dom-root--portrait .bg .bg-left { gap: 7px; }
.sim-dom-root--portrait .bg .bg-tab { gap: 4px; grid-template-columns: minmax(0, 0.75fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.35fr); }
.sim-dom-root--portrait .bg .bg-h { font-size: 14px; }
.sim-dom-root--portrait .bg .bg-c { min-height: 40px; font-size: 17px; border-radius: 10px; padding: 0 2px; }
.sim-dom-root--portrait .bg .bg-c--good { font-size: 14px; }
.sim-dom-root--portrait .bg .bg-bar { gap: 5px; }
.sim-dom-root--portrait .bg .bg-ans { font-size: 15px; padding: 2px; }
.sim-dom-root--portrait .bg .bg-say { font-size: 15px; min-height: 40px; text-align: center; }
`;

export class BalanceGameScene extends GameBoard {
  static HEIGHT = 370;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'For each price, choose shortage, surplus or equilibrium. Then tap the point where the two curves cross. Win when all three prices and the point are right.' } };
  static ARIA_LABEL = 'A made-up guava market. At 20 rupees a kg buyers want 15 kg and sellers offer 4 kg; at 50 rupees buyers want 8 kg and sellers offer 8 kg; at 80 rupees buyers want 4 kg and sellers offer 12 kg. For each price choose shortage, equilibrium or surplus. Then the demand and supply curves are drawn: tap the point where they cross.';

  async setup() {
    this.reset();
    this.figP = null;
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      onResize: () => { if (this.isPortrait() !== this.figP) this.draw(); },
      html: `<div class="gm bg"><div class="gm-head"><h2>Find the balance</h2><p class="sub">Guavas, a made-up example. Compare want and offer at each price.</p></div>
        <div class="bg-body"><div class="bg-left"><div class="bg-tab" role="table" aria-label="guava market at three prices"></div><div class="bg-bar"></div><p class="bg-say" aria-live="polite"></p></div><div class="bg-fig"></div></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
    this.hint();
  }

  reset() {
    const order = [0, 1, 2];
    for (let n = order.length - 1; n > 0; n--) { const j = Math.floor(Math.random() * (n + 1)); [order[n], order[j]] = [order[j], order[n]]; }
    this.order = order;
    this.pos = 0;
    this.done = [false, false, false];
    this.bad = [new Set(), new Set(), new Set()];
    this.badPt = new Set();
    this.stage = 1;
    this.won = false;
    this.fresh = -1;
    this.drawNow = false;
  }

  get row() { return this.order[this.pos]; }

  isPortrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.bg-tab')) return;
    this.figP = this.isPortrait();
    const P = this.figP;
    let t = '<div class="bg-h" role="columnheader">price</div><div class="bg-h bg-h--d" role="columnheader">buyers want</div>'
      + '<div class="bg-h bg-h--s" role="columnheader">sellers offer</div><div class="bg-h" role="columnheader">market</div>';
    this.order.forEach((i) => {
      const on = this.stage === 1 && i === this.row, dim = this.stage === 1 && !on && !this.done[i];
      const c = `bg-c${dim ? ' bg-c--dim' : ''}${on ? ' bg-c--on' : ''}`;
      t += `<div class="${c} bg-c--p" role="cell">${RS}${PR[i]}</div><div class="${c}" role="cell">${WANT[i]} kg</div><div class="${c}" role="cell">${OFFER[i]} kg</div>`;
      t += this.done[i]
        ? `<div class="bg-c bg-c--good${this.fresh === i ? ' bg-pop' : ''}" role="cell">${ANS[KEY[i]]}</div>`
        : `<div class="${c} bg-c--q" role="cell">?</div>`;
    });
    q('.bg-tab').innerHTML = t;
    const bar = q('.bg-bar');
    if (this.stage === 1) {
      bar.style.display = '';
      bar.innerHTML = ANS.map((a, n) => `<button type="button" class="tap btn bg-ans" data-a="${n}"${this.bad[this.row].has(n) ? ' aria-disabled="true"' : ''} aria-label="${a} at ${PR[this.row]} rupees">${a}</button>`).join('');
      bar.querySelectorAll('.bg-ans').forEach((b) => onTap(b, () => this.answer(Number(b.dataset.a))));
    } else { bar.innerHTML = ''; bar.style.display = 'none'; }
    const fig = q('.bg-fig');
    fig.innerHTML = this.figure(P);
    fig.querySelectorAll('.bg-pt').forEach((b) => onTap(b, () => this.tapPoint(Number(b.dataset.n))));
    this.fresh = -1;
    this.drawNow = false;
    this.relayout?.();
  }

  /** The graph: price up (Rs 20, 50, 80), kg along 0..16. */
  figure(P) {
    const W = P ? 312 : 470, H = P ? 236 : 262, L = P ? 58 : 84, R = W - 14, T = 12, B = H - (P ? 46 : 50);
    const X = (kg) => L + (kg / 16.8) * (R - L), Y = (p) => B - (p / 100) * (B - T);
    const fs = P ? 14 : 17;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="guava market graph">`;
    s += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" style="fill:var(--sim-bg-surface)"/>`;
    for (let k = 4; k <= 16; k += 4) s += `<line x1="${f1(X(k))}" y1="${T}" x2="${f1(X(k))}" y2="${B}" style="stroke:var(--sim-stroke);stroke-width:1.2;opacity:0.4"/>`;
    PR.forEach((p, i) => {
      const on = this.stage === 1 && i === this.row;
      s += `<line x1="${L}" y1="${f1(Y(p))}" x2="${R}" y2="${f1(Y(p))}" style="stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${on ? 3 : 1.4};opacity:${on ? 0.9 : 0.45}"/>`;
      s += `<text x="${L - 8}" y="${f1(Y(p) + fs * 0.36)}" text-anchor="end" style="fill:${on ? 'var(--sim-accent)' : 'var(--sim-label)'};font:800 ${fs + 1}px var(--sim-font)">${RS}${p}</text>`;
    });
    for (let k = 0; k <= 16; k += 4) s += `<text x="${f1(X(k))}" y="${B + fs + 3}" text-anchor="middle" style="fill:var(--sim-label-muted);font:800 ${fs}px var(--sim-font)">${k}</text>`;
    s += `<text x="${f1((L + R) / 2)}" y="${H - 4}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs + 1}px var(--sim-font)">quantity (kg)</text>`;
    s += `<text transform="translate(${P ? 13 : 20} ${f1((T + B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs}px var(--sim-font)">price (${RS} per kg)</text>`;
    s += `<path d="M${L} ${T - 4}V${B}H${R + 4}" style="fill:none;stroke:var(--sim-label);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/>`;
    const r = P ? 8 : 10;
    if (this.stage === 2) {
      // both curves through their three points (demand bends a little: a smooth curve through the middle point)
      const curve = (pts, col, d) => {
        const [a, b, c] = pts.map(([kg, p]) => [X(kg), Y(p)]);
        const cx = 2 * b[0] - (a[0] + c[0]) / 2, cy = 2 * b[1] - (a[1] + c[1]) / 2;
        const len = Math.hypot(c[0] - a[0], c[1] - a[1]) * 1.15;
        const anim = this.drawNow ? `stroke-dasharray:${f1(len)};stroke-dashoffset:${f1(len)};animation:bg-draw 0.8s ease ${d}s forwards;` : '';
        return `<path d="M${f1(a[0])} ${f1(a[1])}Q${f1(cx)} ${f1(cy)} ${f1(c[0])} ${f1(c[1])}" style="${anim}fill:none;stroke:${col};stroke-width:${P ? 5 : 6};stroke-linecap:round"/>`;
      };
      s += curve([[15, 20], [8, 50], [4, 80]], DEM, 0) + curve([[4, 20], [8, 50], [12, 80]], SUP, 0.3);
      const lab = (x, y, a, t, col) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="fill:${col};font:800 ${fs}px var(--sim-font)">${t}</text>`;
      s += lab(X(15), Y(20) + fs + 12, 'middle', 'demand', DEM) + lab(X(12) + 6, Y(80) - 12, 'middle', 'supply', SUP);
    }
    // the points found so far (stage 1) or the tap targets (stage 2)
    PR.forEach((p, i) => {
      if (!this.done[i]) return;
      const pop = this.fresh === i ? 'transform-box:fill-box;transform-origin:center;animation:bg-dot 0.4s cubic-bezier(.3,1.5,.5,1) both;' : '';
      if (WANT[i] !== OFFER[i] && this.stage === 1) s += `<line x1="${f1(X(WANT[i]))}" y1="${f1(Y(p))}" x2="${f1(X(OFFER[i]))}" y2="${f1(Y(p))}" style="stroke:var(--sim-accent);stroke-width:4;stroke-linecap:round;opacity:0.8"/>`;
      s += `<circle cx="${f1(X(WANT[i]))}" cy="${f1(Y(p))}" r="${r}" style="${pop}fill:${DEM};stroke:var(--sim-bg-surface);stroke-width:3"/>`;
      if (OFFER[i] !== WANT[i]) s += `<circle cx="${f1(X(OFFER[i]))}" cy="${f1(Y(p))}" r="${r}" style="${pop}fill:${SUP};stroke:var(--sim-bg-surface);stroke-width:3"/>`;
      else s += `<circle cx="${f1(X(OFFER[i]))}" cy="${f1(Y(p))}" r="${r * 0.5}" style="${pop}fill:${SUP}"/>`;
    });
    if (this.stage === 2) {
      PTS.forEach(([kg, p], n) => {
        if (!this.badPt.has(n)) return;
        const x = X(kg), y = Y(p);
        s += `<path d="M${f1(x - 8)} ${f1(y - 8)}L${f1(x + 8)} ${f1(y + 8)}M${f1(x + 8)} ${f1(y - 8)}L${f1(x - 8)} ${f1(y + 8)}" style="fill:none;stroke:var(--sim-bad);stroke-width:4;stroke-linecap:round"/>`;
      });
      if (this.won) {
        const x = X(8), y = Y(50);
        s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${P ? 17 : 20}" style="transform-box:fill-box;transform-origin:center;animation:bg-dot 0.5s cubic-bezier(.3,1.5,.5,1) both;fill:none;stroke:var(--sim-accent);stroke-width:4"/>`;
        s += `<text x="${f1(x + (P ? 22 : 26))}" y="${f1(y + 6)}" style="fill:var(--sim-accent);paint-order:stroke;stroke:var(--sim-bg-surface);stroke-width:6px;stroke-linejoin:round;font:800 ${fs + 3}px var(--sim-font)">E: 8 kg at ${RS}50</text>`;
      }
    }
    s += '</svg>';
    if (this.stage === 2 && !this.won) {
      PTS.forEach(([kg, p], n) => {
        if (this.badPt.has(n)) return;
        s += `<button type="button" class="tap btn bg-pt" data-n="${n}" aria-label="the point ${kg} kg at ${p} rupees" style="left:${f1(X(kg) / W * 100)}%;top:${f1(Y(p) / H * 100)}%"></button>`;
      });
    }
    return s;
  }

  say(html, tone) {
    const el = this.root?.querySelector('.bg-say');
    if (!el) return;
    el.innerHTML = html;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  hint() {
    if (this.won) return;
    if (this.stage === 1) this.say(`At <b>${RS}${PR[this.row]}</b>: shortage, equilibrium or surplus?`);
    else this.say('Now tap the point where the <b>two curves cross</b>.');
  }

  answer(a) {
    if (this.stage !== 1) return;
    const i = this.row;
    if (this.bad[i].has(a)) return;
    if (a !== KEY[i]) {
      this.bad[i].add(a);
      this.draw();
      this.say(why(i, a), 'bad');
      return;
    }
    this.done[i] = true;
    this.fresh = i;
    const w = WANT[i], o = OFFER[i];
    const note = w === o ? 'want = offer.' : w > o ? `${w - o} kg missing.` : `${o - w} kg left over.`;
    if (this.pos < 2) {
      this.pos += 1;
      this.draw();
      this.say(`Right: ${note} Now <b>${RS}${PR[this.row]}</b>.`, 'good');
      return;
    }
    this.stage = 2;
    this.drawNow = true;
    this.draw();
    this.say(`Right: ${note} Now tap the point where the <b>two curves cross</b>.`, 'good');
  }

  tapPoint(n) {
    if (this.stage !== 2 || this.won || this.badPt.has(n)) return;
    if (PTS[n][2] === 'e') {
      this.won = true;
      this.draw();
      this.say(`E: buyers want 8 kg and sellers offer 8 kg at ${RS}50. That is the equilibrium.`, 'good');
      finishGame(this);
      return;
    }
    this.badPt.add(n);
    this.draw();
    this.say(whyPt(n), 'bad');
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.draw();
    this.hint();
  }

  testState() { return { won: this.won, stage: this.stage, order: this.order.map((i) => PR[i]), done: this.done.slice(), bad: this.bad.map((b) => [...b]), badPt: [...this.badPt] }; }
}
