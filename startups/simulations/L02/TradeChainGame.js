// TradeChainGame - L02 game (blk-l02-s06): the trade chain of the Jataka tale. Six rounds. In each round you hold
// one thing; three people stand on the road, each saying what is wrong for them (a need, not the name of the good).
// Tap the person your goods help. Right: the trade happens (coins in, or new goods), the purse updates, and the
// side card says how you got the next thing. Wrong: no cost; the tapped card turns dashed red and one short line
// says what that person needs. The three people are shuffled each round (Math.random). The buttons show people
// and their words only, never which good they want.
// Rounds, people and purse follow text-L02-report (accepted by the lead): purse after each round 0, 0, 10, 30, 20,
// 120 (checked at load). The trades follow the tale; people's words and coin amounts are made up (said on s06b
// and once in the sub line). Old story: period dress, no brands. Win (checkObjective): all six rounds done;
// finishGame after round 6. The cat is a SimAnimal on a small canvas (no horse in SimAnimal: the dealer says it).
// Drawn here: dead mouse, fruits and water, flowers, firewood, grass, refreshments (small goods art). ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { loadColors } from 'simulations/base/kit/SimLook.js';
import { drawAnimal, animalLook } from 'simulations/base/kit/SimAnimal.js';
import { coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);

// The tale's people (catkeeper is the same entry as in JatakaTradeChainScene).
const OLD = { shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', glasses: false, dupatta: false };
registerCast('catkeeper', { name: 'Shopkeeper', series: 7, role: 'shopkeeper', i: 44, look: { ...OLD, outfit: 'kurta', top: 's7', bottom: 'cream', hairStyle: 'short', moustache: true, girth: 1.05 } });
registerCast('picker', { name: 'Flower picker', series: 0, role: 'worker', i: 71, look: { ...OLD, outfit: 'drape', top: 's6', bottom: 's6', bottomStyle: 'long-skirt', hairStyle: 'bun', moustache: false, girth: 0.96 } });
registerCast('garland', { name: 'Garland maker', series: 0, role: 'adult', i: 72, look: { ...OLD, outfit: 'kurti', top: 's3', bottom: 'cream', bottomStyle: 'long-skirt', hairStyle: 'braid', dupatta: true, trim: 'cream', moustache: false, girth: 1 } });
registerCast('cook', { name: 'Family', series: 0, role: 'adult', i: 73, look: { ...OLD, outfit: 'drape', top: 's5', bottom: 's5', bottomStyle: 'long-skirt', hairStyle: 'long', moustache: false, girth: 1.04 } });
registerCast('horsedealer', { name: 'Horse dealer', series: 0, role: 'adult', i: 74, look: { ...OLD, outfit: 'kurta', top: 's2', bottom: 'cream', hairStyle: 'crop', moustache: true, girth: 1.1, sleeves: 'rolled' } });
registerCast('foreigner', { name: 'Foreign merchant', series: 0, role: 'adult', i: 75, look: { ...OLD, outfit: 'coat', top: 's8', bottom: 'stone', hairStyle: 'sidepart', moustache: true, girth: 1.08 } });

const PEOPLE = {
  catkeeper: { name: 'Shopkeeper', says: 'My cat is hungry.', needs: 'food for the cat', cat: true },
  picker: { name: 'Flower picker', says: 'I am tired and thirsty.', needs: 'water and food' },
  garland: { name: 'Garland maker', says: 'I make garlands to sell.', needs: 'flowers' },
  cook: { name: 'A family', says: 'We have no wood for our stove.', needs: 'firewood' },
  horsedealer: { name: 'Horse dealer', says: 'My horses are hungry.', needs: 'grass for the horses' },
  foreigner: { name: 'Foreign merchant', says: 'We are hungry after a long journey.', needs: 'food and drink' },
};

// Round table (text-L02-report): hold, right person, the two others, coins in, coins spent after, and what you get.
const ROUNDS = [
  { hold: 'mouse', good: 'a dead mouse', got: 'You found a dead mouse.', right: 'catkeeper', others: ['horsedealer', 'cook'], plus: 2,
    did: 'The cat eats. The shopkeeper gives you 2 coins.', spend: 2, spent: 'You buy fruits and water.', purse: 0 },
  { hold: 'fruit', good: 'fruits and water', got: 'You spent 2 coins on fruits and water.', right: 'picker', others: ['horsedealer', 'cook'], plus: 0,
    did: 'The tired flower picker gives you flowers.', spend: 0, purse: 0 },
  { hold: 'flowers', good: 'flowers', got: 'The flower picker gave you flowers.', right: 'garland', others: ['horsedealer', 'catkeeper'], plus: 10,
    did: 'The garland maker buys your flowers.', spend: 0, purse: 10 },
  { hold: 'wood', good: 'firewood', got: 'A storm broke branches. You gathered firewood.', right: 'cook', others: ['picker', 'horsedealer'], plus: 20,
    did: 'The family buys your firewood.', spend: 0, purse: 30 },
  { hold: 'grass', good: 'grass', got: 'You gathered grass.', right: 'horsedealer', others: ['garland', 'cook'], plus: 40,
    did: 'The horse dealer buys your grass.', spend: 50, spent: 'You open a refreshment shop.', purse: 20 },
  { hold: 'refresh', good: 'refreshments', got: 'You spent 50 coins on a refreshment shop.', right: 'foreigner', others: ['horsedealer', 'garland'], plus: 100,
    did: 'The foreign merchants buy food and drink at your shop.', spend: 0, purse: 120 },
];
{
  let p = 0;
  ROUNDS.forEach((r, i) => {
    p += r.plus - r.spend;
    if (p !== r.purse) throw new Error(`TradeChainGame: round ${i + 1} purse mismatch`);
    if (r.others.includes(r.right) || r.others.length !== 2) throw new Error(`TradeChainGame: round ${i + 1} people`);
  });
  if (p !== 120) throw new Error('TradeChainGame: final purse must be 120');
}

// ---- small goods art, all in a 100 x 80 box ----
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';
const RIM = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 55%)';
const LEAF = 'color-mix(in oklab, var(--sim-good) 75%, var(--sim-label) 10%)';
const ic = (name, tone, x, y, s) => iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${f1(s)}" height="${f1(s)}"`);

