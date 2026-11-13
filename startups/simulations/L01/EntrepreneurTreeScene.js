/**
 * EntrepreneurTreeScene - L01 s05 "Entrepreneurship" (3 beats). SvgScene, design 560 x 490 landscape, 390 x 610
 * portrait. Cast: shared/StallKit.js (stall, glass, coin) + FinPeople people.
 *   b0 Entrepreneurship defined: an idea (a bulb) -> an arrow -> the nimbu pani stall (a business), you and a
 *      classmate behind it; under them three word cards pop in: plan / organise / learn by doing (the three
 *      verbs of the sentence).
 *   b1 Fig 6.1 as the hero: a tree, trunk and crown, TEN round badges with the book's words (Market, Activities,
 *      Performance, Strategy, Team, AI, Analysis, Goal, Opportunities, Innovation); badges pop in along the crown.
 *   b2 The same tree: four badges lit (Team, Market, Goal, Innovation), each with a small stall picture next to
 *      it (two classmates / a parent and a child / a coin 'profit?' against the Goal ring / a glass with a mint leaf); the other six
 *      dimmed but readable. A chip 'at your stall'.
 * Portrait: the tree in two columns (badge words under each badge), pictures in the middle lane.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg } from '../shared/FinPeople.js';
import { STALL_CSS, stall, stallTop, glass } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

// The ten elements of Fig 6.1: word, icon (null = the letters drawn big), series colour.
const EL = {
  Market: ['shop', 1], Activities: ['hammer', 2], Performance: ['check', 3], Strategy: ['pin', 4], Team: ['crowd', 5],
  AI: [null, 6], Analysis: ['eye', 7], Goal: ['flag', 8], Opportunities: ['globe', 4], Innovation: ['bulb', 2],
};
const LIT = ['Team', 'Market', 'Goal', 'Innovation'];
// Badge centres: landscape (rows on a crown) and portrait (two columns).
const POS_L = { Market: [190, 58], Activities: [370, 58], Performance: [95, 150], AI: [280, 150], Strategy: [465, 150],
  Team: [95, 242], Goal: [465, 242], Opportunities: [115, 334], Innovation: [290, 334], Analysis: [470, 334] };
const POS_P = { Market: [80, 58], Activities: [310, 58], Performance: [80, 160], Strategy: [310, 160], Team: [80, 262], AI: [310, 262],
  Analysis: [80, 364], Goal: [310, 364], Opportunities: [80, 466], Innovation: [310, 466] };

const BARK = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 38%)';
const CROWN = 'color-mix(in oklab, var(--sim-series-3) 20%, var(--sim-bg-surface))';
const LEAF = 'color-mix(in oklab, var(--sim-series-3) 80%, var(--sim-label) 10%)';

const CSS = `
svg .et-pop { transform-box: fill-box; transform-origin: center; animation: et-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes et-pop { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .et-grow { transform-box: fill-box; transform-origin: left center; animation: et-grow 0.6s ease-out both; animation-delay: var(--d, 0s); }
@keyframes et-grow { 0% { transform: scaleX(0); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .et-pop, svg .et-grow { animation: none; } }
`;

const txt = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${f1(size)}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;

/** A word card (rounded, lip under it), centre (x, y). */
function wordCard(x, y, w, word, size, o = {}) {
  const h = size * 2.1, col = o.col ?? 'var(--sim-accent)';
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(shade(col, 60))}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(`color-mix(in oklab, ${col} 14%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:3`)}/>`
    + txt(x, y + size * 0.36, word, size) + '</g>';
}

/** One badge of Fig 6.1: a disc with a series ring and an icon, the word on a pill under it. */
function badge(word, x, y, o = {}) {
  const [ic, n] = EL[word], r = o.r ?? 30, fs = o.fs ?? 21, col = `var(--sim-series-${n})`;
  const lw = word.length * fs * 0.6 + 18, ly = y + r + fs * 0.95;
  let s = `<circle cx="${f1(x)}" cy="${f1(y + 3)}" r="${f1(r)}" ${fill(shade(col, 60))}/>`;
  s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill(`color-mix(in oklab, ${col} 16%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:5`)}/>`;
  s += ic ? icon(ic, x, y, r * 1.3, n) : txt(x, y + r * 0.3, word, r * 0.85, col);
  if (o.lit) s = `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 9)}" ${fill('color-mix(in oklab, var(--sim-accent) 22%, transparent)', 'stroke:var(--sim-accent);stroke-width:3')}/>` + s;
  s += `<rect x="${f1(x - lw / 2)}" y="${f1(ly - fs * 0.95)}" width="${f1(lw)}" height="${f1(fs * 1.35)}" rx="${f1(fs * 0.6)}" ${fill('var(--sim-bg-surface)', `stroke:${o.lit ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${o.lit ? 3 : 2}`)}/>`;
  s += txt(x, ly, word, fs);
  const cls = [o.pop ? 'et-pop' : '', o.lit ? 'st-glow' : ''].filter(Boolean).join(' ');
  const back = o.dim ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r + 3)}" ${fill('var(--sim-bg-surface)')}/><rect x="${f1(x - lw / 2)}" y="${f1(ly - fs * 0.95)}" width="${f1(lw)}" height="${f1(fs * 1.35)}" rx="${f1(fs * 0.6)}" ${fill('var(--sim-bg-surface)')}/>` : '';
  return back + `<g${cls ? ` class="${cls}"` : ''} style="${o.d != null ? `--d:${o.d}s;` : ''}${o.dim ? 'opacity:0.4;' : ''}">${s}</g>`;
}

