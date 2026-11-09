// ZoneSection - a side section of a coast and its sea zones, in the order of a cut from land to open sea: land with a
// lighthouse, baseline, 12, 24 and 200 nautical mile lines, the shelf running out under them to its margin. Not to
// scale, and it says so. General: any coast. Text and tags that a beat needs come from the scene.
//   zoneGeom(W, H, o) -> { seaY, floorY, X(nm), baseX, x12, x24, x200, marginX, port }
//   zoneArt(g, W, H, o) -> svg   o.t waves, o.lines (draw limit lines), o.lit: map of band id -> true, o.bands (tint)
import { sea, svgSeaColumn, svgWaveLine, svgStrata, svgSandBed, svgLighthouse, svgPalm, svgCloud, skyRect, tx, num } from './SeaDraw.js';

export const BAND_TONE = { territorial: 'var(--sim-series-2)', contiguous: 'var(--sim-series-5)', eez: 'var(--sim-series-3)' };

export function zoneGeom(W, H, o = {}) {
  const port = W < 460;
  const seaY = o.seaY ?? H * 0.36, floorY = seaY + (H - seaY) * 0.56;
  const baseX = port ? 52 : 118, x12 = port ? 118 : 226, x24 = port ? 184 : 332, x200 = W - (port ? 56 : 112), marginX = W - (port ? 24 : 46);
  // A broken scale: each stretch has its own width. Never read a distance off this.
  const X = (nm) => (nm <= 12 ? baseX + (nm / 12) * (x12 - baseX) : nm <= 24 ? x12 + ((nm - 12) / 12) * (x24 - x12) : nm <= 200 ? x24 + ((nm - 24) / 176) * (x200 - x24) : x200 + ((nm - 200) / 100) * (W - x200));
  return { seaY, floorY, X, baseX, x12, x24, x200, marginX, port, W, H };
}

export function zoneArt(g, W, H, o = {}) {
  const { seaY, floorY, baseX, marginX, port } = g, t = o.t ?? 0;
  const ground = `M${-4} ${num(seaY - 56)}Q${num(baseX * 0.5)} ${num(seaY - 62)} ${num(baseX * 0.72)} ${num(seaY - 20)}L${baseX} ${num(seaY + 12)}Q${num(baseX + 34)} ${num(floorY - 26)} ${num(baseX + 90)} ${num(floorY)}L${num(marginX)} ${num(floorY + 8)}Q${num(marginX + 12)} ${num(floorY + 34)} ${W + 4} ${num(floorY + 70)}L${W + 4} ${H + 4}L-4 ${H + 4}Z`;
  const id = `zs-${Math.round(W)}x${Math.round(H)}`;
  let s = skyRect(`${id}-s`, 0, 0, W, seaY + 4, 0, 5);
  s += svgCloud(W * 0.5, seaY * 0.32, port ? 0.42 : 0.6, { seed: 3 });
  s += `<g transform="translate(0 ${num(seaY)})">${svgSeaColumn(0, 0, 1, { w: W, h: H - seaY, t, wave: 3 })}</g>`;
  if (o.bands) {
    // The EEZ starts where the territorial sea ends, so the contiguous zone lies inside it: it is drawn first.
    const edges = { eez: [g.x12, g.x200], territorial: [g.baseX, g.x12], contiguous: [g.x12, g.x24] };
    for (const k of Object.keys(edges)) {
      const [a, b] = edges[k], on = o.bands === true || o.bands[k];
      if (on) s += `<rect x="${num(a)}" y="${num(seaY + 3)}" width="${num(b - a)}" height="${num(floorY - seaY)}" style="fill:color-mix(in oklab, ${BAND_TONE[k]} 62%, ${sea('cloud')});opacity:0.62"/>`;
    }
  }
  s += `<defs><clipPath id="${id}-g"><path d="${ground}"/></clipPath></defs>`;
  s += `<g clip-path="url(#${id}-g)">${svgSandBed(0, seaY - 70, 1, { w: W + 8, h: H - seaY + 80, seed: 6 })}<g transform="translate(0 ${num(floorY + 26)})">${svgStrata(0, 0, 1, { w: W + 8, h: H - floorY, bands: 3, seed: 5 })}</g></g>`;
  s += `<path d="${ground}" style="fill:none;stroke:${sea('rockDark')};stroke-width:3"/>`;
  s += `<g transform="translate(0 ${num(seaY)})">${svgWaveLine(0, 0, 1, { w: W, amp: 3, t })}</g>`;
  s += svgPalm(baseX * (port ? 0.62 : 0.28), seaY - 50, port ? 0.42 : 0.62, { t });
  s += svgLighthouse(baseX * (port ? 0.26 : 0.56), seaY - 54, port ? 0.46 : 0.68, { lit: false });
  return s;
}
/** The tag every section carries. */
export const notScale = (W, H) => tx(W - 10, H - 12, 'Indicative only, not to scale', { anchor: 'end', size: 15, col: sea('cloud'), halo: sea('ink'), haloW: 3 });
