// Arcade decks for "Atmosphere and Climate" (one file per chapter, shared by its
// games). A deck is plain data, never edited by a later game: each game ADDS a new
// export below and imports it. Shape per game (docs/arcade-games.md):
//
//   Sort   -> { groups: [{ id, label, tone, why }], items: [{ name, is, why, myth? }] }
//   Route  -> groups + items + key (yes/no tree; each group id is a leaf)
//   Match  -> { pairs: [{ prompt, answer, group, why }] }
//   Order  -> { sequences: [{ title, items: [...], why }] }
//   Judge  -> { statements: [{ text, truth, myth?, why }] }
//
// Every `why` is the one line the why card shows after a mix-up: evidence, not a
// restated answer. `myth: true` marks what students commonly get wrong, and is
// worth double in the boss round. No art or colour may give an answer away.
//
// Exports so far, in the order the units added them (each block's `Owning unit:`
// line names its scene; the next unit ADDS its export below and edits nothing above):
//   AIR_CONTENTS_SORT  - L01 a01, AirContentsSortScene
//   LAYER_ORDER        - L02 a01, LayerOrderScene
//   CLIMATE_HUMIDITY_JUDGE - L03 a01, WeatherClimateJudgeScene
//   PRESSURE_WIND_KEYS - L04 a01, PressureWindRouteScene  (two keys under one routing root;
//                         see the Requests in that scene's design note)
//   MONSOON_KEYS       - L05 a01, MonsoonRouteScene  (rail skin; the two keys again under one
//                         routing root, each group given a single physical path)
//   SEASON_SORT        - L06 a01, SeasonSortScene  (a Sort deck whose groups and items carry a
//                         `groupset`; the scene shows only the current item's set of crates, so
//                         the next unit that reuses this shape must do the same filtering)
// Next unit: add your export BELOW the last one and edit nothing above it.

/**
 * AIR_CONTENTS_SORT - what is in the air, sorted three ways (L01, belt skin).
 * Main gases are the book's two primary gases. Argon goes with the tiny shares (0.93 per cent).
 * The tiny/notgas line is water vapour against a raindrop: one substance, two states.
 */
export const AIR_CONTENTS_SORT = {
  groups: [
    { id: 'main', label: 'Main gases', tone: 1, why: 'one of the two gases that make up about 99 per cent of the air' },
    { id: 'tiny', label: 'Gases in tiny amounts', tone: 3, why: 'a gas in the air, with a share under 1 per cent' },
    { id: 'notgas', label: 'Not a gas', tone: 6, why: 'a solid speck or a liquid drop carried in the air, not a gas' },
  ],
  items: [
    { name: 'Nitrogen', is: 'main', why: '78 per cent of the air, the largest share' },
    { name: 'Oxygen', is: 'main', why: '21 per cent of the air, the second largest share' },
    { name: 'Argon', is: 'tiny', why: '0.93 per cent: the largest of the small shares, but still under 1 per cent' },
    { name: 'Carbon dioxide', is: 'tiny', why: 'only 0.04 per cent of the air' },
    { name: 'Ozone', is: 'tiny', why: 'a gas, and one of the smallest shares of the air' },
    { name: 'Helium', is: 'tiny', why: 'one of the others, which share just 0.03 per cent' },
    { name: 'Neon', is: 'tiny', why: 'one of the others, which share just 0.03 per cent' },
    { name: 'Water vapour', is: 'tiny', myth: true, why: 'water as a gas, generally 0.1 to 0.4 per cent of the air' },
    { name: 'A speck of dust', is: 'notgas', why: 'a tiny solid particle floating in the air' },
    { name: 'A falling raindrop', is: 'notgas', myth: true, why: 'liquid water. The gas form is water vapour' },
    { name: 'A droplet of fog', is: 'notgas', why: 'liquid water hanging in the air, not vapour' },
    { name: 'A hailstone', is: 'notgas', why: 'solid ice falling through the air' },
  ],
};

/**
 * LAYER_ORDER - three orders in one column of air (L02, train skin). All from the ground up.
 * The menu shows a shuffled sample from the scene, never an order.
 */
