// IceArt - glacier pictures for lesson 7. Helper, not a scene.
// moraineSvg(W, H, o): two glaciers joining, from above. Till rides along the edges (lateral) and, where they join, down
// the middle (medial); at the snout it heaps across the valley (terminal). o.melt 0..1 takes the ice back up the valley;
// the ridges stay. o.lit 'lat' | 'med' | 'ter' dims the other two. o.lake adds a lake held behind the terminal moraine.
// mountainSvg(W, H, o): a peak with a cirque, an arete and a pass, after the book's glacial landforms figure. o.lit dims.
import { svgRock, svgSnow, svgGrass, svgWater, svgBoulder } from '../shared/EarthArt.js';
import { ec, strand, shape, lerp, clamp } from '../L04/EarthBits.js';

/** Ice along a flow: a smooth body, a shaded edge, pale lines that follow the given centre line. No band across it. */
export function iceBody(p, flow = [], o = {}) {
  let b = shape(p, { f: 'iceBody', s: 'iceCrack', w: 2.5, curve: o.curve });
  for (const [dx, dy, a] of [[-14, -6, .75], [10, 6, .6], [0, 0, .85]]) if (flow.length > 1) b += strand(flow.map(([x, y]) => [x + dx * (o.spread ?? 1), y + dy * (o.spread ?? 1)]), 'iceLit', 2.6, { opacity: a });
  return b;
}
/** Points round an ellipse, for smooth water and ice. */
export const oval = (cx, cy, rx, ry, n = 18, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n }, (_, i) => { const t = a0 + (a1 - a0) * i / n; return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]; });

const stones = (p, seed, n, dim) => {
  let b = '';
  for (let i = 0; i < n; i++) {
    const f = (i + .5) / n * (p.length - 1), j = Math.min(p.length - 2, Math.floor(f)), k = f - j;
    const x = lerp(p[j][0], p[j + 1][0], k), y = lerp(p[j][1], p[j + 1][1], k);
    b += svgBoulder(x + ((i * 7 + seed) % 9) - 4, y + ((i * 5 + seed) % 7) - 3, .22 + ((i + seed) % 3) * .06, { seed: i + seed });
  }
  return `<g style="opacity:${dim ? .25 : 1}">${b}</g>`;
};

export function moraineSvg(W, H, o = {}) {
  const X = (u) => u * W, Y = (v) => v * H, m = o.melt ?? 0, lit = o.lit;
  const end = lerp(.8, .36, clamp(m));
  const left = [[.04, -.02], [.1, .16], [.27, .34], [.32, .55], [.33, .8]], right = [[.96, -.02], [.9, .16], [.73, .34], [.68, .55], [.67, .8]];
  const L = (p) => p.map(([u, v]) => [X(u), Y(v)]);
  let b = svgRock([[-10, -10], [W + 10, -10], [W + 10, H + 10], [-10, H + 10]], { seed: 5, fill: 'rock', cracks: 8, grain: true });
  b += shape(L([[.24, .84], [.34, .92], [.5, .96], [.66, .92], [.76, .84], [.84, 1.02], [.16, 1.02]]), { f: 'grass' });
  b += shape(L([[.03, -.02], [.29, -.02], [.46, .2], [.5, .25], [.54, .2], [.71, -.02], [.97, -.02], [.9, .16], [.73, .34], [.68, .55], [.67, .82], [.33, .82], [.32, .55], [.27, .34], [.1, .16]]), { f: 'soil' });
  const ice = [[.05, -.02], [.27, -.02], [.47, .22], [.5, .27], [.53, .22], [.73, -.02], [.95, -.02], [.88, .16], [.71, .34], [.66, .55], [.64, end], [.5, end + .03], [.36, end], [.34, .55], [.29, .34], [.12, .16]];
  if (m < 1) b += `<g style="opacity:${m > .85 ? (1 - m) / .15 : 1}">${iceBody(L(ice), L([[.5, .3], [.5, end - .03]]), { spread: 2.4 })}${strand(L([[.16, .02], [.3, .16], [.42, .34], [.44, end - .04]]), 'iceLit', 2.6, { opacity: .7 })}${strand(L([[.84, .02], [.7, .16], [.58, .34], [.56, end - .04]]), 'iceLit', 2.6, { opacity: .7 })}</g>`;
  const river = [[.5, .94], [.52, 1.03]];
  if (o.lake) b += shape(oval(X(.5), Y(.68), X(.165), Y(.17), 22), { f: 'sea', s: 'seaDeep', w: 3 }) + strand([[X(.42), Y(.64)], [X(.58), Y(.64)]], 'foam', 3, { opacity: .8 }) + strand([[X(.45), Y(.72)], [X(.56), Y(.72)]], 'foam', 3, { opacity: .8 });
  b += strand(L(river), 'sea', 16);
  const band = (a, w) => strand(L(a), 'soilDark', w + 5) + strand(L(a), 'soil', w);
  b += `<g style="opacity:${lit && lit !== 'lat' ? .25 : 1}">${band(left.slice(1), 13)}${band(right.slice(1), 13)}</g>`;
  b += `<g style="opacity:${lit && lit !== 'med' ? .25 : 1}">${band([[.5, .27], [.5, .55], [.5, Math.min(end, .8)]], 11)}</g>`;
  b += stones(L(left.slice(1)), 2, 11, lit && lit !== 'lat') + stones(L(right.slice(1)), 5, 11, lit && lit !== 'lat');
  b += stones(L([[.5, .27], [.5, .55], [.5, Math.min(end, .8)]]), 3, 7 + Math.round((1 - m) * 3), lit && lit !== 'med');
  b += `<g style="opacity:${lit && lit !== 'ter' ? .25 : 1}">${strand(L([[.3, .8], [.4, .86], [.5, .88], [.6, .86], [.7, .8]]), 'soilDark', 24)}${strand(L([[.3, .8], [.4, .86], [.5, .88], [.6, .86], [.7, .8]]), 'soil', 18)}</g>`;
  b += stones(L([[.31, .81], [.4, .86], [.5, .88], [.6, .86], [.69, .81]]), 7, 15, lit && lit !== 'ter');
  return b;
}

