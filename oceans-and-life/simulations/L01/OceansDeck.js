// Oceans and life: the chapter's arcade decks. A deck is plain data and every
// game in the chapter shares this one file; each game adds its own export
// below the others and never edits an export or an item already here.
//
// Every `why` is the one-line reason the why card shows after a mix-up, so
// write it as evidence, never as a restated answer. `myth: true` marks an
// item students commonly get wrong: it is worth double in the boss round.
// No item carries art, a glyph or a tint that gives the answer away.

// The eleven shapes of the sea floor: a line about the shape against the
// name of the feature. For ArcadeMatchScene (bubbles skin).
export const RELIEF_FEATURES_MATCH = {
  pairs: [
    {
      prompt: 'the shallow, sunlit ledge running out under the sea from the coast',
      answer: 'Continental shelf',
      group: 'continental-margin',
      why: 'it is the shallow submerged edge of the continent',
    },
    {
      prompt: 'the steep face where the land ends and the deep begins',
      answer: 'Continental slope',
      group: 'continental-margin',
      why: 'it is the steep drop that marks the true edge of the continent',
    },
    {
      prompt: 'the gentler slope running on below the steep face',
      answer: 'Continental rise',
      group: 'continental-margin',
      why: 'it eases off where the slope ends and runs down to the deep floor',
    },
    {
      prompt: 'the vast flat floor of the deep ocean',
      answer: 'Abyssal plain',
      group: 'deep-floor',
      why: 'it is the vast, flat and deep ocean floor',
    },
    {
      prompt: 'the immense underwater mountain range, with a split along its crest',
      answer: 'Mid-ocean ridge',
      group: 'volcanic',
      why: 'it is the long range built by volcanic activity, and the crack in its top is the rift valley',
    },
    {
      prompt: 'the crack along the top of that range, with magma pushing up below it',
      answer: 'Rift valley',
      group: 'volcanic',
      myth: true,
      why: 'it is the split in the ridge where new sea floor is made',
    },
    {
      prompt: 'the deepest notch cut into the sea floor',
      answer: 'Trench',
      group: 'deep-floor',
      why: 'it is the deepest part of the ocean floor',
    },
    {
      prompt: 'a steep-sided valley cut into the edge of the land',
      answer: 'Submarine canyon',
      group: 'deep-floor',
      why: 'it is a deep valley cut into the edge of a continent',
    },
    {
      prompt: 'a volcanic mountain that rises from the floor but stops short of the surface',
      answer: 'Seamount',
      group: 'volcanic',
      why: 'it comes up out of the sea floor without ever reaching the surface',
    },
    {
      prompt: 'a volcano that grew high enough to break the surface and stand above the waves',
      answer: 'Volcanic island',
      group: 'volcanic',
      why: 'it is a seamount that grew past the water line',
    },
    {
      prompt: 'a flat-topped mountain, worn down by waves, that later sank under the sea',
      answer: 'Guyot',
      group: 'volcanic',
      myth: true,
      why: 'its top was worn flat by waves over a very long time, and then it sank',
    },
  ],
};

// The stages the sea makes, and a wave from wind to beach. For ArcadeOrderScene
// (stack skin).
export const EROSION_ORDER = {
  sequences: [
    {
      title: 'A headland wearing down',
      items: ['Large crack', 'Sea cave', 'Sea arch', 'Sea stack', 'Stump'].map((name) => ({ name, art: false })),
      myth: true,
      why: 'a crack widens into a cave, the back wears through to an arch, the top falls to leave a stack, and the stack wears down to a stump',
    },
    {
      title: 'From the wind to the beach',
      items: ['Wind blows', 'Wave forms', 'Wave reaches shallow water', 'Wave breaks', 'Sand is dropped'].map((name) => ({ name, art: false })),
      why: 'wind makes the wave, shallow water makes it break, and a wave that slows drops its sand',
    },
  ],
};

