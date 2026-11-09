// FairnessRules.js - the wording shared by L08's panels, so the desk, the
// road game and the arcade deck cannot disagree about what the chapter calls an
// instrument or a hole. Wording only: no scene, no base class, no rules of play.
//
// Two SEPARATE instrument lists live here on purpose and must never be merged:
//   DESK_INSTRUMENTS  the chapter's printed list on blk-l08-s03 - six names and
//                     nothing else, because the chapter ends that list with the
//                     open clause "and other measures". A seventh chip on the
//                     desk would fill the chapter's own open clause with an
//                     instrument the chapter does not print there.
//   GAME_INSTRUMENTS  the tray on blk-l08-s05 - those six in the game's own
//                     wording, plus THE RPA'S PROHIBITION, which the Money hole
//                     needs and the desk never shows.
//
// No table pairs a DESK situation with an instrument: the desk's read-out has
// to stay neutral, so the answer does not exist anywhere in this file for it.

/**
 * The drawer's six, in the chapter's printed order and in its own names
 * (blk-l08-s03.md). `label` is exactly what a chip on the desk prints.
 * `VVPAT` carries what it is - the printed slip the machine hands the voter -
 * because the term arrived glossed in L05; it is not expanded into an acronym
 * phrase the chapter does not print, and no paper-trail diagram belongs to it.
 * `Model Code of Conduct` is a name and nothing else: the chapter never lists
 * what is inside it, so nothing here may describe it.
 */
export const DESK_INSTRUMENTS = [
  { id: 'rpa1950', label: 'RPA 1950' },
  { id: 'rpa1951', label: 'RPA 1951' },
  { id: 'code', label: 'Model Code of Conduct' },
  { id: 'evm', label: 'EVM' },
  { id: 'vvpat', label: 'VVPAT (the printed slip)' },
  { id: 'awareness', label: 'Voters\u2019 awareness campaigns' },
];

/** The chapter's own open clause, printed as a caption and never as a chip. */
export const DESK_OTHER_MEASURES = 'AND OTHER MEASURES';

/**
 * The three failures on the desk, in the slide's own three bullets. These are
 * situations, not provisions: nothing here lists what would fix them.
 */
export const DESK_SITUATIONS = [
  'A candidate swayed by personal favours',
  'Votes not counted accurately',
  'A participant facing difficulty exercising the right to vote because of an accessibility issue',
];

/** The four holes on the road, in the game's own order. Money from round 3. */
export const HOLES = [
  { id: 'misinformation', label: 'Misinformation' },
  { id: 'fake-news', label: 'Fake News' },
  { id: 'intimidation', label: 'Intimidation' },
  { id: 'money', label: 'Money' },
];

/** The tray's seven, in the briefing slide's order (blk-l08-s04b.md). */
export const GAME_INSTRUMENTS = [
  { id: 'verify', label: 'VERIFY AGAINST OFFICIAL SOURCE' },
  { id: 'awareness', label: 'AWARENESS INTERVENTION' },
  { id: 'cigil', label: 'cVIGIL-STYLE REPORT + FLYING SQUAD' },
  { id: 'vvpat', label: 'VVPAT SLIP' },
  { id: 'offences', label: 'THE ELECTORAL OFFENCES' },
  { id: 'prohibition', label: 'THE RPA\u2019S PROHIBITION' },
  { id: 'action', label: 'THE COMMISSION\u2019S OWN ACTION' },
];

// Which instruments reach which hole, exactly as the briefing states it.
const REACHES = {
  misinformation: ['verify', 'awareness'],
  'fake-news': ['cigil', 'vvpat'],
  intimidation: ['offences', 'action'],
  money: ['prohibition', 'offences'],
};

/**
 * Does this instrument answer this hole? False for every pair the briefing does
 * not list - including the last round's hole inside the polling station, which
 * only the VVPAT slip reaches. Callers may pass a label instead of an id.
 */
export function reaches(instrument, hole) {
  const hid = typeof hole === 'string' ? hole : (hole && hole.id);
  const iid = typeof instrument === 'string' ? instrument : (instrument && instrument.id);
  const ids = REACHES[hid];
  return !!ids && ids.indexOf(iid) !== -1;
}

/** The instruments that reach a hole, as tray entries, in tray order. */
export function answersOf(hole) {
  const hid = typeof hole === 'string' ? hole : (hole && hole.id);
  return GAME_INSTRUMENTS.filter((i) => reaches(i, hid));
}

export function holeById(id) {
  return HOLES.find((h) => h.id === id) || null;
}

export function gameInstrumentById(id) {
  return GAME_INSTRUMENTS.find((i) => i.id === id) || null;
}
