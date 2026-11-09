import { ArcadeMatchScene } from 'simulations/base/kit/ArcadeMatchScene.js';
import { PARTY_CLASSES } from '../L06/ElectionsDeckC.js';

// Class Range - a made-up party's record waits at the counter; hit the target with its class and route (L07 arcade).
// File and class name kept. No real party, no symbol.
export class PartySymbolMatchScene extends ArcadeMatchScene {
  static ARIA_LABEL = 'Class Range: a made-up party record waits at the counter; hit the target that names its class and route.';
  static CONFIG = { ...PARTY_CLASSES, title: 'Class Range', skin: 'range', rounds: 5, choices: 4 };
  menuSample() { return ['National', 'State', 'Unrecognised'].map((name) => ({ name, art: false })); }
}
