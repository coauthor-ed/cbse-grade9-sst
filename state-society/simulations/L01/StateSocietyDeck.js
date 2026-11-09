// StateSocietyDeck - the chapter's arcade deck file, one file per chapter.
//
// This is the FIRST export in the file. A later lesson's game adds a NEW export
// beside it and never edits or reorders an existing item or export.
//
// Every item's `why` is the evidence line the why card shows, never a restated
// answer. `myth: true` marks what learners commonly get wrong.

/**
 * The four parts inside every Veda, plus a fifth crate for the texts that are
 * not part of one. Taught by L01 s04.
 *
 * The fifth group is the deck's work: without it a learner can win by matching
 * "text" against "prose" and never learn the structure. `none` is not a failure
 * bin - two of the six items belong there.
 */
export const VEDA_PARTS = {
  groups: [
    { id: 'samhita', label: 'samhitā', tone: 1, why: 'hymns used for invoking the deity and for offerings in the yajña' },
    { id: 'brahmana', label: 'brāhmaṇa', tone: 2, why: 'prose that offers explanations for ritual performances' },
    { id: 'aranyaka', label: 'āraṇyaka', tone: 3, why: 'araṇya means forest: thoughts of sages living in forests' },
    { id: 'upanishad', label: 'upaniṣhad', tone: 4, why: 'it asks about the Self and the Ultimate Universal Being' },
    { id: 'none', label: 'none of these', tone: 5, why: 'a Veda has four parts, and this is not one of them' },
  ],
  items: [
    { name: 'A hymn used in an offering', is: 'samhita', why: 'the samhitās primarily contain hymns used for invoking the deity' },
    { name: 'Prose explaining a ritual', is: 'brahmana', myth: true, why: 'it is prose, and it explains the ritual: that is the brāhmaṇa' },
    { name: 'Thoughts of sages in a forest', is: 'aranyaka', why: 'araṇya means forest, and the āraṇyakas expand on the thoughts of forest sages' },
    { name: 'A question about the Self', is: 'upanishad', myth: true, why: 'the upaniṣhads go into the Self and the Ultimate Universal Being' },
    { name: "A list of a king's officers", is: 'none', myth: true, why: 'a list of officers is about administration, and it is not one of the four parts' },
    { name: 'The Arthashastra', is: 'none', myth: true, why: 'it is a treatise on statecraft, not a part of a Veda' },
  ],
};

/**
 * The four stages of a life, run down a yes/no key. Taught by L09 s01.
 *
 * The leaves are stages a person is IN, never ranks they hold and never goals
 * they aim at - the pair with `PURUSARTHA_KEY` below, and the reason the two
 * keys share one road. `sannyasa` sits at the foot of both first-level branches
 * so the key is not two one-way ladders.
 */
export const LIFE_STAGE_KEY = {
  groups: [
    { id: 'brahmacharya', label: 'Brahmacharya', tone: 1, why: 'the stage of the student: being taught' },
    { id: 'grihastha', label: 'Gṛihastha', tone: 3, why: 'the stage of the householder: a household of your own to run' },
    { id: 'vanaprastha', label: 'Vānaprastha', tone: 5, why: 'life in the forest, after the household has been handed on' },
    { id: 'sannyasa', label: 'Saṁnyāsa', tone: 7, why: 'renunciation: possessions given up on purpose' },
  ],
  items: [
    { name: 'A bride running the household', is: 'grihastha', why: 'a stage of life: the household is hers to run' },
    { name: 'An old couple for the forest', is: 'vanaprastha', myth: true, why: 'a stage of life: this is the hand-over - the household is somebody else\'s now' },
    { name: 'A parent feeding two children', is: 'grihastha', myth: true, why: 'a stage of life: a home to run and a family to look after' },
    { name: 'A person who gave it all away', is: 'sannyasa', why: 'a stage of life: renunciation is giving possessions up on purpose' },
    { name: 'A boy copying from a tablet', is: 'brahmacharya', why: 'a stage of life: the stage of the student is being taught, under a teacher' },
    { name: 'A grandmother in the forest', is: 'vanaprastha', why: 'a stage of life: she has moved away from the household to the forest' },
  ],
  // Every group is a leaf; both first-level branches reach more than one end.
  key: {
    ask: 'Is this person still learning, or have they finished being taught?',
    yes: {
      ask: 'Are they living under a teacher’s roof?',
      yes: 'brahmacharya',
      no: 'sannyasa',
    },
    no: {
      ask: 'Are they living with a family and running a household?',
      yes: 'grihastha',
      no: {
        ask: 'Have they handed the household on?',
        yes: 'vanaprastha',
        no: 'sannyasa',
      },
    },
  },
};