function goodArt(kind) {
  let s = '';
  if (kind === 'mouse') {
    const body = 'color-mix(in oklab, var(--sim-label) 42%, var(--sim-bg-surface))', rim = 'color-mix(in oklab, var(--sim-label) 70%, var(--sim-bg-surface))';
    s = '<g transform="translate(50 60) scale(1.15)">'
      + `<path d="M20 -4q18 -2 22 -14q3 -9 -6 -12" ${'style="fill:none;stroke:' + rim + ';stroke-width:3;stroke-linecap:round"'}/>`
      + `<path d="M-8 -14l-3 -9M6 -15l2 -9" style="fill:none;stroke:${rim};stroke-width:3;stroke-linecap:round"/>`
      + `<ellipse cx="0" cy="-9" rx="21" ry="11" style="fill:${body};stroke:${rim};stroke-width:2.5"/>`
      + `<path d="M-18 -13q-12 2 -14 6q6 5 14 2z" style="fill:${body};stroke:${rim};stroke-width:2.5;stroke-linejoin:round"/>`
      + `<circle cx="-15" cy="-21" r="5.5" style="fill:${body};stroke:${rim};stroke-width:2"/></g>`;
  } else if (kind === 'fruit') {
    s = ic('pot', 'var(--sim-water)', 34, 42, 60)
      + '<circle cx="70" cy="58" r="12" style="fill:var(--sim-series-6);stroke:var(--sim-stroke);stroke-width:2"/>'
      + '<circle cx="84" cy="42" r="11" style="fill:var(--sim-series-3);stroke:var(--sim-stroke);stroke-width:2"/>'
      + '<circle cx="62" cy="36" r="10" style="fill:var(--sim-gold);stroke:var(--sim-stroke);stroke-width:2"/>';
  } else if (kind === 'flowers') {
    s = ic('flower', 6, 30, 46, 50) + ic('flower', 2, 70, 46, 50) + ic('flower', 5, 50, 30, 50);
  } else if (kind === 'wood') {
    [[30, 58], [70, 58], [50, 36]].forEach(([cx, cy]) => {
      s += `<rect x="${cx - 26}" y="${cy - 10}" width="52" height="20" rx="10" style="fill:${WOOD};stroke:${RIM};stroke-width:2.5"/>`
        + `<circle cx="${cx + 26}" cy="${cy}" r="9" style="fill:color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface));stroke:${RIM};stroke-width:2.5"/>`;
    });
  } else if (kind === 'grass') {
    for (let i = -6; i <= 6; i++) s += `<path d="M${f1(50 + i * 1.6)} 72Q${f1(50 + i * 3)} 40 ${f1(50 + i * 5.2)} ${f1(10 + Math.abs(i) * 3)}" style="fill:none;stroke:${LEAF};stroke-width:4;stroke-linecap:round"/>`;
    s += `<rect x="36" y="50" width="28" height="9" rx="4" style="fill:${WOOD}"/>`;
  } else if (kind === 'refresh') {
    s = ic('pot', 'var(--sim-water)', 30, 44, 58) + ic('cup', 2, 70, 50, 46)
      + '<circle cx="84" cy="22" r="10" style="fill:var(--sim-series-6);stroke:var(--sim-stroke);stroke-width:2"/>';
  }
  return `<svg viewBox="0 0 100 80" aria-hidden="true">${s}</svg>`;
}