export const LAYER_ORDER = {
  sequences: [
    {
      title: 'The five layers, from the ground up',
      myth: true,
      why: 'each layer starts where the one below it stops',
      items: [
        { name: 'Troposphere', why: 'the lowest layer, up to about 12 km' },
        { name: 'Stratosphere', why: 'above the troposphere, up to 50 km' },
        { name: 'Mesosphere', why: 'above the stratosphere, up to 80 km' },
        { name: 'Thermosphere', why: 'from 80 km to 700 km' },
        { name: 'Exosphere', why: 'the uppermost layer' },
      ],
    },
    {
      title: 'Layers and pauses, from the ground up',
      why: 'a pause is a thin zone on top of a layer, at about 12 and 50 km',
      items: [
        { name: 'Troposphere', why: 'the lowest layer, up to about 12 km' },
        { name: 'Tropopause', why: 'the thin zone on top of the troposphere' },
        { name: 'Stratosphere', why: 'above the tropopause, up to 50 km' },
        { name: 'Stratopause', why: 'the boundary at about 50 km' },
        { name: 'Mesosphere', why: 'above the stratopause, up to 80 km' },
      ],
    },
    {
      title: 'What you meet, from the ground up',
      myth: true,
      why: 'each of these belongs to one layer, and the layers stack in one order',
      items: [
        { name: 'Rain clouds', why: 'clouds and rain stay in the troposphere' },
        { name: 'Ozone layer', why: 'in the stratosphere' },
        { name: 'Burning meteors', why: 'most burn up in the mesosphere, 50 to 80 km high' },
        { name: 'Aurora', why: 'in the thermosphere, above 80 km' },
        { name: 'Helium floating away', why: 'light gases leave from the exosphere, at the very top' },
      ],
    },
  ],
};

/**
 * CLIMATE_HUMIDITY_JUDGE - true-or-false judgements on weather, climate and humidity
 * (L03, doors skin).
 *
 * Two halves that share one error each. The weather half is the hour-to-day state mistaken for
 * the long-run pattern; the humidity half is the quantity mistaken for the reading, and its
 * three myth items are three DIFFERENT pieces of the capacity relation (the ceiling rose, the
 * same vapour in a smaller box, and the definition itself), so getting one right for the wrong
 * reason leaves the next one to catch. Nothing here names a place, a zone, a month or a wind:
 * the lesson taught definitions, and a statement that asked for the thirty-year average to be
 * applied to a named town would be a different and much harder game.
 *
 * Owning unit: L03 a01 (WeatherClimateJudgeScene). Do not edit AIR_CONTENTS_SORT, LAYER_ORDER
 * or PRESSURE_WIND_KEYS, or any item above; a later game adds its own export below.
 */
export const CLIMATE_HUMIDITY_JUDGE = {
  statements: [
    { text: 'Humidity is water vapour', truth: true, why: 'more water vapour in the air means more humid air' },
    { text: "Today's weather is the same as climate", truth: false, myth: true, why: 'weather is the state of the air today; climate is the average over thirty years or more' },
    { text: 'Climate is weather averaged over 30 years', truth: true, why: 'it takes decades of weather to show a pattern' },
    { text: "One cold winter changes a place's climate", truth: false, myth: true, why: 'one winter is a small part of a thirty-year average' },
    { text: 'Two towns can share weather but not climate', truth: true, why: 'one day says little about what happens over thirty years' },
    { text: 'Long dry years give a place a dry climate', truth: true, why: 'climate is the long pattern, and here the pattern is little rain' },
    { text: 'Warm air holds less vapour than cold air', truth: false, myth: true, why: 'warm air can hold more; its capacity rises as it warms' },
    { text: 'Sweat dries faster on a humid day', truth: false, myth: true, why: 'humid air is close to full, so sweat evaporates slowly' },
  ],
};

/**
 * WIND_CELL_KEY - rising or sinking, then warm or cold, to low or high (L04, road skin).
 *
 * Kept as a named const because it is half of the deck, and the two halves are the two keys the
 * slide names. Both branches of the second level ask the SAME question and swap their leaves, so
 * the key is not two one-way ladders and the answer cannot be read off which question came up.
 * Module-local: a later game adds its own export, it does not reach in here.
 */
