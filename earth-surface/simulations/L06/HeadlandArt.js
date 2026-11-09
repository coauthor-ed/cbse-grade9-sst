// HeadlandArt - a headland in side view, after the book's arch and stack figure: land at the left, sea at the right.
// headlandSvg(W, H, P, id): P runs 0 cliff, 1 cave, 2 arch, 3 stack, 4 stump, and may be any value between.
// The stack is the OUTER LEG of the arch: between P 2 and 3 only the roof falls, and it breaks up on the shelf.
// planSvg(x, y, w, h, P, id): the same headland from above, caves biting in from both sides.
import { svgRock, svgWater, svgBoulder } from '../shared/EarthArt.js';
import { ec, clamp, lerp, plate, words, INK } from '../L04/EarthBits.js';

export const tides = (H) => ({ high: H * .62, low: H * .74 });

export function headlandSvg(W, H, P, id = 'hd', o = {}) {
  const top = H * .24, { high, low } = tides(H), shelf = H * .78, x1 = W * .78, x0 = W * .46;   // x0 inner leg edge, x1 outer leg edge
  const legW = lerp(W * .13, W * .075, clamp(P - 2)), legL = x1 - legW;
  const cave = clamp(P), through = clamp(P - 1), roofGone = clamp(P - 2), stump = clamp(P - 3);
  const hx = (x0 + legL) / 2, hrx = (legL - x0) / 2 * lerp(.72, 1, through) * Math.max(.5, cave), hry = lerp(H * .05, H * .17, cave) * lerp(.72, 1, through), hy = high + H * .02 - hry * .55;
  let b = '';
  const sea = o.level ?? (high + low) / 2;
  b += svgWater([[-10, sea], [W + 10, sea], [W + 10, H + 10], [-10, H + 10]], { t: 2, ripples: 5, deep: .5 });
  b += svgRock([[-10, shelf - 6], [W * .9, shelf], [W * .96, H * .9], [W + 10, H + 10], [-10, H + 10]], { seed: 3, fill: 'rockDark', cracks: 3 });
  const mass = [[-10, top + 8], [W * .1, top], [W * .28, top + 6], [x1 - 20, top + 12], [x1, top + 34], [x1 + 8, high], [x1 + 14, shelf + 2], [-10, shelf + 2]];
  const landOnly = [[-10, top + 8], [W * .1, top], [W * .28, top + 6], [x0 - 6, top + 26], [x0, high - 40], [x0 + 6, shelf + 2], [-10, shelf + 2]];
  if (roofGone <= 0) {
    b += svgRock(mass, { seed: 7, bands: ['rock', 'rockLit', 'rock', 'rockDark'], bandH: 34, dip: 2, cracks: 4, outline: true, lit: true });
    if (cave > 0.02) {
      const cid = `${id}-h`;
      b += `<clipPath id="${cid}"><ellipse cx="${hx}" cy="${hy}" rx="${hrx}" ry="${hry}"/></clipPath>`;
      b += `<g clip-path="url(#${cid})"><rect x="0" y="0" width="${W}" height="${H}" style="fill:url(#${id}-sky)"/>${svgWater([[0, sea], [W, sea], [W, shelf + 4], [0, shelf + 4]], { t: 2, ripples: 2 })}<rect x="0" y="0" width="${W}" height="${H}" style="fill:${ec('rockDeep')};opacity:${(1 - through).toFixed(2)}"/></g>`;
      b += `<ellipse cx="${hx}" cy="${hy}" rx="${hrx}" ry="${hry}" style="fill:none;stroke:${ec('rockDeep')};stroke-width:3.5"/>`;
    } else {
      b += `<path d="M${x1 + 10} ${high - 14}q-24 14 0 28" style="fill:${ec('rockDeep')};opacity:.8"/>`;
    }
  } else {
    b += svgRock(landOnly, { seed: 7, bands: ['rock', 'rockLit', 'rock', 'rockDark'], bandH: 34, dip: 2, cracks: 3, outline: true, lit: true });
    const roofY = lerp(0, shelf - top - 60, roofGone * roofGone);
    if (roofGone < 1) b += `<g style="opacity:${1 - clamp((roofGone - .7) / .3)}">${svgRock([[x0, top + 16 + roofY], [x1 - 6, top + 22 + roofY], [x1 - 14, top + 66 + roofY], [x0 + 10, top + 62 + roofY]], { seed: 5, fill: 'rock', outline: true })}</g>`;
    const k = clamp((roofGone - .5) * 2) * (1 - stump);
    if (k > 0) for (let i = 0; i < 5; i++) b += `<g style="opacity:${k}">${svgBoulder(x0 + 30 + i * (legL - x0 - 40) / 4, shelf + (i % 2) * 5, .62 - (i % 3) * .1 , { seed: i + 2 })}</g>`;
    const stTop = lerp(top + 40, low - 2, stump), w0 = legW;
    b += svgRock([[legL - 2, shelf + 2], [legL + 6, stTop + 30], [legL + w0 * .22, stTop], [legL + w0 * .8, stTop + 4], [x1 + 2, stTop + 34], [x1 + 8, shelf + 2]], { seed: 11, bands: ['rock', 'rockLit', 'rock', 'rockDark'], bandH: 34, dip: 2, cracks: 2, outline: true, lit: true });
  }
  return b;
}

export function planSvg(x, y, w, h, P, id) {
  const m = y + h * .56, cave = clamp(P), link = clamp(P - 1);
  const x0 = x + 12, tip = x + w * .9, hw = h * .17, bx = x + w * .62, r = 7 + 8 * cave, bite = hw * (.3 + .7 * Math.max(cave * .72, link));
  let b = plate(x, y, w, h, { fill: ec('sea') });
  b += `<path d="M${x0} ${m - hw - 7}H${tip - 12}Q${tip} ${m} ${tip - 12} ${m + hw + 7}H${x0}Z" style="fill:${ec('rock')};stroke:${INK};stroke-width:2.5"/>`;
  for (const s of [-1, 1]) b += `<ellipse cx="${bx}" cy="${m + s * (hw + 7)}" rx="${r}" ry="${bite + 2}" style="fill:${ec('sea')}"/>`;
  if (link >= 1) b += `<rect x="${bx - r * .9}" y="${m - 6}" width="${r * 1.8}" height="12" style="fill:${ec('sea')}"/>`;
  b += words(x + w / 2, y + 16, 'From above', { size: 14, anchor: 'middle' });
  return b;
}
