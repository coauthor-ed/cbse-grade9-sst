// WarnWorld - our own drawing of a coast with a tsunami warning system: land, a sea, the rock and plates
// below, stations and satellites. An idea from the book's figure, in our art. Helper, not a scene.
//   warnWorld(W, H, { lit, show, tagged }) -> { svg, at }
// lit: Set of part ids to light (empty: all lit). show: extra ids that are off by default (obpr, radar, hump, phone).
// Parts: 1 centre dish, 2 model, 3a 3b training, 4 comm sat, 5 gps sat, 6 tide gauge, 7 gps station,
// 8 seismometer, 9 seismic waves, 10 earthquake. Links run from satellites to stations.
import { sky, tx } from '../L04/SeaDraw.js';
import { svgSatellite, svgHut, svgSeaColumn, svgCloud } from '../shared/SeaArt.js';

// x as a share of W; y is worked out from the ground in warnWorld.
const X = { 1: 0.12, 2: 0.22, '3a': 0.04, '3b': 0.94, 4: 0.42, 5: 0.74, 6: 0.625, 7: 0.71, 8: 0.82, obpr: 0.45 };
const dish = (x, y, k) => `<path d="M${x} ${y}v${-26 * k}" style="stroke:${sky('ink')};stroke-width:${5 * k}"/><path d="M${x - 8 * k} ${y}h${16 * k}" style="stroke:${sky('ink')};stroke-width:${6 * k}"/><path d="M${x - 20 * k} ${y - 38 * k}A${22 * k} ${22 * k} 0 0 0 ${x + 18 * k} ${y - 16 * k}Z" style="fill:${sky('white')};stroke:${sky('ink')};stroke-width:2.5"/>`;