const WIND_CELL_KEY = {
  ask: 'Is the air here warm and rising?',
  yes: 'low',
  no: 'high',
};

/**
 * COAST_REVERSAL_KEY - day or night, then which surface is warmer, to a sea or a land breeze.
 *
 * The middle gate is the whole point of this key: naming and group line up if the learner skips
 * straight from "day" to "sea breeze", so the temperature step has to be a gate of its own. Both
 * branches ask it, with the leaves swapped.
 */
const COAST_REVERSAL_KEY = {
  ask: 'Is the land warmer than the sea?',
  yes: 'seabreeze',
  no: 'landbreeze',
};

/**
 * PRESSURE_WIND_KEYS - the chapter's two pressure/wind keys, run as one road course (L04).
 *
 * `ArcadeRouteScene` takes ONE key and requires every group to be a leaf of it, while the lesson
 * teaches two keys with different first questions. They are therefore composed under a single
 * routing root - is this a coast? - which is free from the item's own wording and gives nothing
 * away: both chains below it run exactly as the slides state them. The routing root is the one
 * liberty; it is recorded under `## Requests` in simulations/L04/PressureWindRouteScene.design.md.
 *
 * Group labels are the bare names. The fuller forms ("from the sea, by day") are the group `why`,
 * because printed beside a gate they would answer the very question being asked. Tones identify a
 * group in the "where it can end" list; they never mark the item in play.
 *
 * Nothing here names an altitude, a pressure number, an isobar, a Beaufort band, a wind speed, a
 * place, a month or a season: those are s02, s05 and s06, and an item the learner could answer by
 * reading a number would be a different and much easier game than running a causal chain. No `art`
 * either - a sun on the beach item would answer the coast key's first gate outright.
 *
 * Owning unit: L04 a01 (PressureWindRouteScene). Do not edit any export or item above; a later
 * game adds its own export below.
 */
export const PRESSURE_WIND_KEYS = {
  groups: [
    { id: 'low', label: 'Low pressure', tone: 3, why: 'warm air rises, and this leaves low pressure, often with cloud' },
    { id: 'high', label: 'High pressure', tone: 1, why: 'cold, heavy air sinks, and this makes high pressure and clear skies' },
    { id: 'seabreeze', label: 'Sea breeze', tone: 5, why: 'the land is warmer, so the wind blows from sea to land' },
    { id: 'landbreeze', label: 'Land breeze', tone: 6, why: 'the sea is warmer, so the wind blows from land to sea' },
  ],
  items: [
    { art: false, name: 'The Thar Desert, a May afternoon', is: 'low', why: 'very hot ground heats the air, and it rises' },
    { art: false, name: 'The Ganga plain under rain clouds', is: 'low', why: 'rising air cools and builds cloud' },
    { art: false, name: 'Ladakh, a clear January night', is: 'high', why: 'very cold air is heavy and sinks' },
    { art: false, name: 'A week of clear, sunny skies', is: 'high', myth: true, why: 'sinking air does not build cloud, so the sky stays clear' },
    { art: false, name: 'Marina Beach, mid-afternoon', is: 'seabreeze', why: 'by afternoon the land is warmer than the sea' },
    { art: false, name: 'A Konkan village, 3 pm', is: 'seabreeze', why: 'the land has heated all day' },
    { art: false, name: 'Marina Beach, midnight', is: 'landbreeze', myth: true, why: 'the land has cooled faster, so the sea is now warmer' },
    { art: false, name: 'The Kerala coast, before dawn', is: 'landbreeze', why: 'after a night of cooling the land is cooler than the sea' },
  ],
  // Every group is a leaf of this one tree: is this a coast, then the question that matters there.
  key: {
    ask: 'Is this place on a coast?',
    yes: COAST_REVERSAL_KEY,
    no: WIND_CELL_KEY,
  },
};

/**
 * SEASON_SORT - two sorts in one run (L06, belt skin). First: is this one of the IMD's four seasons or a
 * traditional Ritu? Then: which monsoon does this fact belong to? Book facts only. Each group set has two
 * crates. Owning unit: L06 a01 (SeasonSortScene).
 */