/**
 * The four goals of a life, run down a yes/no key. Taught by L09 s02.
 *
 * `moksha` and `dharma` share the *ought to do* branch and are separated only by
 * the second gate, which is the point: doing one's duty perfectly never reaches
 * `moksha`. Same shape as `LIFE_STAGE_KEY` above, and the whole reason a learner
 * has to say which list they are on.
 */
export const PURUSARTHA_KEY = {
  groups: [
    { id: 'dharma', label: 'Dharma', tone: 2, why: 'how a person should act' },
    { id: 'artha', label: 'Artha', tone: 4, why: 'what a person should have' },
    { id: 'kama', label: 'Kāma', tone: 6, why: 'what a person wants' },
    { id: 'moksha', label: 'Mokṣha', tone: 8, why: 'release from worldly ties' },
  ],
  items: [
    { name: 'A head dividing a harvest', is: 'dharma', why: 'a goal of life: the question is what a person ought to do, and the giving is a duty' },
    { name: 'A man weighing a second house', is: 'artha', why: 'a goal of life: this is what a person should have, and the decision is material' },
    { name: 'A person choosing two goods', is: 'kama', why: 'a goal of life: the fulfilment of desires is what a person wants, not a duty' },
    { name: 'A man refusing easy money', is: 'dharma', myth: true, why: 'a goal of life: wealth is wanted only where it serves society, so this is what he ought to do' },
    { name: 'Someone done with every tie', is: 'moksha', why: 'a goal of life: release from worldly ties is leaving the world behind, more than doing duty' },
    { name: 'A man who owes no duty', is: 'moksha', why: 'a goal of life: release from all worldly ties is more than having finished your duties' },
  ],
  key: {
    ask: 'Is this about what a person ought to do, or ought to have?',
    yes: {
      ask: 'Does the situation leave the world behind?',
      yes: 'moksha',
      no: 'dharma',
    },
    no: {
      ask: 'Is it about getting what one wants?',
      yes: 'kama',
      no: 'artha',
    },
  },
};

/**
 * L02 MahajanapadaRouteScene. A key to what the L02 map teaches and nothing else:
 * s04 region (tap a badge: name and region), s08 the two forms of state, s07 the
 * three emblems of the far south. Items are names; the answer is where each one sits.
 */
