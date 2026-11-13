/**
 * ChettiarKnownForScene - L06 s03 observe "Business ethics and trust" (3 beats). SvgScene, design 560 x 480
 * landscape, 390 x 600 portrait. Same lender and rice trader as ChettiarLoanSetupScene (same keys and looks).
 *   b0 Trust: the lender and the rice trader shake hands, big; over their heads a two-way arrow 'trust' (each
 *      trusts the other); under the ground 'business ethics' and its gloss 'honest and fair'; a dashed muted chip
 *      'no formal bank needed'.
 *   b1 Careful accounts: an open account book, big (the hero), title 'careful written records'; three rows light
 *      one by one (0.6 s apart): a coin going out 'lent', a coin coming back 'paid back', a small coin pile with
 *      '+' 'earned'; each row has hand-written lines (no numbers: the text gives none) and a tick.
 *   b2 Profits put back to work: a coin pile 'profits' on top; four arrows down to four tiles: trade (a boat,
 *      ringed: 'back into trade'), temples (a plain temple building, no symbols), education (school), community
 *      welfare (a well). A coin flies down each arrow, 0.4 s apart.
 * Drawn here (not in StallKit): the account book, the temple, the arrows. Nothing to tap. No host controls.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin, coinPile } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

registerCast('lender', { name: 'Lender', series: 0, role: 'adult', i: 71,
  look: { outfit: 'kurta', top: 'white', bottom: 'cream', hairStyle: 'crop', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: false, girth: 1.04 } });
registerCast('ricetrader', { name: 'Rice trader', series: 0, role: 'adult', i: 72,
  look: { outfit: 'shirt', top: 'sage', bottom: 'stone', hairStyle: 'short', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: false, sleeves: 'rolled', girth: 1 } });

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, cx, cy, s, t) => iconSvg(name, t).replace('width="48" height="48"', `x="${f1(cx - s / 2)}" y="${f1(cy - s / 2)}" width="${s}" height="${s}"`);
const arrowHead = (x, y, ang, s, col) => {
  const a = ang, p = (da) => `${f1(x - s * Math.cos(a + da))} ${f1(y - s * Math.sin(a + da))}`;
  return `<path d="M${p(0.5)}L${f1(x)} ${f1(y)}L${p(-0.5)}" ${stroke(col, 4, 'stroke-linecap:round;stroke-linejoin:round')}/>`;
};

/** A plain temple building: a base with a door and a stepped tower; (x, y) = ground centre, w wide. */
function temple(x, y, w) {
  const col = 'var(--sim-series-5)', face = `color-mix(in oklab, ${col} 40%, var(--sim-bg-surface))`, rim = shade(col, 62);
  const bh = w * 0.34, st = `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`;
  let s = `<rect x="${f1(x - w / 2)}" y="${f1(y - bh)}" width="${f1(w)}" height="${f1(bh)}" rx="3" ${fill(face, st)}/>`;
  s += `<path d="M${f1(x - w * 0.11)} ${f1(y)}V${f1(y - bh * 0.6)}Q${f1(x)} ${f1(y - bh * 0.86)} ${f1(x + w * 0.11)} ${f1(y - bh * 0.6)}V${f1(y)}Z" ${fill(rim)}/>`;
  let ty = y - bh, tw = w * 0.7;
  for (let i = 0; i < 3; i++) {
    const th = w * 0.17, nw = tw * 0.76;
    s += `<path d="M${f1(x - tw / 2)} ${f1(ty)}L${f1(x - nw / 2)} ${f1(ty - th)}H${f1(x + nw / 2)}L${f1(x + tw / 2)} ${f1(ty)}Z" ${fill(face, st)}/>`;
    ty -= th; tw = nw;
  }
  s += `<path d="M${f1(x - tw / 2)} ${f1(ty)}Q${f1(x)} ${f1(ty - w * 0.2)} ${f1(x + tw / 2)} ${f1(ty)}Z" ${fill(face, st)}/>`;
  return s;
}

