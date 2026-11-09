/**
 * MaritimeZones.js - the numbers and rights the sea-zone scenes share. Data only, no drawing.
 * 1 nautical mile = 1,852 metres; every kilometre reading comes from km() below, never a hand-typed table.
 */

export const NM_TO_KM = 1.852;

/** The three sea distances the lesson measures from the baseline, in nautical miles. */
export const TERRITORIAL_NM = 12;
export const CONTIGUOUS_NM = 24;
export const EEZ_NM = 200;
export const HIGH_SEAS_LIMIT_NM = 200;

/** A nautical-mile figure rewritten in kilometres, from the one factor. */
export const km = (nm) => Math.round(nm * NM_TO_KM * 10) / 10;

/** The three subjects a coastal state may make laws about inside the territorial sea. */
export const TERRITORIAL_LAWS = ['Customs', 'Immigration', 'Pollution'];

/** The contiguous zone: limited control over these three. */
export const CONTIGUOUS_RIGHTS = ['customs', 'fiscal matters', 'illegal immigration'];

/** The exclusive economic zone: special rights over these resources; the water is not fully owned. */
export const EEZ_RIGHTS = ['Fish', 'Oil', 'Gas'];

/** The six equal rights of all countries on the high seas. */
export const HIGH_SEAS_RIGHTS = ['Navigation', 'Fishing', 'Flying over', 'Laying undersea cables', 'Lawful structures', 'Exploring for minerals'];

/** The share of the world's oceans the high seas cover, per cent. */
export const HIGH_SEAS_SHARE_PCT = 64;

/** The three bands, in nautical miles from the baseline. */
export const BANDS = [
  { id: 'territorial', label: 'territorial sea', from: 0, to: TERRITORIAL_NM },
  { id: 'contiguous', label: 'contiguous zone', from: TERRITORIAL_NM, to: CONTIGUOUS_NM },
  { id: 'eez', label: 'exclusive economic zone', from: CONTIGUOUS_NM, to: EEZ_NM },
];

/** The band a distance from the baseline falls in. 18 NM reads as the contiguous zone, which lies inside the EEZ. */
export function bandAt(nm) {
  if (nm <= TERRITORIAL_NM) return BANDS[0];
  if (nm <= CONTIGUOUS_NM) return BANDS[1];
  if (nm <= EEZ_NM) return BANDS[2];
  return { id: 'high', label: 'high seas', from: EEZ_NM, to: Infinity };
}