export const MAHAJANAPADA_ROUTES = {
  groups: [
    { id: 'nw', label: 'North-west', tone: 1, why: 'it lies in the north-west, away from the Ganga plain' },
    { id: 'rajya', label: 'Ganga plain: r\u0101jya', tone: 2, why: 'it lies in the Ganga plain, and a king ruled it' },
    { id: 'gana', label: 'Ganga plain: ga\u1E47a', tone: 3, why: 'it lies in the Ganga plain, and it was a republican state' },
    { id: 'south', label: 'South of the Yamuna', tone: 4, why: 'only three of the sixteen lay south of the Yamuna' },
    { id: 'chola', label: 'Tiger', tone: 5, why: 'the tiger was the emblem of the Cholas' },
    { id: 'chera', label: 'Bow', tone: 6, why: 'the bow was the emblem of the Cheras' },
    { id: 'pandya', label: 'Fish', tone: 7, why: 'the fish was the emblem of the Pandyas' },
  ],
  key: {
    ask: 'Is it one of the sixteen mah\u0101janapadas?',
    yes: {
      ask: 'Does it lie in the Ganga plain?',
      yes: {
        ask: 'Was it a ga\u1E47a, a republican state?',
        yes: 'gana',
        no: 'rajya',
      },
      no: {
        ask: 'Does it lie in the north-west?',
        yes: 'nw',
        no: 'south',
      },
    },
    no: {
      ask: 'Was its emblem the tiger?',
      yes: 'chola',
      no: {
        ask: 'Was its emblem the bow?',
        yes: 'chera',
        no: 'pandya',
      },
    },
  },
  items: [
    { name: 'Kamboja', is: 'nw' },
    { name: 'Gandh\u0101ra', is: 'nw' },
    { name: 'Magadha', is: 'rajya', why: 'Magadha lay in the Ganga plain, in present-day Bihar, and a king ruled it' },
    { name: 'Kosala', is: 'rajya' },
    { name: 'V\u1E5Bijji', is: 'gana' },
    { name: 'Malla', is: 'gana' },
    { name: 'Chedi', is: 'south' },
    { name: 'Avanti', is: 'south' },
    { name: 'A\u015Bhmaka', is: 'south', why: 'A\u015Bhmaka was one of the sixteen, and it lay farthest south of them' },
    { name: 'The Cholas', is: 'chola', why: 'not one of the sixteen: the Cholas were a kingdom of the far south, and their emblem was the tiger' },
    { name: 'The Cheras', is: 'chera', why: 'not one of the sixteen: the Cheras were a kingdom of the far south, and their emblem was the bow' },
    { name: 'The Pandyas', is: 'pandya', why: 'not one of the sixteen: the Pandyas were a kingdom of the far south, and their emblem was the fish' },
  ],
};

// ---------------------------------------------------------------------------
// RESTORED 2026-10-03 during the L02 run. A parallel edit truncated this shared
// file to 0 bytes; the eight exports below were rebuilt from their own stubs
// and scene files. Treat them as reconstructions, not as the originals.
// ---------------------------------------------------------------------------

/** L03 RoyalScopeJudgeScene - ArcadeJudgeScene, doors. Seven statements, three true. */
export const ROYAL_SCOPE = {
  statements: [
    { text: 'Succession was entirely hereditary in practice.', truth: false, myth: true, why: 'there are references to kings being elected or even expelled' },
    { text: "A king judged cases of theft.", truth: true, why: 'theft is one of the cases named with abduction, robbery and adultery' },
    { text: 'A king protected people from disorder as well.', truth: true, why: 'both are named as his responsibility' },
    { text: 'Royal authority was always absolute.', truth: false, myth: true, why: 'references to elected and expelled kings suggest it was not always absolute' },
    { text: 'The word Prithivi proves a king held all that land.', truth: false, myth: true, why: 'the word expresses an ideal of authority, which can be larger than the land a king held' },
    { text: 'Monarchs thought only of their own kingdoms.', truth: false, myth: true, why: 'their awareness extended to the whole subcontinent' },
    { text: 'The oath told a king to judge strong and weak fairly.', truth: true, why: 'the Yajurveda oath advises this, along with protecting the country and doing good' },
  ],
};