export class ChettiarKnownForScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three pictures. One: the lender and the rice trader shake hands; an arrow each way says trust; business ethics means honest and fair; no formal bank needed. Two: an account book with three rows: lent, paid back, earned. Three: a pile of profits goes to four places: back into trade, temples, education and community welfare.';

  css() { return MONEY_CSS + PEOPLE_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 0 ? this.paintTrust(P) : v === 1 ? this.paintBook(P) : this.paintProfits(P);
    return { floor: out.floor != null ? Math.round(out.floor * +k) : undefined, svg: `<g transform="scale(${k})">${out.svg}</g>`,
      over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the handshake, trust both ways, business ethics.
  paintTrust(P) {
    const G = P
      ? { gy: 392, L: 132, R: 258, h: 220, ty: 118, eth: 460, gl: 494, nb: 546, ts: 36 }
      : { gy: 344, L: 214, R: 346, h: 230, ty: 50, eth: 424, gl: 424, nb: 458, ts: 38 };
    const mid = (G.L + G.R) / 2, hy = G.gy - G.h * 0.48;
    let svg = '';
    // trust: a two-way arrow between the two heads, the word above it
    const ay = G.ty + 30, ax0 = G.L + 6, ax1 = G.R - 6, col = 'var(--sim-good)';
    svg += `<g class="mk-pop" style="--d:0.3s"><path d="M${ax0} ${ay + 26}Q${mid} ${ay - 22} ${ax1} ${ay + 26}" ${stroke(col, 5, 'stroke-linecap:round')}/>`
      + arrowHead(ax1, ay + 26, 0.75, 16, col) + arrowHead(ax0, ay + 26, Math.PI - 0.75, 16, col)
      + text(mid, G.ty, 'trust', G.ts, shade(col, 75)) + '</g>';
    // business ethics, its gloss, and no bank needed
    if (P) {
      svg += text(mid, G.eth, 'business ethics', 30) + text(mid, G.gl, 'honest and fair', 24, 'var(--sim-label-muted)', 'middle', 700);
    } else {
      svg += text(mid + 8, G.eth, 'business ethics', 30, 'var(--sim-label)', 'end') + text(mid + 24, G.eth, 'honest and fair', 24, 'var(--sim-label-muted)', 'start', 700);
    }
    const nw = 250, nx = mid, ny = G.nb;
    svg += `<rect x="${f1(nx - nw / 2)}" y="${ny - 18}" width="${nw}" height="36" rx="18" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2;stroke-dasharray:6 5')}/>`
      + text(nx, ny + 7, 'no formal bank needed', 20, 'var(--sim-label-muted)', 'middle', 700);
    const grip = { x: mid, y: hy };
    const over = personSlot('lender', { x: G.L, y: G.gy, h: G.h, facing: 1, mood: 'happy', hands: [grip, null] })
      + personSlot('ricetrader', { x: G.R, y: G.gy, h: G.h * 0.97, facing: -1, mood: 'happy', hands: [{ x: mid + 2, y: hy + 2 }, null] });
    svg += nameTag(G.L, G.gy + 8, 'lender', 18) + nameTag(G.R, G.gy + 8, 'ricetrader', 18);
    return { svg, over, floor: G.gy };
  }

  // b1: the account book, three rows lit in turn.
  paintBook(P) {
    const B = P ? { x: 20, y: 70, w: 350, h: 470, rowH: 128, t: 44 } : { x: 40, y: 64, w: 480, h: 368, rowH: 112, t: 40 };
    const paper = 'var(--sim-set-paper)', rim = 'var(--sim-stroke)';
    let svg = text(DWof(P) / 2, B.t, 'careful written records', P ? 28 : 30);
    // the book: a cover edge, two pages and a spine (one long page in portrait)
    svg += `<rect x="${B.x - 8}" y="${B.y + 6}" width="${B.w + 16}" height="${B.h}" rx="14" ${fill('color-mix(in oklab, var(--sim-series-6) 60%, var(--sim-bg-surface))', `stroke:${shade('var(--sim-series-6)', 60)};stroke-width:2.5`)}/>`;
    svg += `<rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h - 6}" rx="8" ${fill(paper, `stroke:${rim};stroke-width:2.5`)}/>`;
    const rows = [
      { lab: 'lent', kind: 'out', col: 'var(--sim-series-2)' },
      { lab: 'paid back', kind: 'in', col: 'var(--sim-series-1)' },
      { lab: 'earned', kind: 'plus', col: 'var(--sim-good)' },
    ];
    const top = B.y + (P ? 30 : 24);
    rows.forEach((r, i) => {
      const y = top + i * B.rowH, cy = y + B.rowH / 2 - 6, d = 0.3 + i * 0.6;
      // rule under the row
      if (i < 2) svg += `<path d="M${B.x + 16} ${f1(y + B.rowH - 6)}H${B.x + B.w - 16}" ${stroke('color-mix(in oklab, var(--sim-label) 25%, transparent)', 2)}/>`;
      let g = '';
      const ix = B.x + 52;
      if (r.kind === 'plus') {
        g += coinPile(ix, cy + 26, 600, { r: 11 }) + text(ix + 40, cy - 6, '+', 34, shade(r.col, 70));
      } else {
        g += coin(ix, cy, 20);
        const x0 = ix + 26, x1 = ix + 74, out = r.kind === 'out';
        g += `<path d="M${out ? x0 : x1} ${f1(cy)}H${out ? x1 : x0}" ${stroke(r.col, 5, 'stroke-linecap:round')}/>` + arrowHead(out ? x1 : x0, cy, out ? 0 : Math.PI, 13, r.col);
      }
      const lx = B.x + (P ? 140 : 150);
      g += text(lx, cy + 11, r.lab, P ? 30 : 32, 'var(--sim-label)', 'start');
      // hand-written lines (no numbers), then a tick
      const wx = P ? B.x + 140 : B.x + 318, wy = P ? cy + 40 : cy - 4, ww = P ? 150 : 90;
      for (let j = 0; j < 2; j++) {
        const yy = wy + j * 16, len = ww * (j ? 0.65 : 1);
        g += `<path d="M${f1(wx)} ${f1(yy)}q${f1(len / 8)} -7 ${f1(len / 4)} 0t${f1(len / 4)} 0t${f1(len / 4)} 0t${f1(len / 4)} 0" ${stroke('color-mix(in oklab, var(--sim-label) 55%, transparent)', 2.5, 'stroke-linecap:round')}/>`;
      }
      const kx = B.x + B.w - 36, ky = P ? cy - 4 : cy + 4;
      g += `<path d="M${kx - 14} ${ky}l10 11l20 -24" ${stroke('var(--sim-good)', 5, 'stroke-linecap:round;stroke-linejoin:round')}/>`;
      svg += `<g class="mk-pop" style="--d:${d}s">${g}</g>`;
    });
    return { svg };
  }

  // b2: profits split four ways.
  paintProfits(P) {
    const G = P
      ? { pile: [195, 316], lab: [195, 352], tiles: [[105, 92], [285, 92], [105, 484], [285, 484]], tw: 164, th: 140 }
      : { pile: [280, 158], lab: [280, 50], tiles: [[78, 362], [214, 362], [346, 362], [482, 362]], tw: 124, th: 150 };
    let svg = coinPile(G.pile[0], G.pile[1], 1000, { r: 15 }) + text(G.lab[0], G.lab[1], 'profits', 34);
    const T = [
      { lab: ['back into', 'trade'], draw: (x, y, s) => icon('boat', x, y, s, 4), ring: true },
      { lab: ['temples'], draw: (x, y, s) => temple(x, y + s * 0.45, s * 0.86) },
      { lab: ['education'], draw: (x, y, s) => icon('school', x, y, s, 2) },
      { lab: ['community', 'welfare'], draw: (x, y, s) => icon('well', x, y, s, 7) },
    ];
    T.forEach((t, i) => {
      const [cx, cy] = G.tiles[i], x0 = cx - G.tw / 2, y0 = cy - G.th / 2, d = 0.3 + i * 0.4;
      // the arrow from the pile to the tile, a coin flying down it
      const up = cy < G.pile[1];
      const sx = G.pile[0] + (cx - G.pile[0]) * (P ? 0.3 : 0.18), sy = up ? G.pile[1] - 92 : G.pile[1] + (P ? 52 : 10), ex = cx + (P ? (G.pile[0] - cx) * 0.3 : 0), ey = up ? y0 + G.th + 12 : y0 - 10;
      const ang = Math.atan2(ey - sy, ex - sx);
      svg += `<path d="M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}" ${stroke('var(--sim-accent)', 4, 'stroke-dasharray:9 8;stroke-linecap:round')}/>` + arrowHead(ex, ey, ang, 14, 'var(--sim-accent)');
      svg += `<g class="mk-fly" style="--d:${d}s;--dx:${f1(sx - (sx + ex) / 2)}px;--dy:${f1(sy - (sy + ey) / 2)}px">${coin((sx + ex) / 2, (sy + ey) / 2, 14)}</g>`;
      const edge = t.ring ? 'var(--sim-accent)' : 'var(--sim-stroke)';
      svg += `<g class="mk-pop" style="--d:${d + 0.2}s"><rect x="${f1(x0)}" y="${f1(y0 + 4)}" width="${G.tw}" height="${G.th}" rx="16" ${fill(edge)}/>`
        + `<rect x="${f1(x0)}" y="${f1(y0)}" width="${G.tw}" height="${G.th}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${edge};stroke-width:${t.ring ? 3.5 : 2.5}`)}/>`
        + t.draw(cx, y0 + (P ? 46 : 50), P ? 66 : 70);
      const ls = P ? 22 : 21, ly = y0 + G.th - (t.lab.length === 2 ? (P ? 36 : 36) : 16);
      t.lab.forEach((l, j) => { svg += text(cx, ly + j * (ls + 10) - (t.lab.length === 2 ? 6 : 0), l, ls); });
      svg += '</g>';
    });
    return { svg };
  }

  testState() { return { view: this.stepIndex }; }
}

function DWof(P) { return P ? 390 : 560; }
