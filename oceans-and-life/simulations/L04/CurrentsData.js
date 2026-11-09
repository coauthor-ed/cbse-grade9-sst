/**
 * CurrentsData.js - the ONE current field for the currents lesson. Data only: no drawing, no kit imports.
 *
 * Read off the book's map of major ocean currents (pdf page 9, crops seen at 170 and 400 dpi). Colours are
 * the book's: red warm, blue cold. Alaska C is red there. Paths run downstream, so the head sits at the end.
 * Directions follow the book's arrows: West Wind Drift and North Pacific Drift run east; the equatorial
 * currents run west, the counter currents east. Near India: the Arabian Sea arrow curves east then
 * south-east, the Bay of Bengal arrow runs north-east, both red. Coordinates are [lon, lat].
 */
export const WARM = 'warm';
export const COLD = 'cold';

/** id, name (the book's), short (map label), kind, paths: [{ pts, label }] */
export const CURRENTS = [
  // warm, red
  { id: 'gulf-stream', name: 'Gulf Stream', short: 'Gulf Stream', kind: WARM, paths: [{ pts: [[-88, 24.5], [-81, 26], [-76, 31], [-68, 36], [-56, 40], [-44, 45], [-34, 49]], label: [-58, 35] }] },
  { id: 'north-atlantic-drift', name: 'North Atlantic Drift', short: 'North Atlantic Drift', kind: WARM, paths: [{ pts: [[-34, 49], [-22, 54], [-11, 60], [1, 64], [13, 69.5]], label: [-14, 53] }] },
  { id: 'north-equatorial-current', name: 'North Equatorial Current', short: 'N. Equatorial', kind: WARM, paths: [
    { pts: [[-19, 13], [-36, 11], [-52, 12], [-66, 15], [-78, 17], [-85, 20]], label: [-38, 7] },
    { pts: [[-100, 13], [-125, 12], [-150, 11], [-178, 11]], label: [-135, 16] },
    { pts: [[178, 11], [160, 12], [145, 13], [128, 15]], label: [150, 17] },
    { pts: [[67, 4], [57, 4], [49, 4]], label: [58, 7] },
  ] },
  { id: 'equatorial-counter-current', name: 'Equatorial Counter Current', short: 'Eq. Counter', kind: WARM, paths: [
    { pts: [[-38, 3], [-24, 3], [-9, 3]], label: [-24, 0] },
    { pts: [[-178, 5], [-150, 5], [-120, 5], [-95, 4]], label: [-138, 1] },
    { pts: [[140, 5], [158, 5], [176, 5]], label: [158, 2] },
    { pts: [[49, -2.5], [57, -2.5], [66, -2.5]], label: [60, -5] },
    { pts: [[103, -10], [112, -11], [122, -13]], label: [112, -8] },
  ] },
  { id: 'south-equatorial-current', name: 'South Equatorial Current', short: 'S. Equatorial', kind: WARM, paths: [
    { pts: [[7, -10], [-10, -9], [-30, -9]], label: [-12, -13] },
    { pts: [[-85, -8], [-105, -12], [-125, -15], [-150, -16], [-178, -15]], label: [-128, -19] },
    { pts: [[178, -15], [165, -15], [150, -14]], label: [160, -18] },
    { pts: [[73, -13], [68, -13], [62, -13]], label: [70, -17] },
    { pts: [[111, -25], [106, -19], [103, -14]], label: [100, -24] },
  ] },
  { id: 'brazilian-current', name: 'Brazilian Current', short: 'Brazilian', kind: WARM, paths: [{ pts: [[-33, -12], [-36, -16], [-40, -22], [-45, -28], [-50, -34], [-54, -38]], label: [-33, -27] }] },
  { id: 'agulhas-current', name: 'Agulhas Current', short: 'Agulhas', kind: WARM, paths: [{ pts: [[40, -26], [36, -31], [31, -36]], label: [44, -32] }] },
  { id: 'kuroshio', name: 'Kuroshio', short: 'Kuroshio', kind: WARM, paths: [{ pts: [[124, 20], [127, 25], [131, 29], [136, 32], [141, 35], [146, 37]], label: [128, 33] }] },
  { id: 'north-pacific-drift', name: 'North Pacific Drift', short: 'N. Pacific Drift', kind: WARM, paths: [
    { pts: [[147, 38], [160, 42], [178, 44]], label: [162, 47] },
    { pts: [[-178, 44], [-150, 44], [-128, 43]], label: [-152, 40] },
  ] },
  { id: 'alaska-current', name: 'Alaska Current', short: 'Alaska', kind: WARM, paths: [{ pts: [[-128, 49], [-135, 54], [-141, 58], [-147, 59.5]], label: [-146, 53] }] },
  // cold, blue
  { id: 'labrador-current', name: 'Labrador Current', short: 'Labrador', kind: COLD, paths: [{ pts: [[-61, 63], [-58, 58], [-54, 53], [-51.5, 49.5], [-51, 46.5]], label: [-47, 56] }] },
  { id: 'canary-current', name: 'Canaries Current', short: 'Canaries', kind: COLD, paths: [{ pts: [[-11, 36], [-15, 30], [-18, 24], [-21, 18]], label: [-28, 27] }] },
  { id: 'falkland-current', name: 'Falkland Current', short: 'Falkland', kind: COLD, paths: [{ pts: [[-65, -54], [-61, -48], [-58, -43], [-55, -39]], label: [-52, -47] }] },
  { id: 'benguela-current', name: 'Benguela Current', short: 'Benguela', kind: COLD, paths: [{ pts: [[13, -35], [11, -28], [9, -21], [9, -14]], label: [2, -25] }] },
  { id: 'west-wind-drift', name: 'West Wind Drift', short: 'West Wind Drift', kind: COLD, paths: [
    { pts: [[-178, -50], [-140, -53], [-100, -52]], label: [-140, -48] },
    { pts: [[-52, -52], [-20, -51], [10, -50]], label: [-20, -47] },
    { pts: [[20, -52], [60, -50], [100, -48]], label: [60, -46] },
    { pts: [[110, -50], [145, -50], [178, -50]], label: [145, -46] },
  ] },
  { id: 'west-australian-current', name: 'West Australian Current', short: 'West Australian', kind: COLD, paths: [{ pts: [[110, -44], [107, -36], [108, -29], [110, -24]], label: [98, -33] }] },
  { id: 'oyashio', name: 'Oyashio Current', short: 'Oyashio', kind: COLD, paths: [{ pts: [[160, 54], [155, 49], [149, 44], [146, 39.5]], label: [158, 46] }] },
  { id: 'california-current', name: 'California Current', short: 'California', kind: COLD, paths: [{ pts: [[-127, 45], [-125, 40], [-122, 34], [-117, 28]], label: [-134, 33] }] },
  { id: 'peru-current', name: 'Humboldt (Peru) Current', short: 'Humboldt (Peru)', kind: COLD, paths: [{ pts: [[-75, -42], [-75, -35], [-74, -27], [-75, -20], [-80, -12], [-83, -5]], label: [-90, -26] }] },
];

/** The two warm arrows near India. The book names neither. */
export const INDIA_ARROWS = [
  { id: 'india-arabian', name: 'Arabian Sea arrow', short: 'Arabian Sea', kind: WARM, paths: [{ pts: [[54.5, 14], [58, 16.5], [61, 17.5], [65, 15.5], [69, 11.5]], label: [60, 21] }] },
  { id: 'india-bengal', name: 'Bay of Bengal arrow', short: 'Bay of Bengal', kind: WARM, paths: [{ pts: [[84, 9], [85.5, 13], [89, 18]], label: [93, 12] }] },
];

/** Every arrow the map draws, named and unnamed, one entry per drawn arrow. */
export function allArrows() {
  const out = [];
  for (const c of CURRENTS) for (const p of c.paths) out.push({ current: c, path: p });
  for (const c of INDIA_ARROWS) for (const p of c.paths) out.push({ current: c, path: p });
  return out;
}

/** A current by id, named or near India. */
export function currentById(id) {
  return CURRENTS.find((c) => c.id === id) || INDIA_ARROWS.find((c) => c.id === id) || null;
}