export function mountainSvg(W, H, o = {}) {
  const X = (u) => u * W, Y = (v) => v * H, lit = o.lit, dim = (k) => (lit && lit !== k ? .28 : 1);
  const P = (a) => a.map(([u, v]) => [X(u), Y(v)]);
  let b = shape(P([[.62, .5], [.72, .36], [.8, .24], [.87, .34], [.96, .3], [1.04, .5], [1.04, .9], [.62, .9]]), { f: 'rockDark', curve: false });
  b += shape(P([[-.04, .84], [.04, .66], [.14, .52], [.26, .32], [.36, .12], [.42, .06], [.5, .16], [.58, .34], [.66, .5], [.7, .55], [.76, .47], [.84, .58], [1.04, .72], [1.04, 1.04], [-.04, 1.04]]), { f: 'rock', s: 'rockDeep', w: 2.5, curve: false });
  // shaded right faces
  b += shape(P([[.42, .06], [.5, .16], [.58, .34], [.66, .5], [.6, .68], [.5, .46]]), { f: 'rockDark', curve: false });
  // snow
  b += `<g style="opacity:${dim('arete')}">${svgSnow(P([[.42, .06], [.47, .13], [.44, .17], [.41, .14], [.38, .19], [.35, .15]]), { seed: 3 })}</g>`;
  // a second hollow on the far side of the ridge, so the ridge has rock cut from both sides
  b += `<g style="opacity:${dim('cirque')}">${shape(P([[.03, .74], [.05, .6], [.12, .55], [.2, .62], [.21, .74]]), { f: 'rockDeep' })}${shape(P([[.04, .76], [.08, .68], [.13, .66], [.19, .69], [.2, .76]]), { f: 'iceBody', s: 'iceCrack', w: 2 })}</g>`;
  // cirque: a steep back wall curving round a floor of ice that spills out over the lip
  const bowl = P([[.25, .68], [.26, .52], [.31, .38], [.4, .29], [.48, .31], [.56, .42], [.6, .55], [.61, .68], [.5, .73], [.36, .73]]);
  b += `<g style="opacity:${dim('cirque')}">${shape(bowl, { f: 'rockDeep', s: lit === 'cirque' ? 'gold' : 'rockDeep', w: lit === 'cirque' ? 6 : 3 })}`;
  for (const [a0, c0, a1, c1] of [[.31, .4, .33, .54], [.38, .33, .39, .5], [.47, .34, .46, .5], [.54, .43, .52, .54]]) b += strand(P([[a0, c0], [a1, c1]]), 'rockDark', 4);
  b += iceBody(P([[.27, .7], [.29, .58], [.37, .52], [.46, .51], [.55, .56], [.59, .68], [.54, .76], [.49, .84], [.41, .84], [.35, .74]]), P([[.43, .54], [.44, .66], [.45, .8]]), { spread: 1.3 });
  b += '</g>';
  // arete: the sharp ridge between the two hollows
  b += `<g style="opacity:${dim('arete')}">${strand(P([[.42, .06], [.36, .12], [.28, .3], [.22, .46], [.2, .6]]), lit === 'arete' ? 'gold' : 'snowShade', lit === 'arete' ? 8 : 5)}</g>`;
  // pass: the low notch
  b += `<g style="opacity:${dim('pass')}">${strand(P([[.63, .47], [.7, .55], [.76, .47]]), lit === 'pass' ? 'gold' : 'snowShade', lit === 'pass' ? 8 : 4)}</g>`;
  b += shape(P([[-.04, .86], [.2, .74], [.42, .8], [.66, .72], [.86, .74], [1.04, .8], [1.04, 1.04], [-.04, 1.04]]), { f: 'grass', s: 'grassDark', w: 2.5 });
  b += svgGrass(X(.02), Y(.86), X(.96), Y(.8), { seed: 3, n: 18, tall: 12 });
  return b;
}
export const MOUNT = { cirque: [.43, .62], arete: [.26, .36], pass: [.7, .55] };