// The world's currents, sorted by the kind of water they carry. For
// ArcadeSortScene (sky skin).
export const CURRENT_NAMES = {
  groups: [
    { id: 'warm', label: 'Warm', tone: 6, why: 'its water flows from a warmer region' },
    { id: 'cold', label: 'Cold', tone: 1, why: 'its water flows from a colder region' },
  ],
  items: [
    { name: 'Gulf Stream', is: 'warm', why: 'it starts in the warm Gulf of Mexico and flows towards Norway' },
    { name: 'Kuroshio', is: 'warm', why: 'it comes up past Japan from warmer seas to the south' },
    { name: 'North Atlantic Drift', is: 'warm', why: 'it carries on from the Gulf Stream towards Norway' },
    { name: 'North Equatorial Current', is: 'warm', why: 'it flows through the warm seas just north of the Equator' },
    { name: 'Agulhas Current', is: 'warm', why: 'it flows south along the east coast of Africa from warmer seas' },
    { name: 'Brazilian Current', is: 'warm', why: 'it flows south from the warm seas near the Equator' },
    { name: 'Labrador Current', is: 'cold', why: 'it carries freezing water along the east coast of Canada' },
    { name: 'Oyashio Current', is: 'cold', myth: true, why: 'it comes down past Japan from the cold north' },
    { name: 'Humboldt (Peru) Current', is: 'cold', why: 'it carries cold water north along South America' },
    { name: 'Benguela Current', is: 'cold', why: 'it comes up from the cold far south along south-west Africa' },
    { name: 'Canaries Current', is: 'cold', why: 'it comes down from cooler seas to the north along north-west Africa' },
    { name: 'West Wind Drift', is: 'cold', myth: true, why: 'it runs eastwards through the cold seas of the far south' },
  ],
};

// The seven acronyms of the warning lesson, matched to the job each one does.
// For ArcadeMatchScene (range skin).
export const WARNING_NAMES = {
  pairs: [
    {
      prompt: 'the India Meteorological Department, which works with INCOIS on storm surges',
      answer: 'IMD',
      group: 'forecaster',
      why: 'it is the India Meteorological Department',
    },
    {
      prompt: 'the ocean information centre whose app shows GEMINI data',
      answer: 'INCOIS',
      group: 'forecaster',
      myth: true,
      why: 'it is the Indian National Centre for Ocean Information Services, and it set up SSEWS with IMD',
    },
    {
      prompt: 'the project that builds cyclone shelters',
      answer: 'NCRMP',
      group: 'warning scheme',
      myth: true,
      why: 'the National Cyclone Risk Mitigation Project builds shelters, strengthens warning systems and improves emergency response',
    },
    {
      prompt: 'the system that forecasts storm surges and how far the water spreads',
      answer: 'SSEWS',
      group: 'warning scheme',
      why: 'the Storm Surge Early Warning System forecasts cyclone-induced surges and how far the water spreads',
    },
    {
      prompt: 'the handheld device that passes satellite data to a phone',
      answer: 'GEMINI',
      group: 'device',
      why: 'it receives data from the GAGAN satellite and sends it to a phone through Bluetooth',
    },
    {
      prompt: 'the satellite that sends data to the handheld device',
      answer: 'GAGAN',
      group: 'device',
      myth: true,
      why: 'the GEMINI device receives its data from the GAGAN satellite',
    },
    {
      prompt: 'the scheme that gives financial support for the device',
      answer: 'PMMSY',
      group: 'warning scheme',
      myth: true,
      why: 'under it the government gives financial support for GEMINI devices',
    },
  ],
};

// The four stages of the tsunami warning system, and the chain of hands that
// carries an alert to the shore. For ArcadeOrderScene (train skin).
export const WARNING_ORDER = {
  sequences: [
    {
      title: 'The four stages of the tsunami warning system',
      items: ['Detection', 'Confirmation', 'Tracking', 'Warning Dissemination'],
      myth: true,
      why: 'seismic stations detect the earthquake, recorders on the sea floor confirm the threat, tide gauges and radars track the waves, and then alerts go out',
    },
    {
      title: 'Who passes the alert on',
      items: ['ITEWC', 'Government of India', 'States and response teams', 'People on the coast'],
      myth: true,
      why: 'ITEWC alerts the Government of India, which informs state governments and emergency response teams, so that the warning reaches the public',
    },
  ],
};