export const SEASON_SORT = {
  groups: [
    { id: 'imd4', groupset: 'system', label: 'IMD season', tone: 1, why: 'the Indian Meteorological Department names four seasons' },
    { id: 'rtu6', groupset: 'system', label: 'Traditional Ṛtu', tone: 3, why: 'the old calendar has six seasons, each about two months' },
    { id: 'swm', groupset: 'attribution', label: 'South-west monsoon', tone: 2, why: 'June to September: moist winds from sea to land' },
    { id: 'nem', groupset: 'attribution', label: 'North-east monsoon', tone: 5, why: 'October to February: cold, dry winds from land to sea' },
  ],
  items: [
    { name: 'Post-monsoon', groupset: 'system', is: 'imd4', why: 'one of the four IMD seasons, October to December' },
    { name: 'Pre-monsoon', groupset: 'system', is: 'imd4', why: 'the IMD name for summer, April to June' },
    { name: 'December to early April', groupset: 'system', is: 'imd4', myth: true, why: 'the IMD winter: far longer than a two-month Ṛtu' },
    { name: 'June to September', groupset: 'system', is: 'imd4', myth: true, why: 'the IMD monsoon: four months, and a Ṛtu is about two' },
    { name: 'Vasanta', groupset: 'system', is: 'rtu6', why: 'the Ṛtu of March and April' },
    { name: 'Varṣhā', groupset: 'system', is: 'rtu6', why: 'the Ṛtu of July and August' },
    { name: 'Śharad', groupset: 'system', is: 'rtu6', why: 'the Ṛtu of September and October' },
    { name: 'January and February', groupset: 'system', is: 'rtu6', myth: true, why: 'these two months make Śhiśhira' },
    { name: 'Winds from sea to land', groupset: 'attribution', is: 'swm', why: 'the land is hot, so moist air blows in from the sea' },
    { name: 'Also called the summer monsoon', groupset: 'attribution', is: 'swm', why: 'it blows between June and September' },
    { name: 'Most of India\'s rain', groupset: 'attribution', is: 'swm', why: 'it brings most of the rainfall of the country' },
    { name: 'Kerala in June', groupset: 'attribution', is: 'swm', why: 'the wind arrives here first, straight off the sea' },
    { name: 'Winds from land to sea', groupset: 'attribution', is: 'nem', why: 'the land is cold, so dry air blows out to sea' },
    { name: 'Also called the winter monsoon', groupset: 'attribution', is: 'nem', why: 'it blows from October to February' },
    { name: 'Tamil Nadu in November', groupset: 'attribution', is: 'nem', myth: true, why: 'the wind crosses the Bay of Bengal and picks up moisture' },
    { name: 'Dry north India in January', groupset: 'attribution', is: 'nem', myth: true, why: 'these winds are cold and dry over most of India' },
  ],
};

/**
 * CLIMATE_DATA_KEYS - words of the station lesson as term and meaning (L07, range skin). The why lines
 * carry a figure from the table. Owning unit: L07 a01 (StationMatchScene).
 */
export const CLIMATE_DATA_KEYS = {
  pairs: [
    { prompt: 'Equable', answer: 'Temperature stays steady', group: 'temperature', myth: true, why: 'Thiruvananthapuram stays between 26.2 and 28.7 °C' },
    { prompt: 'Latitude', answer: 'Distance from the equator', group: 'place', why: 'Leh, at 34° N, is furthest of the ten' },
    { prompt: 'Altitude', answer: 'Height above the sea', group: 'place', myth: true, why: 'Leh is at 3506 m and Kolkata at 6 m' },
    { prompt: 'Annual rainfall', answer: 'Rain in a whole year', group: 'total', why: 'Shillong gets 225.3 cm in a year' },
    { prompt: 'Climate graph', answer: 'Temperature line, rain bars', group: 'total', why: 'the line and the bars share the months' },
    { prompt: 'Isochrone', answer: 'A line joining one date', group: 'wind', myth: true, why: 'one line joins places with the same monsoon date' },
    { prompt: 'Retreating monsoon', answer: 'The monsoon leaving', group: 'wind', why: 'it leaves the far north-west first, around 17 September' },
  ],
};