/** L04 SaptangaRouteScene - ArcadeRouteScene, road. One key, three branches, seven limbs. */
export const SAPTANGA_LIMBS = {
  groups: [
    { id: 'swami', label: 'swāmi', tone: 1, why: 'the king' },
    { id: 'amitya', label: 'amātya', tone: 2, why: 'the councillors, ministers and other high officials' },
    { id: 'janapada', label: 'janapada', tone: 3, why: 'the territory of the state with the people living in it' },
    { id: 'durga', label: 'durga', tone: 4, why: 'the fortified towns and cities' },
    { id: 'kosa', label: 'koṣha', tone: 5, why: 'the treasury or the wealth of the kingdom' },
    { id: 'danda', label: 'daṇḍa', tone: 6, why: 'the forces of defence and law and order' },
    { id: 'mitra', label: 'mitra', tone: 7, why: 'the allies' },
  ],
  key: {
    ask: 'Is it inside the state?',
    yes: {
      ask: 'Is it about the people who rule and advise?',
      yes: {
        ask: 'Is it the king himself?',
        yes: 'swami',
        no: 'amitya',
      },
      no: {
        ask: 'Is it about land and the people on it?',
        yes: 'janapada',
        no: {
          ask: 'Is it about armed force?',
          yes: 'danda',
          no: {
            ask: 'Is it about walls and towns?',
            yes: 'durga',
            no: 'kosa',
          },
        },
      },
    },
    no: 'mitra',
  },
  items: [
    { name: 'An enemy army crosses the frontier', is: 'danda', why: 'the forces of defence meet this' },
    { name: 'Coins kept in a guarded store', is: 'kosa', why: 'this is the treasury, the wealth of the kingdom' },
    { name: 'Farmers and their villages', is: 'janapada', why: 'the territory of the state and its people' },
    { name: 'A walled town holds out against raiders', is: 'durga', why: 'the fortified towns and cities' },
    { name: 'A neighbouring ruler promises help in war', is: 'mitra', why: 'the allies lie outside the state' },
    { name: 'Soldiers keep law and order in a town', is: 'danda', why: 'the forces of defence and law and order' },
    { name: 'Ministers advise on a hard decision', is: 'amitya', why: 'the councillors, ministers and other high officials' },
    { name: 'The council decides while the emperor is away', is: 'amitya', myth: true, why: 'the council of ministers belongs to the amātya idea' },
    { name: 'A tax collector brings in the revenue, with guards', is: 'kosa', myth: true, why: 'the guards are there, but the matter is money' },
    { name: 'A friendly king sends an envoy', is: 'mitra', why: 'an ally stands outside the state' },
    { name: 'The one who holds supreme authority', is: 'swami', why: 'the king' },
    { name: 'A harvest fails across the villages', is: 'janapada', myth: true, why: 'the land and its people are at the heart of this' },
  ],
};

/** L05 AdminLadderOrderScene - ArcadeOrderScene, stack. Three columns of one ladder. */
export const ADMIN_LADDER_ORDER = {
  sequences: [
    { title: 'The levels of a kingdom', items: ['kingdom', 'province', 'division', 'district', 'group of villages', 'village'], why: 'villages were the lowest administrative units, and each level above them was a larger unit' },
    { title: 'The same levels, northern names', items: ['kingdom', 'bhukti', 'vi\u1E63haya', 'adhi\u1E63h\u1E6Dh\u0101na', 'vithi', 'village'], why: 'the northern names, level by level, in the same order' },
    { title: 'The same levels, southern names', items: ['kingdom', 'man\u1E0Dalam', 'ko\u1E6D\u1E6Dam / valan\u0101\u1E0Du', 'n\u0101\u1E0Du', 'pa\u1E6D\u1E6Dal\u0101 / k\u016B\u1E5Brram', 'village'], why: 'the southern names, level by level, in the same order' },
  ],
};

/** L06 AdminUnitMatchScene - ArcadeMatchScene, bubbles. Twelve terms to levels. */
export const ADMIN_UNIT_MATCH = {
  pairs: [
    { prompt: 'man\u1E0Dalam', answer: 'province', group: 'south', why: 'a province in the south, and at the top of the Chola list too' },
    { prompt: 'valan\u0101\u1E0Du (Chola)', answer: 'district (Chola)', group: 'chola', why: 'in the Chola list a valan\u0101\u1E0Du is a district; in the 300 to 800 CE list it is a division' },
    { prompt: 'n\u0101\u1E0Du (Chola)', answer: 'group of villages (Chola)', group: 'chola', why: 'in the Chola list a n\u0101\u1E0Du is a group of villages; in the 300 to 800 CE list it is a district' },
    { prompt: 'Ur', answer: 'single village', group: 'chola', why: 'an individual village in the Chola list, with its own assembly' },
    { prompt: 'bhukti', answer: 'province (north)', group: 'north', why: 'the northern name for a province' },
    { prompt: 'man\u1E0Dala', answer: 'province (south)', group: 'south', why: 'another southern name for a province, with man\u1E0Dalam' },
    { prompt: 'vi\u1E63haya', answer: 'division (north)', group: 'north', why: 'the northern name for a division, with bhoga' },
    { prompt: 'ko\u1E6D\u1E6Dam', answer: 'division (south)', group: 'south', why: 'a southern name for a division, with valan\u0101\u1E0Du' },
    { prompt: 'adhi\u1E63h\u1E6Dh\u0101na', answer: 'district (north)', group: 'north', why: 'the northern name for a district, with pa\u1E6D\u1E6Dana' },
    { prompt: 'vithi', answer: 'group of villages (north)', group: 'north', why: 'the northern name for a group of villages, like a modern tahs\u012Bl' },
    { prompt: 'gr\u0101mika', answer: 'village headman', group: 'person', why: 'a person, and no level: the headman of a village' },
    { prompt: 'variyam', answer: 'village committee', group: 'person', why: 'a body, and no level: a small committee for one task' },
  ],
};

