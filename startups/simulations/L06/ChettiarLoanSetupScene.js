/**
 * ChettiarLoanSetupScene - L06 s02 predict "Lending far from home" (setup mount, 1 beat). SvgScene, design 560 x 440
 * landscape, 390 x 600 portrait. The situation only, never the answer: no handshake, no account book, no words
 * about trust, ethics or records.
 *   b0 Two shores with the sea between. Left shore 'Tamil Nadu': the lender (plain white kurta, a small money
 *      chest). Right shore 'Burma': the rice trader with two sacks 'rice'. A dashed arc over the sea from the
 *      lender to the trader carries a money pouch (coin on it) with a '?' badge; a boat on the sea; a muted chip
 *      'no formal bank' on the water. Nothing to tap; the pouch slides along the arc once (0.8 s), then rests at
 *      the top of the arc.
 * Cast: lender and trader registered here (same keys and looks in ChettiarKnownForScene). Rice sacks are
 * StallKit's sugarBag with label 'rice'; the pouch, the chest and the sea are drawn here. No host controls.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, registerCast } from '../shared/FinPeople.js';
import { STALL_CSS, sugarBag } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }]];

registerCast('lender', { name: 'Lender', series: 0, role: 'adult', i: 71,
  look: { outfit: 'kurta', top: 'white', bottom: 'cream', hairStyle: 'crop', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: false, girth: 1.04 } });
registerCast('ricetrader', { name: 'Rice trader', series: 0, role: 'adult', i: 72,
  look: { outfit: 'shirt', top: 'sage', bottom: 'stone', hairStyle: 'short', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: false, sleeves: 'rolled', girth: 1 } });

const CSS = `
svg .cl-slide { animation: cl-slide 0.8s cubic-bezier(.4,0,.3,1) both; animation-delay: 0.3s; }
@keyframes cl-slide { 0% { transform: translate(var(--dx), var(--dy)); opacity: 0.5; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .cl-slide { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, cx, cy, s, t) => iconSvg(name, t).replace('width="48" height="48"', `x="${f1(cx - s / 2)}" y="${f1(cy - s / 2)}" width="${s}" height="${s}"`);

/** A cloth money pouch, tied at the neck, a coin on its front; (x, y) = bottom centre, h tall. */
function pouch(x, y, h) {
  const w = h * 0.86, top = y - h, col = 'var(--sim-series-6)', rim = shade(col, 62);
  const d = `M${f1(x - w * 0.22)} ${f1(top + h * 0.26)}Q${f1(x - w * 0.62)} ${f1(y - h * 0.3)} ${f1(x - w * 0.4)} ${f1(y - h * 0.04)}Q${f1(x)} ${f1(y + h * 0.06)} ${f1(x + w * 0.4)} ${f1(y - h * 0.04)}Q${f1(x + w * 0.62)} ${f1(y - h * 0.3)} ${f1(x + w * 0.22)} ${f1(top + h * 0.26)}Z`;
  return `<path d="${d}" transform="translate(0 3)" ${fill(rim)}/>`
    + `<path d="${d}" ${fill(`color-mix(in oklab, ${col} 70%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - w * 0.24)} ${f1(top + h * 0.26)}L${f1(x - w * 0.3)} ${f1(top)}H${f1(x + w * 0.3)}L${f1(x + w * 0.24)} ${f1(top + h * 0.26)}Z" ${fill(`color-mix(in oklab, ${col} 70%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - w * 0.27)} ${f1(top + h * 0.25)}H${f1(x + w * 0.27)}" ${stroke(shade('var(--sim-gold)', 70), 4)}/>`
    + coin(x, y - h * 0.38, h * 0.24);
}

/** A small wooden money chest, (x, y) = bottom centre. */
function chest(x, y, w) {
  const h = w * 0.62, col = 'color-mix(in oklab, var(--sim-set-desk) 55%, var(--sim-gold))', rim = shade('var(--sim-set-desk)', 70);
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h + 3)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(rim)}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x - w / 2)} ${f1(y - h * 0.62)}H${f1(x + w / 2)}" ${stroke(rim, 2.5)}/>`
    + `<rect x="${f1(x - w * 0.08)}" y="${f1(y - h * 0.7)}" width="${f1(w * 0.16)}" height="${f1(h * 0.22)}" rx="3" ${fill('var(--sim-gold)', `stroke:${shade('var(--sim-gold)', 60)};stroke-width:1.5`)}/>`;
}

