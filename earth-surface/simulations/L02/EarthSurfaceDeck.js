// Earth-surface arcade decks (chapter 2, "Shaping of the Earth's Surface").
//
// A deck is plain data: groups, items, and the one-line `why` the why card
// shows after a mix-up. Every `why` is evidence - what a learner can see or
// reason to - never a restatement of the group name and never a place-name
// fact. `myth: true` marks an item learners commonly get wrong, so the boss
// round can draw it.
//
// One export per game, each in its own block with a header naming the lesson
// and the stub that owns it. A later game ADDS its own export at the end of
// this file; it edits nothing above its own block. Do not reorder, do not
// merge, do not move an existing export.
//
// This file is not a general shared helper: only the chapter's `ArcadeSort`
// slides import it. No canvas `SimScene` and no `withChallenge` game may.

// ---------------------------------------------------------------------------
// L02 - BoundarySortScene.stub.md (blk-l02-a01, the "Boundary Sorter" slide).
// Three ways two plates can meet. Taught by L02 s02, s03, s05.
// Every item is settled by the direction the two sides move relative to each
// other - together, apart, or sideways - and by nothing else.
// ---------------------------------------------------------------------------
export const BOUNDARY_SORT = {
  groups: [
    { id: 'convergent', label: 'Convergent', tone: 1, why: 'two plates move towards each other here' },
    { id: 'divergent', label: 'Divergent', tone: 3, why: 'two plates move apart here, and magma fills the gap' },
    { id: 'transform', label: 'Transform', tone: 5, why: 'two plates slide past each other here, so no crust is made or destroyed' },
  ],
  items: [
    { name: 'Andes', is: 'convergent', why: 'the Nazca plate sinks under South America here' },
    { name: 'Mid-Atlantic Ridge', is: 'divergent', why: 'two plates move apart and magma forms new crust' },
    { name: 'San Andreas Fault', is: 'transform', why: 'two plates slide past each other along this fault' },
    { name: 'Himalaya', is: 'convergent', why: 'two continental plates collide and the rock folds into mountains' },
    { name: 'Iceland', is: 'divergent', myth: true, why: 'Iceland stands on the Mid-Atlantic Ridge, where plates move apart' },
    { name: 'Japan Trench', is: 'convergent', why: 'an ocean plate sinks under another plate at this trench' },
    { name: 'Andaman arc', is: 'convergent', myth: true, why: 'the Indian plate sinks under the plate to the east here' },
    { name: 'Red Sea', is: 'divergent', myth: true, why: 'the Arabian plate is moving away from Africa, so this sea is widening' },
  ],
};

// ---------------------------------------------------------------------------
// L07 - CarrierSortScene (blk-l07-a01). Three agents, and the landforms each one makes.
// Each item is settled by which agent made the shape. Cards name a shape, not the agent.
// ---------------------------------------------------------------------------
export const CARRIER_SORT = {
  groups: [
    { id: 'water', label: 'Running water', tone: 2, why: 'a river made it, by cutting, carrying or dropping sediment' },
    { id: 'ice', label: 'Ice', tone: 5, why: 'a glacier made it, by scraping rock or by leaving the rock it carried' },
    { id: 'sea', label: 'The sea', tone: 1, why: 'waves and currents made it, at the shore' },
  ],
  items: [
    { name: 'a bowl high on a mountain', is: 'ice', why: 'a bowl-shaped hollow at the head of a glacier is a cirque' },
    { name: 'a sharp ridge between hollows', is: 'ice', myth: true, why: 'ice cut the hollows, and the ridge is the rock left between them: an arete' },
    { name: 'a wall of loose rock across a valley', is: 'ice', why: 'a glacier left this at its end: a terminal moraine' },
    { name: 'a valley with a wide floor', is: 'ice', myth: true, why: 'a river may run there now, but steep sides and a wide floor come from ice' },
    { name: 'a sand bar inside a river bend', is: 'water', why: 'slow water on the inner bank drops sediment' },
    { name: 'a deep pool under a fall', is: 'water', why: 'falling water and stones dig a plunge pool' },
    { name: 'a long sand bar with a free end', is: 'sea', why: 'waves and currents move sand along the shore and lay it down' },
    { name: 'a flat rock shelf under a cliff', is: 'sea', why: 'waves wore the cliff back and left a shore platform' },
    { name: 'a pillar of rock off the coast', is: 'sea', why: 'a sea stack is the outer leg left when an arch collapses' },
    { name: 'land split by small channels', is: 'water', why: 'a river slows at its mouth, drops its load and splits' },
    { name: 'a curved lake beside a river', is: 'water', why: 'an oxbow lake is a loop the river left behind' },
    { name: 'a low gap in a high ridge', is: 'ice', why: 'two hollows cut towards each other can leave a pass' },
  ],
};
