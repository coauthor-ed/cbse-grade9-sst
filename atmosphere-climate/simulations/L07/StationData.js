// StationData - the book's Table 3.3, exactly as printed, plus the climate graph drawing the station
// scenes share. Helper, not a scene. "-" in the table is 0 here. Totals are the printed yearly totals.
// Two printed temperatures look odd and are kept as printed: Delhi June 33.3 (the book's own graph
// plots about 30.4) and Jodhpur September 20.1 (between 29.0 and 27.0).
export const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const STATIONS = [
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', lat: "8°29' N", latDeg: 8.483, alt: 61, ll: [76.95, 8.5], total: 181.2,
    temp: [26.7, 27.3, 28.3, 28.7, 28.6, 26.6, 26.2, 26.2, 26.5, 26.7, 26.6, 26.5], rain: [2.3, 2.1, 3.7, 10.6, 20.8, 35.6, 22.3, 14.6, 13.8, 27.3, 20.6, 7.5] },
  { id: 'bengaluru', name: 'Bengaluru', lat: "12°58' N", latDeg: 12.967, alt: 909, ll: [77.6, 12.97], total: 88.9,
    temp: [20.5, 22.7, 25.2, 27.1, 26.7, 24.2, 23.0, 23.0, 23.1, 22.9, 18.9, 20.2], rain: [0.7, 0.9, 1.1, 4.5, 10.7, 7.1, 11.1, 13.7, 16.4, 15.3, 6.1, 1.3] },
  { id: 'chennai', name: 'Chennai', lat: "13°4' N", latDeg: 13.067, alt: 7, ll: [80.27, 13.08], total: 128.6,
    temp: [24.5, 25.7, 27.7, 30.4, 33.0, 32.5, 31.0, 30.2, 29.8, 28.0, 25.9, 24.7], rain: [4.6, 1.3, 1.3, 1.8, 3.8, 4.5, 8.7, 11.3, 11.9, 30.6, 35.0, 13.9] },
  { id: 'mumbai', name: 'Mumbai', lat: '19° N', latDeg: 19, alt: 11, ll: [72.88, 19.07], total: 183.4,
    temp: [24.4, 24.4, 26.7, 28.3, 30.0, 28.9, 27.2, 27.2, 27.2, 27.8, 27.2, 25.0], rain: [0.2, 0.2, 0, 0, 1.8, 50.6, 61.0, 36.9, 26.9, 4.8, 1.0, 0] },
  { id: 'nagpur', name: 'Nagpur', lat: "21°9' N", latDeg: 21.15, alt: 312, ll: [79.08, 21.15], total: 124.2,
    temp: [21.5, 23.9, 28.3, 32.7, 35.5, 32.0, 27.7, 27.3, 27.9, 26.7, 23.1, 20.7], rain: [1.1, 2.3, 1.7, 1.6, 2.1, 22.2, 37.6, 28.6, 18.5, 5.5, 2.0, 1.0] },
  { id: 'kolkata', name: 'Kolkata', lat: "22°34' N", latDeg: 22.567, alt: 6, ll: [88.36, 22.57], total: 162.5,
    temp: [19.6, 22.0, 27.1, 30.1, 30.4, 29.9, 28.9, 28.7, 28.9, 27.6, 23.4, 19.7], rain: [1.2, 2.8, 3.4, 5.1, 13.4, 29.0, 33.1, 33.4, 25.3, 12.7, 2.7, 0.4] },
  { id: 'shillong', name: 'Shillong', lat: "24°34' N", latDeg: 24.567, alt: 1461, ll: [91.88, 25.57], total: 225.3,
    temp: [9.8, 11.3, 15.9, 18.5, 19.2, 20.5, 21.1, 20.9, 20.0, 17.2, 13.3, 10.4], rain: [1.4, 2.9, 5.6, 14.6, 29.5, 47.6, 35.9, 34.3, 30.2, 18.8, 3.8, 0.6] },
  { id: 'jodhpur', name: 'Jodhpur', lat: "26°18' N", latDeg: 26.3, alt: 224, ll: [73.02, 26.3], total: 36.6,
    temp: [16.8, 19.2, 26.6, 29.8, 33.3, 33.9, 31.3, 29.0, 20.1, 27.0, 20.1, 14.9], rain: [0.5, 0.6, 0.3, 0.3, 1.0, 3.1, 10.8, 13.1, 5.7, 0.8, 0.2, 0.2] },
  { id: 'delhi', name: 'Delhi', lat: '29° N', latDeg: 29, alt: 219, ll: [77.2, 28.6], total: 67.0,
    temp: [14.4, 16.7, 23.3, 30.0, 33.3, 33.3, 30.0, 29.4, 28.9, 25.6, 19.4, 15.6], rain: [2.5, 1.5, 1.3, 1.0, 1.8, 7.4, 19.3, 17.8, 11.9, 1.3, 0.2, 1.0] },
  { id: 'leh', name: 'Leh', lat: '34° N', latDeg: 34, alt: 3506, ll: [77.58, 34.17], total: 8.5,
    temp: [-8.5, -7.2, -0.6, 6.1, 10.0, 14.4, 17.2, 16.1, 12.2, 6.1, 0.0, -5.6], rain: [1.0, 0.8, 0.8, 0.5, 0.5, 0.5, 1.3, 1.3, 0.8, 0.5, 0, 0.5] },
];
export const stationOf = (id) => STATIONS.find((s) => s.id === id);