/**
 * CLIMATE_CHANGE_KEYS - true or false on the closing lesson (L08, cards skin). Ten statements, six true
 * and four false. No statement asks for a number. text and why stay near 40 characters a line, two lines.
 * Owning unit: L08 a01 (ClimateChangeJudgeScene).
 */
export const CLIMATE_CHANGE_KEYS = {
  statements: [
    { text: 'Carbon dioxide is too small a share of the air to matter', truth: false, myth: true, why: 'it holds rising heat, while nitrogen and oxygen let it pass' },
    { text: 'The greenhouse effect is bad in itself', truth: false, myth: true, why: 'without it Earth would be about -18 °C on average' },
    { text: 'The ozone hole is the main cause of global warming', truth: false, myth: true, why: 'it lets in ultraviolet; warming comes mainly from greenhouse gases' },
    { text: 'Greenhouse gases stop sunlight reaching the ground', truth: false, myth: true, why: 'sunlight passes through; they act on the heat going back up' },
    { text: 'The water vapour in the air is one of the greenhouse gases', truth: true, why: 'it is one of the four, with carbon dioxide, methane and nitrous oxide' },
    { text: 'Burning fossil fuels adds greenhouse gases to the air', truth: true, why: 'coal, oil and gas release carbon dioxide' },
    { text: 'Cutting forests is one cause of climate change', truth: true, why: 'deforestation is among the human activities that cause it' },
    { text: 'Climate change means long-term changes in weather patterns', truth: true, why: 'one wet week is weather; long-term change is climate' },
    { text: 'Melting glaciers and rising sea levels are effects of climate change', truth: true, why: 'both are on the list, with floods, droughts and loss of biodiversity' },
    { text: 'Protecting forests helps to tackle climate change', truth: true, why: 'it is one of the four collective efforts' },
  ],
};
/**
 * MONSOON_KEYS - which monsoon, and does it bring rain here (L05, rail skin). One key: the months,
 * then whether the wind has crossed the Bay of Bengal. Facts are the book's: June to September is
 * the south-west monsoon, October to February the north-east; the winds from land are dry, except
 * where they cross the Bay and reach Tamil Nadu, Andhra Pradesh and parts of Karnataka.
 *
 * Owning unit: L05 a01 (MonsoonRouteScene).
 */
export const MONSOON_KEYS = {
  groups: [
    { id: 'sw', label: 'South-west monsoon, wet', tone: 3, why: 'moist wind blows from the sea to the land from June to September' },
    { id: 'nedry', label: 'North-east monsoon, dry', tone: 1, why: 'cold, dry wind blows from the land from October to February' },
    { id: 'neeast', label: 'North-east monsoon, wet coast', tone: 5, why: 'the wind picks up moisture over the Bay of Bengal' },
  ],
  items: [
    { art: false, name: 'The Konkan coast in July', is: 'sw', why: 'July is in the summer monsoon, and the wind comes off the sea' },
    { art: false, name: 'Delhi in August', is: 'sw', why: 'August is in the summer monsoon' },
    { art: false, name: 'Meghalaya in June', is: 'sw', why: 'June is in the summer monsoon' },
    { art: false, name: 'Punjab in January', is: 'nedry', why: 'the wind comes from the cold land and has crossed no sea' },
    { art: false, name: 'Mumbai in December', is: 'nedry', myth: true, why: 'Mumbai is on a coast, but this wind blows from the land to the sea' },
    { art: false, name: 'Rajasthan in November', is: 'nedry', why: 'this wind has crossed only dry land' },
    { art: false, name: 'The Tamil Nadu coast in November', is: 'neeast', myth: true, why: 'the wind has crossed the Bay of Bengal and picked up moisture' },
    { art: false, name: 'Coastal Andhra Pradesh in October', is: 'neeast', why: 'the wind has crossed the Bay of Bengal and picked up moisture' },
  ],
  key: {
    ask: 'Is it between June and September?',
    yes: 'sw',
    no: { ask: 'Has this wind crossed the Bay of Bengal?', yes: 'neeast', no: 'nedry' },
  },
};
