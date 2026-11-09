// KutchCoast.js - shared coast data for the Kutch coast scenes of L05.
// One place for the five teaching villages, their heights, the coast's name and
// extent, so the map in the game and the section in the explainer scene are the
// same coast with the same villages. The source names no village on this coast,
// so the villages are lettered and their heights marked rather than given
// invented place names.

export const COAST_NAME = 'Kutch coast, Gujarat';    // the only place text either scene may show
export const EXTENT = [[69.3, 22.7], [70.0, 23.2]]; // the fitted box of the map: the Kutch coast

// The five villages, from the water inland: each is further from the sea and
// higher than the one before it.
export const VILLAGES = [
  { id: 'A', h: 0.8, lon: 69.36, lat: 22.88 },
  { id: 'B', h: 2.4, lon: 69.50, lat: 22.93 },
  { id: 'C', h: 3.6, lon: 69.62, lat: 22.99 },
  { id: 'D', h: 4.5, lon: 69.74, lat: 23.06 },
  { id: 'E', h: 6.0, lon: 69.86, lat: 23.14 },
];

// Four places on the shore where the buses wait, west to east.
export const SHORE = [
  [69.33, 22.86], [69.45, 22.86], [69.57, 22.86], [69.69, 22.86],
];

// The forecast ladder of the game: the surge in force, and the buses that come
// with it. Only rises, and only three updates.
export const FORECASTS = [
  { surge: 1.8, buses: 2 },
  { surge: 2.9, buses: 1 },
  { surge: 3.8, buses: 1 },
];

export function villageById(id) {
  return VILLAGES.find((v) => v.id === id) || null;
}

// A village is reached when the water stands above its height.
export function reachedVillages(surge) {
  return VILLAGES.filter((v) => v.h < surge).map((v) => v.id);
}

// The teaching profile of the coast in section: [distance from the offshore
// edge in metres, height above sea level in metres]. The sea floor rises in
// low steps to flat land that climbs inland, and it passes exactly through the
// height of each village, so the drawing and the numbers are one thing.
export const PROFILE = [
  [0, -8.0], [60, -7.0], [110, -5.0], [150, -3.2], [175, -1.6], [195, -0.6],
  [210, 0.0], [230, 0.4], [250, 0.8], [300, 1.5], [340, 2.0], [380, 2.4],
  [420, 3.0], [450, 3.6], [500, 4.5], [545, 5.2], [580, 6.0], [620, 6.6],
  [660, 7.2], [700, 8.0],
];

// Where each village stands along that section, in metres from the offshore edge.
export const SECTION_AT = { A: 250, B: 380, C: 450, D: 500, E: 580 };