// The cat (SimAnimal on a canvas), painted after each draw.
function catSlot(x, y, len) {
  const w = len * 1.7, h = len * 1.25, x0 = x - w / 2, y0 = y - h + len * 0.12;
  const spec = encodeURIComponent(JSON.stringify({ fx: +(x - x0).toFixed(1), fy: +(y - y0).toFixed(1), len }));
  return `<div class="tc-cat" style="left:${f1(x0)}px;top:${f1(y0)}px;width:${f1(w)}px;height:${f1(h)}px"><canvas data-cat="${spec}" data-w="${f1(w)}" data-h="${f1(h)}"></canvas></div>`;
}
function paintCats(root) {
  let c;
  try { c = loadColors(root); } catch (_) { return; }
  const dpr = Math.min(3, ((typeof window !== 'undefined' && window.devicePixelRatio) || 1) * 1.5);
  for (const el of root.querySelectorAll('canvas[data-cat]')) {
    let s;
    try { s = JSON.parse(decodeURIComponent(el.dataset.cat)); } catch (_) { continue; }
    const w = parseFloat(el.dataset.w), h = parseFloat(el.dataset.h);
    el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
    const ctx = el.getContext('2d');
    if (!ctx) continue;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    try { drawAnimal(ctx, c, { kind: 'cat', x: s.fx, y: s.fy, length: s.len, facing: -1, pose: 'stand' }, animalLook(c, 'cat', { mood: 'sad' })); } catch (_) { /* draw nothing */ }
  }
}

const coinSvg = (n = 1) => `<svg viewBox="0 0 ${20 + n * 16} 40" aria-hidden="true">${Array.from({ length: n }, (_, i) => coin(18 + i * 16, 20, 15)).join('')}</svg>`;