/** L07 DharmaMythJudgeScene - ArcadeJudgeScene, cards. Eight statements, three false. */
export const DHARMA_TERMS = {
  statements: [
    { text: 'In these texts, dharma simply means religion.', truth: false, myth: true, why: 'here dharma refers to duty, obligation, righteousness and moral conduct' },
    { text: 'The P\u0101li word dhamma expresses similar ideas.', truth: true, why: 'dhamma is the P\u0101li equivalent of the Sanskrit word dharma' },
    { text: 'Satya is the name of a Vedic king.', truth: false, myth: true, why: 'satya means real, true: the Vedas use it of the one supreme consciousness' },
    { text: 'Dharma and dharati share a root.', truth: true, why: 'both come from the Sanskrit root dhri; dharati is the earth' },
    { text: 'Samatva is the principle of sameness.', truth: true, why: 'all bodies are made of the same matter, and all forms of consciousness are manifestations of one supreme consciousness' },
    { text: '\u1E5Aita means the tax paid by a village.', truth: false, myth: true, why: '\u1E5Bita is an all-pervading cosmic order: harmony and balance in nature and in human society' },
    { text: 'Duties depend on a person\'s role.', truth: true, why: 'dharma asks for duties according to roles and responsibilities in society' },
    { text: 'Bhishma says dharma is that which upholds beings.', truth: true, why: 'the line comes from the Mah\u0101bh\u0101rata' },
  ],
};

/** L08 VarnaSortScene - ArcadeSortScene, sky. Twelve tasks, four var\u1E47as, as the texts describe them. */
export const VARNA_TASKS = {
  groups: [
    { id: 'brahmana', label: 'br\u0101hma\u1E47a', tone: 1, why: 'study and teach, yaj\u00F1as, give and receive d\u0101na' },
    { id: 'kshatriya', label: 'k\u1E63hatriya', tone: 2, why: 'warfare, protection, justice, social order' },
    { id: 'vaisya', label: 'vai\u015Bhya', tone: 3, why: 'agriculture, pastoralism, trade' },
    { id: 'shudra', label: '\u015Bh\u016Bdra', tone: 4, why: 'assist the other var\u1E47as' },
  ],
  items: [
    { name: 'Study and teach the Vedas', is: 'brahmana', why: 'the br\u0101hma\u1E47as were mainly expected to study and teach the Vedas and other sacred texts' },
    { name: 'Officiate at a yaj\u00F1a', is: 'brahmana', why: 'the texts expected br\u0101hma\u1E47as to perform and officiate at yaj\u00F1as' },
    { name: 'Give and receive d\u0101na', is: 'brahmana', why: 'giving and receiving d\u0101na (gifts) is named for the br\u0101hma\u1E47as' },
    { name: 'Warfare and protection', is: 'kshatriya', why: 'Rajanya (K\u1E63hatriyas) were tasked with warfare and protecting people' },
    { name: 'Administer justice', is: 'kshatriya', why: 'administering justice is named for the K\u1E63hatriyas' },
    { name: 'Uphold social order', is: 'kshatriya', why: 'the texts also expected them to uphold social order' },
    { name: 'Sponsor yaj\u00F1as', is: 'kshatriya', myth: true, why: 'the K\u1E63hatriyas were expected to sponsor yaj\u00F1as and make donations' },
    { name: 'Agriculture', is: 'vaisya', why: 'Vai\u015Bhyas were associated with agriculture, pastoralism and trade' },
    { name: 'Pastoralism', is: 'vaisya', why: 'pastoralism means keeping herds' },
    { name: 'Trade', is: 'vaisya', why: 'trade is named for the Vai\u015Bhyas' },
    { name: 'Assist the other var\u1E47as', is: 'shudra', why: '\u015Ah\u016Bdras were expected to assist the other var\u1E47as' },
    { name: 'In practice, also crafts', is: 'shudra', myth: true, why: 'in practice \u015Ah\u016Bdras were also engaged in agriculture, animal husbandry, trade, and arts and crafts' },
  ],
};