const BAR = 'var(--sim-series-1)', LINE = 'var(--sim-series-6)';
const num = (x, y, s, a) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${a}" style="font:700 14px var(--sim-font);fill:var(--sim-label-muted)">${s}</text>`;

/**
 * A climate graph as SVG. box { x, y, w, h }; o: tMin, tMax, rMax (scales); lit: month indexes drawn
 * full strength (others dim); showBars, showLine; scales false hides the axis numbers; grow animates.
 * Temperature on the left, rain on the right, as in the book's Fig. 3.14.
 */
export function climoSvg(s, box, o = {}) {
  const { x, y, w, h } = box, tMin = o.tMin ?? 0, tMax = o.tMax ?? 35, rMax = o.rMax ?? 20, pad = o.scales === false ? 6 : 34, foot = 20;
  const px = x + pad, pw = w - pad * 2, py = y + 8, ph = h - foot - 8, cw = pw / 12;
  const ty = (t) => py + ph - ((t - tMin) / (tMax - tMin)) * ph, ry = (r) => py + ph - (r / rMax) * ph;
  const lit = o.lit, dim = (i) => (lit && !lit.includes(i) ? 0.3 : 1);
  let out = `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="8" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:2"/>`;
  const steps = o.tStep ?? 10;
  for (let t = Math.ceil(tMin / steps) * steps; t <= tMax; t += steps) {
    const yy = ty(t);
    out += `<line x1="${px}" x2="${px + pw}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" style="stroke:var(--sim-track);stroke-width:2"/>`;
    if (o.scales !== false) out += num(px - 5, yy + 5, String(t), 'end');
  }
  if (o.scales !== false) for (let r = 0; r <= rMax; r += o.rStep ?? 5) out += num(px + pw + 5, ry(r) + 5, String(r), 'start');
  if (o.showBars !== false) {
    s.rain.forEach((r, i) => {
      const yy = ry(Math.min(r, rMax)), bh = Math.max(py + ph - yy, r > 0 ? 2 : 0);
      out += `<rect class="${o.grow ? 'sv-grow' : ''}" x="${(px + i * cw + cw * 0.14).toFixed(1)}" y="${(py + ph - bh).toFixed(1)}" width="${(cw * 0.72).toFixed(1)}" height="${bh.toFixed(1)}" rx="3" style="fill:${BAR};opacity:${dim(i)};--d:${(i * 0.03).toFixed(2)}s"/>`;
    });
  }
  if (o.showLine !== false) {
    const pts = s.temp.map((t, i) => [px + (i + 0.5) * cw, ty(t)]);
    out += `<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')}" style="fill:none;stroke:${LINE};stroke-width:3.5;stroke-linejoin:round;stroke-linecap:round"/>`;
    pts.forEach((p, i) => { out += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${lit && lit.includes(i) ? 5.5 : 3.5}" style="fill:${LINE};stroke:var(--sim-bg-surface);stroke-width:1.5;opacity:${dim(i) === 1 ? 1 : 0.6}"/>`; });
  }
  MONTHS.forEach((m, i) => { out += `<text x="${(px + (i + 0.5) * cw).toFixed(1)}" y="${y + h - 4}" text-anchor="middle" style="font:700 14px var(--sim-font);fill:var(--sim-label-muted);opacity:${dim(i)}">${m}</text>`; });
  return out;
}
export const CLIMO_KEY = `<span style="color:var(--sim-series-6)">line</span> temperature, °C &nbsp; <span style="color:var(--sim-series-1)">bars</span> rain, cm`;