const CSS = PEOPLE_CSS + `
.gm.tc { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md); }
.tc .tc-main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 236px minmax(0, 1fr) 286px; gap: 12px; align-items: stretch; }
.tc .tc-card { background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); padding: 10px 12px; }
.tc .tc-side { display: flex; flex-direction: column; gap: 6px; }
.tc .tc-lab { margin: 0; font: 800 16px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.tc .tc-hold { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 4px; border-radius: var(--sim-radius-md);
  background: color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface)); border: 2.5px solid var(--sim-accent); }
.tc .tc-hold svg { width: 112px; height: 90px; display: block; }
.tc .tc-hold b { font: 800 21px/1.15 var(--sim-font-display, var(--sim-font)); text-align: center; }
.tc .tc-got { margin: 0; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.tc .tc-purse { display: flex; align-items: center; gap: 8px; margin: 0; font: 800 17px/1.2 var(--sim-font); }
.tc .tc-purse svg { width: 36px; height: 36px; flex: none; }
.tc .tc-purse b { font: 800 28px/1 var(--sim-font-display, var(--sim-font)); }
.tc .tc-road { display: flex; justify-content: space-between; gap: 3px; margin-top: auto; }
.tc .tc-pip { width: 33px; height: 33px; border-radius: 50%; border: 2.5px solid var(--sim-stroke); background: var(--sim-bg-surface); display: flex; align-items: center; justify-content: center; opacity: 0.55; }
.tc .tc-pip svg { width: 27px; height: 22px; }
.tc .tc-pip[data-s="done"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); opacity: 1; }
.tc .tc-pip[data-s="now"] { border-color: var(--sim-accent); border-width: 3.5px; opacity: 1; }
.tc .tc-board { display: flex; flex-direction: column; gap: 6px; }
.tc .tc-ask { margin: 0; font: 800 19px/1.2 var(--sim-font); }
.tc .tc-ask b { color: var(--sim-accent); }
.tc .tc-people { flex: 1 1 auto; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.tc .tc-p { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 4px; padding: 6px 6px 6px; text-align: center; }
.tc .tc-say { position: relative; width: 100%; padding: 6px 8px; border-radius: 14px; font: 800 17px/1.25 var(--sim-font);
  background: color-mix(in oklab, var(--sim-gold) 18%, var(--sim-bg-surface)); border: 2px solid color-mix(in oklab, var(--sim-gold) 55%, var(--sim-stroke)); min-height: 50px;
  display: flex; align-items: center; justify-content: center; }
.tc .tc-say::after { content: ""; position: absolute; left: 50%; bottom: -9px; width: 14px; height: 14px; transform: translateX(-50%) rotate(45deg);
  background: inherit; border-right: 2px solid color-mix(in oklab, var(--sim-gold) 55%, var(--sim-stroke)); border-bottom: 2px solid color-mix(in oklab, var(--sim-gold) 55%, var(--sim-stroke)); }
.tc .tc-fig { position: relative; width: 132px; height: 158px; flex: none; }
.tc .tc-cat { position: absolute; pointer-events: none; }
.tc .tc-cat canvas { display: block; width: 100%; height: 100%; }
.tc .tc-name { font: 800 17px/1.15 var(--sim-font); color: var(--sim-label); }
.tc .tc-p[data-s="good"] { border-color: var(--sim-good); border-width: 3px; background: color-mix(in oklab, var(--sim-good) 14%, var(--sim-bg-surface)); }
.tc .tc-p[data-s="bad"] { border-color: var(--sim-bad); border-style: dashed; }
.tc .tc-p[data-s="bad"] .tc-name { color: var(--sim-bad); }
.tc .tc-p[aria-disabled="true"] { cursor: default; }
.tc .tc-p[data-s="dim"] { opacity: 0.45; }
.tc .tc-res { display: flex; flex-direction: column; gap: 6px; }
.tc .tc-eq { font: 800 20px/1.2 var(--sim-font); margin: 0; }
.tc .tc-rule { margin: 0; font: 700 16px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.tc .tc-line { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin: 0; font: 800 17px/1.25 var(--sim-font); }
.tc .tc-line b { font-size: 22px; white-space: nowrap; }
.tc .tc-line[data-tone="good"] b { color: var(--sim-good); } .tc .tc-line[data-tone="bad"] b { color: var(--sim-bad); }
.tc .tc-big { display: flex; align-items: center; gap: 8px; font: 800 30px/1.1 var(--sim-font-display, var(--sim-font)); margin: 2px 0 0; }
.tc .tc-big svg { height: 34px; width: auto; }
.tc .tc-big span { font-size: 19px; color: var(--sim-label-muted); }
.tc .tc-say2 { margin: 0; font: 700 16px/1.35 var(--sim-font); }
.tc .tc-say2[data-tone="good"] { color: var(--sim-good); } .tc .tc-say2[data-tone="bad"] { color: var(--sim-bad); }
.tc .tc-next { min-height: 48px; font-size: 17px; font-weight: 800; border: 0; background: var(--sim-accent); color: var(--sim-bg-deep); margin-top: auto;
  box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.tc .tc-next:active { box-shadow: none; }
.tc .tc-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 4px; margin: 0; font: 800 15px/1.3 var(--sim-font); }
.tc .tc-chain svg { width: 34px; height: 28px; }
.tc-anim .tc-pop { animation: tc-pop 0.45s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes tc-pop { from { transform: scale(0.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .tc-anim .tc-pop { animation: none; } }
.sim-dom-root--portrait .tc .tc-main { display: flex; flex-direction: column; gap: 9px; }
.sim-dom-root--portrait .tc .tc-side { display: grid; grid-template-columns: 76px minmax(0, 1fr); column-gap: 10px; row-gap: 3px; padding: 6px 8px; }
.sim-dom-root--portrait .tc .tc-side > .tc-lab { display: none; }
.sim-dom-root--portrait .tc .tc-hold { grid-column: 1; grid-row: 1 / span 2; padding: 2px; }
.sim-dom-root--portrait .tc .tc-side > p { grid-column: 2; }
.sim-dom-root--portrait .tc .tc-hold svg { width: 68px; height: 54px; }
.sim-dom-root--portrait .tc .tc-hold b { display: none; }
.sim-dom-root--portrait .tc .tc-purse svg { width: 28px; height: 28px; }
.sim-dom-root--portrait .tc .tc-purse b { font-size: 24px; }
.sim-dom-root--portrait .tc .tc-road { grid-column: 1 / -1; margin-top: 2px; }
.sim-dom-root--portrait .tc .tc-pip { width: 30px; height: 30px; }
.sim-dom-root--portrait .tc .tc-pip svg { width: 24px; height: 19px; }
.sim-dom-root--portrait .tc .tc-board { padding: 8px; gap: 6px; }
.sim-dom-root--portrait .tc .tc-ask { font-size: 17px; }
.sim-dom-root--portrait .tc .tc-people { grid-template-columns: minmax(0, 1fr); gap: 6px; }
.sim-dom-root--portrait .tc .tc-p { flex-direction: row; justify-content: flex-start; text-align: left; padding: 2px 8px 2px 2px; gap: 8px; min-height: 0; }
.sim-dom-root--portrait .tc .tc-fig { width: 72px; height: 84px; order: -1; }
.tc .tc-why { display: none; }
.sim-dom-root--portrait .tc[data-ph="wrong"] .tc-why { display: block; font-size: 15px; }
.sim-dom-root--portrait .tc[data-ph="wrong"] .tc-ask { display: none; }
.sim-dom-root--portrait .tc[data-ph="pick"] .tc-res, .sim-dom-root--portrait .tc[data-ph="wrong"] .tc-res { display: none; }
.sim-dom-root--portrait .tc[data-ph="right"] .tc-p[data-s="dim"] { display: none; }
.sim-dom-root--portrait .tc[data-ph="right"] .tc-ask { display: none; }
.sim-dom-root--portrait .tc[data-ph="won"] .tc-board { display: none; }
.sim-dom-root--portrait .tc .tc-res { padding: 8px 10px; gap: 4px; }
.sim-dom-root--portrait .tc .tc-res .tc-eq { font-size: 18px; }
.sim-dom-root--portrait .tc .tc-ptext { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; flex: 1 1 auto; }
.sim-dom-root--portrait .tc .tc-say { min-height: 0; font-size: 16px; justify-content: flex-start; text-align: left; padding: 6px 8px 6px 14px; }
.sim-dom-root--portrait .tc .tc-say::after { left: -7px; bottom: auto; top: 50%; transform: translateY(-50%) rotate(135deg); }
.sim-dom-root--portrait .tc .tc-big { font-size: 26px; }
.tc .tc-ptext { display: contents; }
.sim-dom-root--portrait .tc .tc-ptext { display: flex; }
`;

