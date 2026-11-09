// StockModel - one made-up fish stock: it grows 30% a year, then the catch comes out; below the breeding line it
// no longer grows. The numbers every stock scene and game share, in thousands of fish, and one chart of them.
//   stepYear(stock, catch) -> { stock, took }        runYears(start, catch, years) -> { stocks: [..], took: [..] }
//   svgStockChart(box, { lines: [{ vals, col, w }], bars: [..], years, yMax, line }) -> svg
import { tx, num, MUTED } from '../L08/SeaDraw.js';

export const START = 100, GROWTH = 0.3, BREED_LINE = 20;

export function stepYear(stock, take) {
  const grown = stock < BREED_LINE ? stock : stock * (1 + GROWTH);
  const took = Math.min(grown, take);
  return { stock: Math.round((grown - took) * 10) / 10, took: Math.round(took * 10) / 10, grown: Math.round(grown * 10) / 10 };
}
export function runYears(start, take, years) {
  const stocks = [start], took = [];
  let s = start;
  for (let i = 0; i < years; i++) { const r = stepYear(s, take); s = r.stock; stocks.push(s); took.push(r.took); }
  return { stocks, took };
}
/** box {x,y,w,h}. o: lines [{ vals, col, w }], bars [numbers per year], years, yMax, ticks, barCol, barLabels */
export function svgStockChart(box, o) {
  const { x, y, w, h } = box, years = o.years, yMax = o.yMax ?? 140;
  const X = (i) => x + (i / years) * w, Y = (v) => y + h - (Math.min(v, yMax) / yMax) * h;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:2"/>`;
  for (const v of o.ticks ?? [50, 100]) s += `<path d="M${x} ${num(Y(v))}H${x + w}" style="stroke:var(--sim-track);stroke-width:2"/>` + tx(x - 6, Y(v) + 5, String(v), { size: 15, anchor: 'end', col: MUTED });
  s += tx(x - 6, y + h + 5, '0', { size: 15, anchor: 'end', col: MUTED });
  if (o.bars) {
    const bw = (w / years) * 0.62;
    o.bars.forEach((v, i) => {
      const bx = X(i + 0.5) - bw / 2, by = Y(v);
      s += `<rect x="${num(bx)}" y="${num(by)}" width="${num(bw)}" height="${num(y + h - by)}" rx="3" style="fill:${o.barCol ?? 'var(--sim-series-2)'};stroke:var(--sim-label);stroke-width:1.5"/>`;
      if (o.barLabels) s += tx(X(i + 0.5), Math.max(y + 14, by - 5), String(Math.round(v)), { size: 15 });
    });
  }
  const yb = Y(BREED_LINE);
  s += `<path d="M${x} ${num(yb)}H${x + w}" style="stroke:var(--sim-error);stroke-width:3;stroke-dasharray:9 6"/>`;
  for (const l of o.lines ?? []) {
    const d = l.vals.map((v, i) => `${i ? 'L' : 'M'}${num(X(i))} ${num(Y(v))}`).join('');
    s += `<path d="${d}" style="fill:none;stroke:var(--sim-bg-surface);stroke-width:${(l.w ?? 5) + 3};stroke-linejoin:round;stroke-linecap:round"/><path d="${d}" style="fill:none;stroke:${l.col};stroke-width:${l.w ?? 5};stroke-linejoin:round;stroke-linecap:round"/>`;
    l.vals.forEach((v, i) => { s += `<circle cx="${num(X(i))}" cy="${num(Y(v))}" r="5" style="fill:${l.col};stroke:var(--sim-bg-surface);stroke-width:2"/>`; });
  }
  for (let i = 0; i <= years; i += (o.xStep ?? 1)) s += tx(X(i), y + h + 20, String(i), { size: 15, col: MUTED });
  return s;
}