export class ChettiarLoanSetupScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 440;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 1: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A lender in Tamil Nadu sends a money pouch across the sea to a rice trader in Burma. There is no formal bank in between. A question mark asks what made such a loan work.';

  css() { return MONEY_CSS + STALL_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 440) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 440, k = (st.W / DW).toFixed(4);
    const G = P
      ? { gy: 420, sea: [118, 272], L: [64, 190], R: [316, 184], chest: [118, 52], sacks: [[362, 72]], arc: [[96, 260], [195, 92], [298, 262]], place: 24, py: 462, ty: 506, boat: [195, 470, 64], bank: [195, 548] }
      : { gy: 340, sea: [176, 384], L: [96, 196], R: [466, 188], chest: [160, 58], sacks: [[522, 72], [552, 56]], arc: [[136, 186], [280, 54], [424, 188]], place: 28, py: 382, ty: 420, boat: [280, 378, 70], bank: [280, 300] };
    const [sa, sb] = G.sea;
    let svg = '';
    // the sea between two shores (water band, a few wave marks)
    svg += `<path d="M${sa} ${G.gy - 10}Q${sa + 16} ${G.gy + 6} ${sa + 8} ${DH}H${sb - 8}Q${sb - 16} ${G.gy + 6} ${sb} ${G.gy - 10}Z" ${fill('color-mix(in oklab, var(--sim-water) 55%, var(--sim-bg-surface))', `stroke:${shade('var(--sim-water)', 70)};stroke-width:2`)}/>`;
    for (let i = 0; i < 3; i++) {
      const wx = sa + 30 + i * ((sb - sa - 60) / 2), wy = G.gy + 22 + (i % 2) * 18;
      svg += `<path d="M${f1(wx - 16)} ${wy}q8 -8 16 0t16 0" ${stroke(shade('var(--sim-water)', 72), 3, 'stroke-linecap:round')}/>`;
    }
    svg += `<path d="M0 ${G.gy}H${sa}M${sb} ${G.gy}H${DW}" ${stroke('var(--sim-stroke)', 3)}/>`;
    svg += icon('boat', G.boat[0], G.boat[1], G.boat[2], 4);
    // left shore: a money chest by the lender; right shore: rice sacks by the trader
    svg += chest(G.chest[0], G.gy, G.chest[1]);
    G.sacks.forEach(([x, h], i) => { svg += sugarBag(x, G.gy, h, { label: i ? '' : 'rice' }); });
    // place names under the shores, role tags under them
    svg += text(G.L[0], G.py, 'Tamil Nadu', G.place) + text(G.R[0], G.py, 'Burma', G.place);
    svg += nameTag(G.L[0], G.ty - 22, 'lender', 20) + nameTag(G.R[0], G.ty - 22, 'ricetrader', 20);
    // the loan over the sea: a dashed arc, the pouch resting at its top with a question badge
    const [[ax, ay], [mx, my], [bx, by]] = G.arc, cy = 2 * my - (ay + by) / 2;
    svg += `<path d="M${ax} ${ay}Q${mx} ${f1(cy)} ${bx} ${by}" ${stroke('var(--sim-accent)', 4, 'stroke-dasharray:10 9;stroke-linecap:round')}/>`;
    svg += `<path d="M${bx - 14} ${by - 16}L${bx} ${by}L${bx - 20} ${by + 2}" ${stroke('var(--sim-accent)', 4, 'stroke-linecap:round;stroke-linejoin:round')}/>`;
    const ph = P ? 64 : 70;
    svg += `<g class="cl-slide" style="--dx:${ax - mx}px;--dy:${ay - my}px">${pouch(mx, my + ph * 0.5, ph)}</g>`;
    svg += `<g class="mk-pop" style="--d:1.1s"><circle cx="${mx + ph * 0.62}" cy="${my - ph * 0.42}" r="22" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-accent);stroke-width:3.5')}/>${text(mx + ph * 0.62, my - ph * 0.42 + 11, '?', 32, 'var(--sim-accent)')}</g>`;
    // no bank in between
    const [nx, ny] = G.bank, nw = 196;
    svg += `<rect x="${nx - nw / 2}" y="${ny - 20}" width="${nw}" height="40" rx="20" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2;stroke-dasharray:6 5')}/>`
      + text(nx, ny + 8, 'no formal bank', 22, 'var(--sim-label-muted)', 'middle', 700);
    const over = personSlot('lender', { x: G.L[0], y: G.gy, h: G.L[1], facing: 1, mood: 'smile' })
      + personSlot('ricetrader', { x: G.R[0], y: G.gy, h: G.R[1], facing: -1, mood: 'think' });
    return { floor: Math.round(G.gy * +k), svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() { return { view: 0, from: 'Tamil Nadu', to: 'Burma', answerShown: false }; }
}
