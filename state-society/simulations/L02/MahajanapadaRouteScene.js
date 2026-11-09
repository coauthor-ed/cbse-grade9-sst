import { ArcadeRouteScene } from 'simulations/base/kit/ArcadeRouteScene.js';
import { MAHAJANAPADA_ROUTES } from '../L01/StateSocietyDeck.js';

// Where does it sit? The deck's key as a railway: one of the sixteen or not, then region and form
// of state on one track, emblem on the other. The map in L02 teaches all of it. Rail skin.
export class MahajanapadaRouteScene extends ArcadeRouteScene {
  static ARIA_LABEL = 'Key line: each name rides a railway of yes/no signals - is it one of the sixteen mahajanapadas, does it lie in the Ganga plain, was it a gana, or was its emblem the tiger or the bow - to reach its place: north-west, Ganga plain, south of the Yamuna, or one of three emblems of the far south.';
  static CONFIG = { ...MAHAJANAPADA_ROUTES, title: 'Where does it sit?', skin: 'rail', rounds: 8 };
}