// The marine resources, run down a yes/no key to the branch each one belongs
// to. For ArcadeRouteScene (road skin).
export const RESOURCE_KEY = {
  groups: [
    { id: 'fish', label: 'Fish', tone: 1, why: 'fish are living resources taken from the sea' },
    { id: 'other-living', label: 'Other living', tone: 2, why: 'they are living things of the sea that are not fish' },
    { id: 'minerals', label: 'Minerals', tone: 4, why: 'they are materials from the sea, not living and not a source of energy' },
    { id: 'conventional', label: 'Conventional energy', tone: 5, why: 'it has been used as energy for a long time' },
    { id: 'non-conventional', label: 'Non-conventional', tone: 6, why: 'it is a newer source of energy' },
  ],
  items: [
    { name: 'Tuna', is: 'fish', why: 'it is a fish, and fish are living resources' },
    { name: 'Sardine', is: 'fish', why: 'it is a fish, and fish are living resources' },
    { name: 'Seagrass', is: 'other-living', myth: true, why: 'it grows under water, so it is living, but it is not a fish' },
    { name: 'Mussels', is: 'other-living', why: 'they are sea animals, but they are not fish' },
    { name: 'Plankton', is: 'other-living', why: 'it drifts in the sea water, so it is living, but it is not a fish' },
    { name: 'Sand', is: 'minerals', why: 'it is a material from the sea, not living and not a source of energy' },
    { name: 'Gravel', is: 'minerals', why: 'it is a material from the sea, not living and not a source of energy' },
    { name: 'Deep-sea minerals', is: 'minerals', why: 'they are materials on the deep sea floor, not a source of energy' },
    { name: 'Oil', is: 'conventional', myth: true, why: 'it has been drawn from under the sea bed for a long time' },
    { name: 'Natural gas', is: 'conventional', myth: true, why: 'it has been drawn from under the sea bed for a long time' },
    { name: 'Gas hydrates', is: 'non-conventional', myth: true, why: 'it is gas held in an ice-like solid, and it is a newer source' },
    { name: 'Offshore wind', is: 'non-conventional', why: 'turbines at sea catch the wind, which is a newer source' },
    { name: 'Tidal energy', is: 'non-conventional', why: 'it uses moving water, and ocean energy is a newer source' },
    { name: 'OTEC', is: 'non-conventional', why: 'it uses the temperature difference between warm surface water and cold deep water' },
  ],
  key: {
    ask: 'Is it a living resource?',
    no: {
      ask: 'Is it a source of energy?',
      no: 'minerals',
      yes: {
        ask: 'Is it conventional energy?',
        yes: 'conventional',
        no: 'non-conventional',
      },
    },
    yes: {
      ask: 'Is it a fish?',
      no: 'other-living',
      yes: 'fish',
    },
  },
};

// Claims about the sea zones and the rights in them, to be called true or
// false. For ArcadeJudgeScene (cards skin).
export const ZONE_RIGHTS = {
  statements: [
    { text: 'A country fully owns the water of its EEZ.', truth: false, myth: true, why: 'it has special rights over fish, oil and gas, but it does not fully own or control the water' },
    { text: 'A foreign ship may sail through a territorial sea without stopping.', truth: true, why: 'that is innocent passage, as long as it threatens nothing' },
    { text: 'A foreign trawler fishing 5 nautical miles off the baseline can be ordered out.', truth: true, why: 'fishing is not allowed under innocent passage' },
    { text: 'The territorial sea reaches 12 nautical miles from the baseline.', truth: true, why: 'that is its limit' },
    { text: 'The contiguous zone reaches 24 nautical miles from the baseline.', truth: true, why: 'it runs out to 24 nautical miles' },
    { text: 'The territorial sea ends at 24 nautical miles.', truth: false, myth: true, why: 'it ends at 12; 24 is the edge of the contiguous zone' },
    { text: 'A ship that stops to fish is still making innocent passage.', truth: false, myth: true, why: 'fishing is not innocent passage' },
    { text: 'The EEZ reaches 200 nautical miles from the baseline.', truth: true, why: 'that is its limit under UNCLOS' },
    { text: 'In the contiguous zone a country can act on illegal immigration.', truth: true, why: 'its limited control covers customs, fiscal matters and illegal immigration' },
    { text: 'In its contiguous zone a country has near-complete control.', truth: false, myth: true, why: 'near-complete control is in the territorial sea; here control is limited' },
    { text: 'A country may stop any foreign ship from entering its territorial sea.', truth: false, myth: true, why: 'innocent passage gives foreign ships the right to pass through' },
    { text: 'Ships from other countries may pass through an EEZ peacefully.', truth: true, why: 'the country does not fully own or control that water' },
    { text: 'One nautical mile is exactly 1,852 metres.', truth: true, why: 'that is how the unit is defined' },
    { text: 'Sea distances are measured from the baseline, not the high-tide shore.', truth: true, why: 'every limit is counted from the baseline' },
    { text: 'The baseline always follows the shoreline at high tide.', truth: false, myth: true, why: 'on most coasts it follows the low-water line' },
    { text: 'A ship that stops because of a breakdown can still be in innocent passage.', truth: true, why: 'a stop is allowed in an emergency or a breakdown' },
    { text: 'Internal waters lie on the land side of the baseline.', truth: true, why: 'the baseline marks their outer edge' },
    { text: 'Rights over the fish in an EEZ make the water part of the country.', truth: false, myth: true, why: 'the rights are over resources; the country does not fully own the water' },
  ],
};

