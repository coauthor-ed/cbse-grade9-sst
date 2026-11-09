/**
 * RecognitionRules.js - the lesson's one rule table, written by
 * CriteriaBoardScene and imported by RecognitionDeskScene.
 *
 * Everything both scenes print about recognition lives here: the two route
 * arrays (3 national, 5 state), the two RUPP lines, the `11 of 543` gloss, the
 * 25-seat delimitation rule and the two desk files' figures. The board applies
 * them and the game is won by them, so they must never be written twice: a
 * threshold typed into a scene file is a threshold the two scenes can disagree
 * about.
 *
 * Every number here is the chapter's own (FIGURES.md Fig. 7.12 and blk-l07-s03
 * prose). Nothing is modelled and nothing is invented except the two files'
 * figures, which the lesson invented in s01.
 *
 * A RECORD is a plain object. Every field is optional; a route half whose
 * figure the record does not carry reads NOT RECORDED rather than inventing or
 * borrowing one (the slide's named failure is borrowing a number from the
 * wrong column):
 *
 *   {
 *     pct,            // share of valid votes polled, as a whole record
 *     pctStates,      // [{ name, pct }] share of valid votes in each State
 *     lsSeats,        // Lok Sabha seats won, all States
 *     lsSeatStates,   // how many States those seats came from
 *     asPct,          // share of Assembly votes in the State concerned
 *     asSeats,        // Assembly seats won in the State concerned
 *     asTotal,        // Assembly seats in the State concerned
 *     lsPct,          // share of Lok Sabha votes from the State concerned
 *     lsInState,      // Lok Sabha seats won from the State concerned
 *     allotted,       // Lok Sabha seats allotted to the State
 *     statePartyStates // States where the party is already a State Party
 *   }
 */

// The phrase the whole lesson turns on. Printed above the national and the
// state lists and nowhere else.
export const ANY_ONE = 'ANY ONE CONDITION SHOULD BE FULFILLED';

// The Lok Sabha's total seats, and the chapter's own gloss on 2% of them.
export const LOK_SABHA_SEATS = 543;
export const SEAT_SHARE_SEATS = 11;

// One Lok Sabha seat for every 25 seats (or fraction) allotted to a State.
export const DELIMITATION_SEATS = 25;

/** '1 State' / '4 States' */
export function stateCount(n) {
  return `${n} State${n === 1 ? '' : 's'}`;
}

/**
 * The per-State vote shares, grouped and read out: "6.1% in 3 States, 7% in
 * 1 State" - ascending by share, so the smallest figure is named first.
 */
export function stateShareLine(states) {
  const byShare = new Map();
  for (const s of states) byShare.set(s.pct, (byShare.get(s.pct) || 0) + 1);
  return [...byShare.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([pct, n]) => `${pct}% in ${stateCount(n)}`)
    .join(', ');
}

// ---- the halves ------------------------------------------------------------
//
// A half is { label, test(record) }, and test returns { ok, got } where `got`
// is the figure that decided it - the failing one, or the one that carried it.
// A half that cannot be decided says so rather than guessing.

const NOT_RECORDED = 'not on this record';

function missing() {
  return { ok: false, got: NOT_RECORDED, recorded: false };
}

function miss(got) {
  return { ok: false, got, recorded: true };
}

function hit(got) {
  return { ok: true, got, recorded: true };
}

/** 6% (or any share) of valid votes polled in four or more States. */
function shareInStates(need, minStates) {
  return (rec) => {
    const states = rec.pctStates || [];
    if (!states.length) return missing();
    const over = states.filter((s) => s.pct >= need);
    if (over.length >= minStates) return hit(stateShareLine(over));
    return miss(stateShareLine(states.filter((s) => s.pct < need)) || stateShareLine(states));
  };
}