export class TradeChainGame extends GameBoard {
  static HEIGHT = 430;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'In all six rounds, give your goods to the person who needs them.' } };
  static ARIA_LABEL = 'The trade chain game from the Jataka tale. You start with a dead mouse and no coins. In each of six rounds you hold something, and three people each say what is wrong for them. Tap the person your goods help: a trade gives you coins or new goods. A wrong tap costs nothing. The coin amounts are made up; the purse ends with 120 coins.';

  async setup() {
    this.reset();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm tc"><div class="gm-head"><h2 class="tc-h"></h2>
        <p class="sub">An old story; made-up coins. Read what each person says, then tap the one your goods help.</p></div>
        <div class="tc-main">
          <div class="tc-card tc-side"></div>
          <div class="tc-card tc-board"></div>
          <div class="tc-card tc-res" aria-live="polite"></div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.round = 0;
    this.pick = null;          // the person tapped last in this round
    this.tried = [];           // wrong people tried in this round
    this.done = ROUNDS.map(() => false);
    this.misses = 0;
    this.won = false;
    this.fresh = false;
    this.order = this.shuffle(0);
  }

  shuffle(r) {
    const R = ROUNDS[r], a = [R.right, ...R.others];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  portrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  purseNow() {
    // coins in hand at the start of this round (before its trade)
    return this.round === 0 ? 0 : ROUNDS[this.round - 1].purse;
  }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.tc-board')) return;
    const R = ROUNDS[this.round];
    q('.gm.tc').dataset.ph = this.won ? 'won' : this.pick === null ? 'pick' : this.pick === R.right ? 'right' : 'wrong';
    q('.tc-h').textContent = this.won ? 'From a dead mouse to 120 coins' : `Round ${this.round + 1} of 6: ${R.good}`;
    q('.tc-side').innerHTML = this.sideHtml();
    const board = q('.tc-board');
    board.classList.toggle('tc-anim', this.fresh);
    board.innerHTML = this.boardHtml();
    board.querySelectorAll('.tc-p').forEach((b) => onTap(b, () => this.tap(b.dataset.who)));
    const res = q('.tc-res');
    res.classList.toggle('tc-anim', this.fresh);
    res.innerHTML = this.resultHtml();
    const nx = q('.tc-next');
    if (nx) onTap(nx, () => this.next());
    this.fresh = false;
    paintPeople({ sv: { wrap: this.root }, root: this.root });
    paintCats(this.root);
    this.relayout?.();
  }

  sideHtml() {
    const R = ROUNDS[this.round], done = this.done[this.round];
    const hold = this.won ? { hold: 'refresh', good: 'a full purse' } : R;
    const purse = this.won ? 120 : done ? R.purse : this.purseNow();
    const road = ROUNDS.map((r, i) => `<span class="tc-pip" data-s="${this.done[i] ? 'done' : i === this.round && !this.won ? 'now' : ''}" aria-label="round ${i + 1}: ${r.good}${this.done[i] ? ', done' : ''}">${goodArt(r.hold)}</span>`).join('');
    return `<p class="tc-lab">You hold</p>
      <div class="tc-hold">${this.won ? coinSvg(3) : goodArt(hold.hold)}<b>${this.won ? '120 coins' : R.good}</b></div>
      <p class="tc-got">${this.won ? 'Six trades, one after another.' : R.got}</p>
      <p class="tc-purse">${coinSvg(1)}<span>Purse</span><b>${purse}</b><span>coins</span></p>
      <div class="tc-road">${road}</div>`;
  }

  boardHtml() {
    const R = ROUNDS[this.round], done = this.done[this.round] || this.won, P = this.portrait();
    const ask = this.won ? 'Everyone you helped' : `You hold <b>${R.good}</b>. Who needs it?`;
    const who = this.won ? ['catkeeper', 'garland', 'foreigner'] : this.order;
    const people = who.map((k) => {
      const p = PEOPLE[k];
      const s = this.won ? 'good' : done && k === R.right ? 'good' : done ? 'dim' : this.tried.includes(k) ? 'bad' : '';
      const fh = P ? 76 : 146, fx = P ? (p.cat ? 24 : 36) : (p.cat ? 52 : 66), fy = P ? 80 : 154;
      const fig = personSlot(k, { x: fx, y: fy, h: fh, mood: s === 'good' ? 'happy' : s === 'bad' ? 'sad' : 'think' })
        + (p.cat ? catSlot(P ? 56 : 108, fy, P ? 25 : 48) : '');
      return `<button type="button" class="tap btn tc-p" data-who="${k}"${s ? ` data-s="${s}"` : ''}${done ? ' aria-disabled="true"' : ''} aria-label="${p.name} says: ${p.says}">
        <span class="tc-ptext"><span class="tc-say">${p.says}</span><span class="tc-name">${p.name}</span></span><span class="tc-fig">${fig}</span></button>`;
    }).join('');
    const why = !this.won && this.pick !== null && this.pick !== R.right ? `<p class="tc-why tc-say2 tc-pop" data-tone="bad">${this.why(this.pick)}</p>` : '';
    return `<p class="tc-ask">${ask}</p>${why}<div class="tc-people">${people}</div>`;
  }

  resultHtml() {
    if (this.won) {
      const chain = ROUNDS.map((r) => `<span title="${r.good}">${goodArt(r.hold)}</span>`).join('<span>&gt;</span>');
      return `<p class="tc-eq">All six trades done.</p>
        <p class="tc-big tc-pop">${coinSvg(3)}120 <span>coins</span></p>
        <p class="tc-chain">${chain}</p>
        <p class="tc-say2" data-tone="good">Each trade gave what someone needed, and each one paid for the next.</p>`;
    }
    const R = ROUNDS[this.round];
    if (this.pick === null) {
      return `<p class="tc-eq">Tap a person.</p>
        <p class="tc-rule">Each person says what is wrong for them. Your ${R.good} can help one of them.</p>
        <p class="tc-rule">A wrong tap costs nothing.</p>`;
    }
    const k = this.pick, p = PEOPLE[k];
    if (k !== R.right) {
      return `<p class="tc-eq">${p.name}</p>
        <p class="tc-say2 tc-pop" data-tone="bad">${this.why(k)}</p>`;
    }
    let lines = `<p class="tc-say2 tc-pop" data-tone="good">${R.did}</p>`;
    if (R.plus) lines += `<p class="tc-line tc-pop" data-tone="good" style="--d:0.3s"><span>Coins in</span><b>+${R.plus}</b></p>`;
    if (R.spend) lines += `<p class="tc-line tc-pop" data-tone="bad" style="--d:0.6s"><span>${R.spent}</span><b>-${R.spend}</b></p>`;
    const next = `<button type="button" class="tap btn tc-next">${this.round < 5 ? 'Next round' : 'See the road'}</button>`;
    return `<p class="tc-eq">Good trade!</p>${lines}
      <p class="tc-big tc-pop" style="--d:0.8s">${coinSvg(1)}${R.purse} <span>coins in the purse</span></p>${next}`;
  }

  why(k) {
    const p = PEOPLE[k], R = ROUNDS[this.round];
    return `${p.name === 'A family' ? 'The family needs' : `The ${p.name.toLowerCase()} needs`} ${p.needs}, not ${R.good}. Try again.`;
  }

  tap(k) {
    if (this.won || this.done[this.round]) return;
    const R = ROUNDS[this.round];
    this.pick = k;
    if (k === R.right) this.done[this.round] = true;
    else { if (!this.tried.includes(k)) this.tried.push(k); this.misses++; }
    this.fresh = true;
    this.draw();
  }

  next() {
    if (!this.done[this.round]) return;
    if (this.round < ROUNDS.length - 1) {
      this.round++;
      this.pick = null;
      this.tried = [];
      this.order = this.shuffle(this.round);
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

  testState() { return { round: this.round, pick: this.pick, tried: this.tried.slice(), solved: this.done.slice(), won: this.won, order: this.order.slice(), misses: this.misses }; }
}