// Fifteen names, matched to what each one is or does. For
// ArcadeMatchScene (bubbles skin).
export const OCEAN_TERMS = {
  pairs: [
    {
      prompt: "India's weather department, a partner in the storm surge system",
      answer: 'IMD',
      group: 'warning agency',
      why: 'IMD works with INCOIS on the Storm Surge Early Warning System',
    },
    {
      prompt: 'the centre that set up the storm surge system with IMD',
      answer: 'INCOIS',
      group: 'warning agency',
      why: 'with IMD it set up the Storm Surge Early Warning System for the Indian coasts',
    },
    {
      prompt: 'the project that builds cyclone shelters',
      answer: 'NCRMP',
      group: 'warning agency',
      why: 'it builds shelters and strengthens warning systems and emergency response',
    },
    {
      prompt: 'the scheme that gives fishers financial support for the device',
      answer: 'PMMSY',
      group: 'warning agency',
      myth: true,
      why: 'it gives financial support for fishers',
    },
    {
      prompt: 'the satellite that sends information to the device at sea',
      answer: 'GAGAN',
      group: 'instrument',
      myth: true,
      why: 'the handheld device receives its information from this satellite',
    },
    {
      prompt: 'the handheld device that passes alerts to a phone',
      answer: 'GEMINI',
      group: 'instrument',
      why: 'it takes what the satellite sends and hands it to the phone over Bluetooth',
    },
    {
      prompt: 'the centre that gives India tsunami warnings',
      answer: 'ITEWC',
      group: 'instrument',
      myth: true,
      why: 'it uses detection buoys and sea-floor recorders to confirm a tsunami',
    },
    {
      prompt: 'the recorder on the sea floor that senses a tsunami',
      answer: 'OBPR',
      group: 'instrument',
      why: 'they sit on the sea floor and send data to a buoy on the surface',
    },
    {
      prompt: 'the system that forecasts the surge and how far inland it floods',
      answer: 'SSEWS',
      group: 'instrument',
      why: 'it forecasts the surge height and how far the water spreads',
    },
    {
      prompt: "the convention that fixed the sea's zones and their rights",
      answer: 'UNCLOS',
      group: 'convention',
      why: 'it defines maritime zones by global agreement',
    },
    {
      prompt: 'the rules of the road at sea: what two ships must do when they meet',
      answer: 'COLREGs',
      group: 'convention',
      why: 'it covers lookout, give-way and stand-on, safe speed, lights, signals and shapes',
    },
    {
      prompt: 'the agreement aimed at reducing pollution from ships',
      answer: 'MARPOL',
      group: 'convention',
      myth: true,
      why: 'it is the international convention on pollution from ships',
    },
    {
      prompt: 'the zone out to 200 nautical miles with rights over fish, oil and gas',
      answer: 'EEZ',
      group: 'sea term',
      myth: true,
      why: 'the country has special rights there, but does not fully own the water',
    },
    {
      prompt: 'the unit of distance at sea: one of them is 1,852 metres',
      answer: 'NM',
      group: 'sea term',
      myth: true,
      why: 'it is the unit of distance at sea',
    },
    {
      prompt: 'the country where a ship is registered',
      answer: 'flag state',
      group: 'sea term',
      myth: true,
      why: 'on the high seas the laws of the flag state apply',
    },
  ],
};