/** A bare seat count: got is the count itself, as the chapter prints it. */
function seatCount(value, need, stateName) {
  return (rec) => {
    const have = rec[value];
    if (have == null) return missing();
    return have >= need ? hit(String(have)) : miss(String(have));
  };
}

/** National route 2: 2% of the Lok Sabha's 543 seats, printed as 11 of 543. */
function seatShare() {
  return (rec) => {
    if (rec.lsSeats == null) return missing();
    const got = `${rec.lsSeats} of ${LOK_SABHA_SEATS}`;
    return rec.lsSeats >= SEAT_SHARE_SEATS ? hit(got) : miss(got);
  };
}

/** State route 3: 3% of the Assembly's seats, or three seats, whichever is more. */
function assemblySeatShare() {
  return (rec) => {
    if (rec.asTotal == null || rec.asSeats == null) return missing();
    const need = Math.max(Math.ceil((rec.asTotal * 3) / 100), 3);
    const got = `${rec.asSeats} of ${rec.asTotal} seats; ${need} needed`;
    return rec.asSeats >= need ? hit(got) : miss(got);
  };
}

/** State route 4: one seat per 25 seats (or fraction) allotted to the State. */
function allottedSeatShare() {
  return (rec) => {
    if (rec.allotted == null || rec.lsInState == null) return missing();
    const need = Math.ceil(rec.allotted / DELIMITATION_SEATS);
    const got = `${rec.lsInState} of ${need} needed; ${rec.allotted} allotted`;
    return rec.lsInState >= need ? hit(got) : miss(got);
  };
}

/** A percentage of the State's own votes, as one bare figure. */
function stateShare(value, need) {
  return (rec) => {
    const have = rec[value];
    if (have == null) return missing();
    return have >= need ? hit(`${have}%`) : miss(`${have}%`);
  };
}

/** Already recognised as a State Party, in how many States. */
function statePartyRecord() {
  return (rec) => {
    const n = rec.statePartyStates || 0;
    const got = n === 0 ? 'none' : stateCount(n);
    return n >= 4 ? hit(got) : miss(got);
  };
}

// ---- the routes ------------------------------------------------------------

/** National party: three routes, any one of them. */
export const NATIONAL_ROUTES = [
  {
    id: 'n1',
    no: 1,
    text: '6% of valid votes polled in 4 or more States, AND 4 Lok Sabha seats',
    pick: '6% in 4+ States, and 4 Lok Sabha seats',
    halves: [
      { label: '6% IN 4+ STATES', test: shareInStates(6, 4) },
      { label: '4 LOK SABHA SEATS', test: seatCount('lsSeats', 4) },
    ],
  },
  {
    id: 'n2',
    no: 2,
    text: `2% of Lok Sabha seats (${SEAT_SHARE_SEATS} of ${LOK_SABHA_SEATS}), candidates elected from at least 3 States`,
    pick: `2% of Lok Sabha seats, and 3+ States`,
    halves: [
      { label: '2% OF LOK SABHA SEATS', test: seatShare() },
      { label: '3+ STATES', test: seatCount('lsSeatStates', 3) },
    ],
  },
  {
    id: 'n3',
    no: 3,
    text: 'Recognised as a State Party in at least 4 States',
    pick: 'State Party in 4+ States',
    halves: [
      { label: 'STATE PARTY IN 4+ STATES', test: statePartyRecord() },
    ],
  },
];