/** A leaf (for the crown edge and the mint in the glass), centre (x, y), length l, angle a degrees. */
const leaf = (x, y, l, a, col = LEAF) =>
  `<path transform="translate(${f1(x)} ${f1(y)}) rotate(${a})" d="M${f1(-l / 2)} 0Q0 ${f1(-l * 0.45)} ${f1(l / 2)} 0Q0 ${f1(l * 0.45)} ${f1(-l / 2)} 0Z" ${fill(col, `stroke:${shade(col, 66)};stroke-width:1.5`)}/>`;

export class EntrepreneurTreeScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 610;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Entrepreneurship: an idea, drawn as a bulb, becomes a business, the nimbu pani stall, through three things: plan, organise, learn by doing. Then the figure of the elements of entrepreneurship from the book, drawn as a tree with ten round badges: Market, Activities, Performance, Strategy, Team, AI, Analysis, Goal, Opportunities, Innovation. Then four badges light up with a picture from the stall: Team (two classmates), Market (a parent and a child), Goal (a coin and the word profit), Innovation (a glass of nimbu pani with a mint leaf).';

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 610 : 490) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 610 : 490, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 0 ? this.paintIdea(P, DW, DH) : this.paintTree(P, DW, DH, v === 2);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: idea -> business, and the three verbs.
  paintIdea(P, DW, DH) {
    const G = P
      ? { bulb: [72, 96, 96], idea: 174, arr: [96, 200, 168, 250], sx: 275, gy: 352, sw: 205, kids: [236, 314], kh: 140, biz: 390,
        cards: [[100, 452, 150], [290, 452, 170], [195, 540, 250]] }
      : { bulb: [78, 170, 120], idea: 268, arr: [150, 170, 236, 170], sx: 390, gy: 330, sw: 236, kids: [345, 435], kh: 158, biz: 368,
        cards: [[80, 440, 124], [232, 440, 152], [436, 440, 204]] };
    const [bx, by, bs] = G.bulb;
    let svg = `<circle cx="${bx}" cy="${by}" r="${f1(bs * 0.55)}" class="et-pop" ${fill('color-mix(in oklab, var(--sim-series-2) 22%, transparent)')}/>`;
    svg += `<g class="et-pop">${icon('bulb', bx, by, bs, 2)}</g>`;
    svg += txt(bx, G.idea, 'an idea', 24);
    const [ax0, ay0, ax1, ay1] = G.arr, len = Math.hypot(ax1 - ax0, ay1 - ay0), ang = Math.atan2(ay1 - ay0, ax1 - ax0) * 180 / Math.PI;
    // the arrow drawn along +x, then rotated into place; it grows from the bulb
    svg += `<g transform="translate(${ax0} ${ay0}) rotate(${f1(ang)})"><g class="et-grow" style="--d:0.3s">`
      + `<path d="M0 0H${f1(len - 16)}" ${stroke('var(--sim-accent)', 8, 'stroke-linecap:round')}/>`
      + `<path d="M${f1(len - 22)} -17L${f1(len)} 0L${f1(len - 22)} 17Z" ${fill('var(--sim-accent)', 'stroke:var(--sim-accent);stroke-width:4;stroke-linejoin:round')}/></g></g>`;
    svg += stall(G.sx, G.gy, G.sw, { part: 'back' });
    let over = '';
    ['you', 'classmate1'].forEach((who, i) => { over += personSlot(who, { x: G.kids[i], y: G.gy - 4, h: G.kh, facing: 0, mood: i ? 'smile' : 'happy' }); });
    const top = stallTop(G.gy, G.sw);
    let front = stall(G.sx, G.gy, G.sw, { part: 'front' });
    front += glass(G.sx - G.sw * 0.36, top, 42) + glass((G.kids[0] + G.kids[1]) / 2, top, 42) + glass(G.sx + G.sw * 0.36, top, 42);
    front += txt(G.sx, G.biz, 'a business', 24);
    G.cards.forEach(([x, y, w], i) => { front += wordCard(x, y, w, ['plan', 'organise', 'learn by doing'][i], 26, { cls: 'et-pop', style: `--d:${1.0 + i * 0.45}s` }); });
    over += frontSvg(DW, DH, front);
    return { svg, over };
  }

  // b1 / b2: the tree of Fig 6.1; b2 lights the four seen at the stall.
  paintTree(P, DW, DH, stallView) {
    const POS = P ? POS_P : POS_L, cx = DW / 2, ground = P ? 590 : 470;
    // crown: soft blobs behind the badges
    let svg = '';
    const blobs = P
      ? [[195, 160, 155], [120, 250, 115], [270, 250, 115], [195, 330, 150], [120, 430, 110], [270, 430, 110]]
      : [[280, 150, 140], [140, 200, 120], [420, 200, 120], [280, 240, 140], [170, 320, 110], [390, 320, 110]];
    blobs.forEach(([x, y, r]) => { svg += `<circle cx="${x}" cy="${y}" r="${r}" ${fill(CROWN)}/>`; });
    // trunk and branches
    const tTop = P ? 120 : 140, tw = P ? 34 : 40;
    svg += `<ellipse cx="${cx}" cy="${ground}" rx="${P ? 150 : 200}" ry="12" ${fill('color-mix(in oklab, var(--sim-series-3) 35%, var(--sim-bg-surface))')}/>`;
    svg += `<path d="M${f1(cx - tw * 0.9)} ${ground}Q${f1(cx - tw * 0.4)} ${f1(ground - 60)} ${f1(cx - tw * 0.32)} ${f1((ground + tTop) / 2)}L${f1(cx - tw * 0.18)} ${tTop}H${f1(cx + tw * 0.18)}L${f1(cx + tw * 0.32)} ${f1((ground + tTop) / 2)}Q${f1(cx + tw * 0.4)} ${f1(ground - 60)} ${f1(cx + tw * 0.9)} ${ground}Z" ${fill(BARK, `stroke:${shade(BARK, 70)};stroke-width:2.5`)}/>`;
    for (const [word, [x, y]] of Object.entries(POS)) {
      if (Math.abs(x - cx) < 20) { svg += `<path d="M${cx} ${f1(Math.max(y, tTop) + 20)}V${y}" ${stroke(BARK, 10, 'stroke-linecap:round')}/>`; continue; }
      const jy = Math.min(ground - 70, y + (P ? 70 : 60)), mx = (cx + x) / 2;
      svg += `<path d="M${cx} ${f1(jy)}Q${f1(mx)} ${f1(jy - 4)} ${f1(x)} ${f1(y)}" ${stroke(BARK, 9, 'stroke-linecap:round')}/>`;
      svg += leaf(mx + (x < cx ? -6 : 6), jy - 20, 22, x < cx ? -30 : 30);
    }
    // a few leaves on the crown edge
    const edge = P ? [[24, 120, -40], [366, 120, 40], [30, 330, -60], [362, 330, 60], [195, 14, 0]] : [[60, 110, -40], [500, 110, 40], [30, 300, -60], [530, 300, 60], [280, 14, 0], [196, 16, -20]];
    edge.forEach(([x, y, a]) => { svg += leaf(x, y, 26, a); });
    const order = Object.keys(POS);
    let front = '', over = '';
    order.forEach((word, i) => {
      const [x, y] = POS[word], lit = stallView && LIT.includes(word);
      front += badge(word, x, y, { pop: !stallView, d: 0.08 * i, lit, dim: stallView && !lit });
    });
    if (stallView) {
      const pic = this.pictures(P);
      front += pic.svg;
      over += pic.over;
    }
    return { svg: svg + front, over };
  }

  // b2: the small stall picture next to each lit badge.
  pictures(P) {
    const G = P
      ? { market: [[170, 104, 92, 'parent'], [222, 104, 64, 'child']], team: [[172, 306, 88, 'classmate1'], [220, 306, 88, 'classmate2']],
        coin: [252, 366, 20], profit: [246, 334], glass: [195, 500, 62], chip: null }
      : { market: [[38, 104, 92, 'parent'], [86, 104, 64, 'child']], team: [[170, 292, 88, 'classmate1'], [216, 292, 88, 'classmate2']],
        coin: [404, 236, 22], profit: [340, 250], glass: [380, 370, 62], chip: [478, 18] };
    let svg = '', over = '';
    [...G.market, ...G.team].forEach(([x, y, h, who], i) => { over += personSlot(who, { x, y, h, facing: 0, mood: 'smile', cls: 'et-pop', style: `--d:${0.15 + i * 0.1}s;` }); });
    const [qx, qy, qr] = G.coin;
    // the coin sits against the Goal badge's ring, its 'profit?' pill beside it (landscape: left; portrait: above)
    const [px, py] = G.profit;
    svg += `<g class="et-pop" style="--d:0.4s">${coin(qx, qy, qr)}<rect x="${px - 40}" y="${py - 20}" width="80" height="28" rx="14" ${fill('var(--sim-bg-surface)')}/>${txt(px, py, 'profit?', 20)}</g>`;
    const [gx, gy, gh] = G.glass;
    svg += `<g class="et-pop" style="--d:0.5s">${glass(gx, gy, gh)}${leaf(gx - gh * 0.12, gy - gh * 0.98, 24, -35)}${leaf(gx + gh * 0.02, gy - gh * 1.04, 20, 20)}</g>`;
    if (G.chip) {
      const [x, y] = G.chip;
      svg += `<rect x="${x - 72}" y="${y - 6}" width="144" height="34" rx="17" ${fill('color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:2.5')}/>` + txt(x, y + 18, 'at your stall', 20);
    }
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, lit: this.stepIndex === 2 ? LIT.slice() : [] }; }
}
