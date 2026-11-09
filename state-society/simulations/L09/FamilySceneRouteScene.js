import { ArcadeRouteScene } from 'simulations/base/kit/ArcadeRouteScene.js';
import { LIFE_STAGE_KEY, PURUSARTHA_KEY } from '../L01/StateSocietyDeck.js';

// Twelve life situations run down one road to one of the four stages of life or one of
// the four goals of life. Road skin - a deliberate archetype repeat with L04's
// SaptangaRouteScene. Taught by L09 s01 and s02.
// The engine's key is one yes/no chain, so the deck's two keys become one tree whose
// ROOT is the distinction the two slides are two slides apart on: is this situation
// about a stage a person is in, or a goal a life is for? The eight ends are drawn
// interleaved, so the two lists look the same on screen and neither one's colour hints
// which list an item belongs to.
const DECK = {
  groups: [
    LIFE_STAGE_KEY.groups[0], PURUSARTHA_KEY.groups[0],
    LIFE_STAGE_KEY.groups[1], PURUSARTHA_KEY.groups[1],
    LIFE_STAGE_KEY.groups[2], PURUSARTHA_KEY.groups[2],
    LIFE_STAGE_KEY.groups[3], PURUSARTHA_KEY.groups[3],
  ],
  items: [...LIFE_STAGE_KEY.items, ...PURUSARTHA_KEY.items],
  key: {
    ask: 'Is this about a stage of life, or a goal of life?',
    yes: LIFE_STAGE_KEY.key,
    no: PURUSARTHA_KEY.key,
  },
};

export class FamilySceneRouteScene extends ArcadeRouteScene {
  static ARIA_LABEL =
    'Key run: a life situation runs through yes/no gates to one of the four stages of life or one of the four '
    + 'goals of life. The first gate asks which of the two lists it belongs to, because the two lists have the same '
    + 'shape and are taught two slides apart.';
  static CONFIG = {
    ...DECK,
    title: 'Stage or goal? Run the key',
    how: 'Four stages, four goals, one road. The first gate asks which list it belongs to.',
    skin: 'road',
    rounds: 8,
    gate: 6,
  };
}