/** State party: five routes, and the same one phrase. */
export const STATE_ROUTES = [
  {
    id: 's1',
    no: 1,
    text: '6% of Assembly votes, AND at least 2 Assembly seats',
    pick: '6% of Assembly votes, and 2 Assembly seats',
    halves: [
      { label: '6% OF ASSEMBLY VOTES', test: stateShare('asPct', 6) },
      { label: '2 ASSEMBLY SEATS', test: seatCount('asSeats', 2) },
    ],
  },
  {
    id: 's2',
    no: 2,
    text: '6% of Lok Sabha votes from the State, AND at least 1 Lok Sabha seat from it',
    pick: '6% of Lok Sabha votes from the State, and 1 seat from it',
    halves: [
      { label: '6% OF LOK SABHA VOTES FROM THE STATE', test: stateShare('lsPct', 6) },
      { label: '1 LOK SABHA SEAT FROM IT', test: seatCount('lsInState', 1) },
    ],
  },
  {
    id: 's3',
    no: 3,
    text: '3% of Assembly seats, or at least 3 seats, whichever is more',
    pick: '3% of Assembly seats, or 3 seats, whichever is more',
    halves: [
      { label: '3% OF ASSEMBLY SEATS, OR 3 SEATS', test: assemblySeatShare() },
    ],
  },
  {
    id: 's4',
    no: 4,
    text: 'At least 1 Lok Sabha seat for every 25 seats (or fraction) allotted to the State',
    pick: '1 Lok Sabha seat for every 25 allotted seats',
    tag: 'ALLOTTED BY DELIMITATION',
    halves: [
      { label: '1 LOK SABHA SEAT PER 25 ALLOTTED', test: allottedSeatShare() },
    ],
  },
  {
    id: 's5',
    no: 5,
    text: '8% of valid votes polled in the State',
    pick: '8% of valid votes polled in the State',
    halves: [
      { label: '8% OF VALID VOTES POLLED IN THE STATE', test: stateShare('asPct', 8) },
    ],
  },
];

/**
 * The third class, described by what a party has not done. Two unnumbered
 * lines and nothing to test: there is no figure a record could fail.
 */
export const RUPP_LINES = [
  'Has not secured enough percentage of votes in the Legislative Assembly or general elections',
  'Has never contested an election since registration',
];

export const RUPP_FULL_NAME = 'REGISTERED UNRECOGNISED POLITICAL PARTIES (RUPP)';

/** Every testable route, national first. */
export const ROUTES = [...NATIONAL_ROUTES, ...STATE_ROUTES];

export function routeById(id) {
  return ROUTES.find((r) => r.id === id) || null;
}

// ---- the two desk files (blk-l07-s01's two invented parties) --------------

export const BOARD_FILES = [
  {
    id: 'a',
    label: 'FILE A',
    pctLine: '5.8% of valid votes polled',
    seatsLine: '3 Lok Sabha seats from 1 State',
    record: {
      pct: 5.8,
      pctStates: [{ name: 'State 1', pct: 5.8 }],
      lsSeats: 3,
      lsSeatStates: 1,
      statePartyStates: 0,
    },
  },
  {
    id: 'b',
    label: 'FILE B',
    pctLine: '2% of valid votes polled',
    seatsLine: '12 Lok Sabha seats from 4 States',
    record: {
      pct: 2,
      lsSeats: 12,
      lsSeatStates: 4,
      statePartyStates: 0,
    },
  },
];

export function fileById(id) {
  return BOARD_FILES.find((f) => f.id === id) || null;
}

// ---- the one evaluation ---------------------------------------------------

/**
 * Work one route against one record. A route is met only when every half of it
 * is met; a half with no figure on the record is `recorded: false` and can
 * never carry the route. Every scene that shows a verdict goes through here,
 * which is what keeps the board and the game from drifting apart.
 */
export function met(record, condition) {
  const halves = condition.halves.map((half) => {
    const r = half.test(record);
    const recorded = r.recorded !== false;
    return {
      label: half.label,
      ok: recorded && !!r.ok,
      recorded,
      got: r.got,
      text: recorded ? `${half.label} - ${r.ok ? 'MET' : 'NOT MET'} (${r.got})` : `${half.label} - NOT RECORDED`,
    };
  });
  return { ok: halves.every((h) => h.ok), halves };
}

/** The routes of one class, for a select or a panel. */
export function routesOf(kind) {
  return kind === 'national' ? NATIONAL_ROUTES : kind === 'state' ? STATE_ROUTES : [];
}