/** L10 LiteraryShelfMatchScene - ArcadeMatchScene, range. Five shelves. */
export const LITERARY_SHELF = {
  pairs: [
    { prompt: "Pāṇini's Aṣhṭādhyāyī", answer: 'foundational texts for Sanskrit grammar', group: 'grammar', why: 'a foundational text for Sanskrit grammar' },
    { prompt: "Piṅgala's Chhandaśhāstra", answer: 'foundational texts for Sanskrit grammar', group: 'grammar', why: 'listed with the foundational texts for Sanskrit grammar' },
    { prompt: "Patañjali's Mahābhāṣhya", answer: 'foundational texts for Sanskrit grammar', group: 'grammar', why: 'grammar work, on the same shelf as Pāṇini' },
    { prompt: 'The Manu-smṛiti', answer: 'smṛiti literature - dharma, law and ethics', group: 'smriti', why: 'smṛiti texts deal with dharma, law and ethics' },
    { prompt: 'The Yājñavalkya Smṛiti', answer: 'smṛiti literature - dharma, law and ethics', group: 'smriti', why: 'dharma, law and ethics' },
    { prompt: 'The Nārada Smṛiti', answer: 'smṛiti literature - dharma, law and ethics', group: 'smriti', why: 'law and ethics, not grammar' },
    { prompt: 'The Viṣhṇu Smṛiti', answer: 'smṛiti literature - dharma, law and ethics', group: 'smriti', myth: true, why: 'the name holds a god, but this smṛiti deals with dharma, law and ethics' },
    { prompt: 'The Charakasamhitā', answer: 'classical works on medicine', group: 'medicine', why: 'a classical work on medicine' },
    { prompt: 'The Suśhrutasamhitā', answer: 'classical works on medicine', group: 'medicine', why: 'a classical work on medicine' },
    { prompt: "Kālidāsa's Raghuvaṃśha", answer: 'Sanskrit poetry and kāvya', group: 'kavya', why: 'Sanskrit poetry by Kālidāsa' },
    { prompt: "Kālidāsa's Kumārasambhava", answer: 'Sanskrit poetry and kāvya', group: 'kavya', why: 'Sanskrit poetry by Kālidāsa' },
    { prompt: "Tiruvalluvar's Tirukkural", answer: 'Tamil literature', group: 'tamil', why: 'Tamil literature, not Sanskrit' },
    { prompt: 'The Silappadikāram', answer: 'Tamil literature', group: 'tamil', myth: true, why: 'a Tamil epic, so it sits apart from Sanskrit poetry' },
    { prompt: 'Praise sung to Viṣhṇu or Śhiva, open to all', answer: 'Bhakti', group: 'practice', myth: true, why: 'a devotional practice: a direct connection with the gods, without elaborate Vedic ritual' },
    { prompt: 'Control of the senses and purity of self, cultivated by the pupil', answer: 'the inner values of education', group: 'practice', myth: true, why: 'inner values cultivated by education, along with truth, patience and humility' },
  ],
};

/** L11 TradeRouteOrderScene - ArcadeOrderScene, train. A road and a farming calendar. */
export const TRADE_AND_FARM_ORDER = {
  sequences: [
    { title: 'The Dakṣhiṇāpatha, north to south', items: ['Kauśhāmbī', 'Vidiśhā', 'Ujjayinī', 'Pratiṣhṭhāna', 'Suvarṇagiri'], why: 'read the cities from north to south on the map of early routes' },
    { title: "A crop's year: field to harvest", items: ['preparing the fields', 'sowing', 'weeding', 'watering', 'reaping'], why: 'the field is ready before seed goes in, and the crop must grow before it is cut' },
    { title: "A crop's year: harvest to store", items: ['threshing', 'winnowing', 'storing'], why: 'grain comes off the stalk, then the chaff is blown away, then the clean grain is stored' },
  ],
};