export function warnWorld(W, H, o = {}) {
  const lit = o.lit ?? new Set(), any = lit.size > 0, show = o.show ?? new Set();
  const seaY = H * 0.52, botY = H * 0.8, xa = W * 0.3, xb = W * 0.58, x0 = W * 0.6;
  const rightY = (x) => seaY - 4 - ((Math.max(0, x - x0) / (W - x0)) ** 2) * H * 0.14;
  const groundY = (x) => (x < xa ? seaY - 6 : rightY(x));
  const pt = {};
  for (const id of Object.keys(X)) pt[id] = [X[id] * W, groundY(X[id] * W)];
  pt[4] = [W * 0.42, H * 0.12]; pt[5] = [W * 0.74, H * 0.12]; pt.obpr = [X.obpr * W, botY]; pt[10] = [W * 0.565, H * 0.92]; pt[9] = [W * 0.72, H * 0.8];
  const p = (id) => pt[id], op = (...ids) => (any && !ids.some((i) => lit.has(i)) ? 0.22 : 1);
  let s = `<defs><clipPath id="wwc"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs><g clip-path="url(#wwc)">`;
  s += `<rect width="${W}" height="${H}" style="fill:${sky('sky')}"/>` + svgCloud(W * 0.2, H * 0.14, 0.42, { seed: 2 }) + svgCloud(W * 0.9, H * 0.12, 0.34, { seed: 5 });
  s += svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, wave: 3, len: 60 });
  if (show.has('hump')) s += `<path d="M${W * 0.36} ${seaY + 2}Q${W * 0.45} ${seaY - 28} ${W * 0.54} ${seaY + 2}Z" style="fill:${sky('sea')};stroke:${sky('foam')};stroke-width:3"/>`;
  // rock: two plates meeting under the sea
  s += `<path d="M0 ${H}V${seaY - 6}H${xa}Q${xa + W * 0.04} ${seaY + 20} ${xa + W * 0.07} ${botY}H${xb - 4}L${W * 0.545} ${H}Z" style="fill:${sky('rockMid')};stroke:${sky('rockDark')};stroke-width:3"/>`;
  let ridge = '';
  for (let x = x0; x <= W + 1; x += 8) ridge += `L${x.toFixed(1)} ${rightY(x).toFixed(1)}`;
  s += `<path d="M${W * 0.545} ${H}L${xb} ${botY - 2}Q${x0 - 2} ${seaY + 20} ${x0} ${seaY - 4}${ridge}V${H}Z" style="fill:${sky('rockDark')};stroke:${sky('rockDeep')};stroke-width:3"/>`;
  s += `<path d="M0 ${seaY - 6}H${xa}" style="stroke:${sky('grass')};stroke-width:10;stroke-linecap:round"/><path d="M${x0} ${seaY - 4}${ridge}" style="fill:none;stroke:${sky('grass')};stroke-width:10"/>`;
  // links
  const link = (a, b, col, on) => `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" style="stroke:${col};stroke-width:2.5;stroke-dasharray:7 6;opacity:${on}"/>`;
  const c4 = p(4), c5 = p(5), red = sky('red'), blue = sky('hullDark'), top = (id, dy) => [p(id)[0], p(id)[1] - dy];
  for (const [id, dy] of [[1, 44], [6, 26], ['3b', 28]]) s += link(c4, top(id, dy), red, op(4, id) === 1 ? 0.9 : 0.15);
  for (const [id, dy] of [[6, 26], [7, 26]]) s += link(c5, top(id, dy), blue, op(5, id) === 1 ? 0.9 : 0.15);
  // parts
  const dk = W < 500 ? 0.72 : 1;
  const g = (ids, body) => `<g opacity="${op(...ids)}">${body}</g>`;
  s += g([1], dish(p(1)[0], p(1)[1], 1.05 * dk));
  s += g([2], `<rect x="${p(2)[0] - 16 * dk}" y="${p(2)[1] - 44 * dk}" width="${28 * dk}" height="${44 * dk}" style="fill:${sky('metal')};stroke:${sky('ink')};stroke-width:2.5"/><rect x="${p(2)[0] + 12 * dk}" y="${p(2)[1] - 28 * dk}" width="${22 * dk}" height="${28 * dk}" style="fill:${sky('metalLit')};stroke:${sky('ink')};stroke-width:2.5"/>`);
  const sign = (x, y) => `<path d="M${x} ${y}v-18" style="stroke:${sky('ink')};stroke-width:4"/><path d="M${x} ${y - 36}l12 20h-24Z" style="fill:${sky('sun')};stroke:${sky('red')};stroke-width:3;stroke-linejoin:round"/>`;
  s += g(['3a'], sign(p('3a')[0], p('3a')[1]));
  s += g(['3b'], svgHut(p('3b')[0] - 4, p('3b')[1] + 1, 0.4, {}) + sign(p('3b')[0] - 28, rightY(p('3b')[0] - 28)));
  s += g([4], svgSatellite(c4[0], c4[1], W < 500 ? 0.42 : 0.55, {}));
  s += g([5], svgSatellite(c5[0], c5[1], W < 500 ? 0.34 : 0.44, { rot: 24 }));
  s += g([6], `<rect x="${p(6)[0] - 6}" y="${p(6)[1] - 28}" width="12" height="44" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2.5"/>`);
  if (show.has('radar')) s += g(['radar'], `<path d="M${p(6)[0] + 22} ${rightY(p(6)[0] + 22)}v-30" style="stroke:${sky('ink')};stroke-width:4"/><path d="M${p(6)[0] + 8} ${rightY(p(6)[0] + 22) - 34}h28" style="stroke:${sky('ink')};stroke-width:5;stroke-linecap:round"/>`);
  s += g([7], dish(p(7)[0], p(7)[1], 0.62 * dk));
  s += g([8], `<rect x="${p(8)[0] - 15}" y="${p(8)[1] - 24}" width="30" height="24" rx="3" style="fill:${sky('white')};stroke:${sky('ink')};stroke-width:2.5"/><path d="M${p(8)[0] - 10} ${p(8)[1] - 11}l5 -6l5 11l5 -9l5 5" style="fill:none;stroke:${sky('red')};stroke-width:2.2"/>`);
  const q = p(10);
  s += g([9], [0.1, 0.17, 0.24].map((r) => `<path d="M${q[0] + W * r * 0.42} ${q[1] - W * r * 0.9}A${W * r} ${W * r} 0 0 1 ${q[0] + W * r} ${q[1] + 4}" style="fill:none;stroke:${sky('sun')};stroke-width:3.5"/>`).join(''));
  s += g([10], `<path d="M${q[0] - 13} ${q[1] + 12}l10 -14l-5 -3l12 -13l-3 11l6 2l-11 17Z" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2"/>`);
  if (show.has('obpr')) s += g(['obpr'], `<rect x="${p('obpr')[0] - 14}" y="${botY - 15}" width="28" height="16" rx="4" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2.5"/><path d="M${p('obpr')[0]} ${botY - 15}V${seaY + 8}" style="stroke:${sky('cloud')};stroke-width:2;stroke-dasharray:4 6"/>`);
  s += '</g>';
  return { svg: s, p, seaY, botY };
}
/** A numbered tag for a part. */
export function tag(n, x, y, on) {
  return `<circle cx="${x}" cy="${y}" r="14" style="fill:${on ? sky('hullDark') : sky('white')};stroke:${sky('ink')};stroke-width:2.5"/>` + tx(x, y + 5.5, String(n), { size: 15, col: on ? sky('white') : sky('ink') });
}
