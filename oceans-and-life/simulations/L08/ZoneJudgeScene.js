import { ArcadeJudgeScene } from 'simulations/base/kit/ArcadeJudgeScene.js';
import { ZONE_RIGHTS } from '../L01/OceansDeck.js';

// Claims about the sea zones and the rights in them, called true or false.
// Swipe-card skin.
export class ZoneJudgeScene extends ArcadeJudgeScene {
  static ARIA_LABEL = 'True or false about the sea zones: one claim about the sea bands and the rights in them at a time; swipe right for true, left for false, or tap the buttons.';
  static CONFIG = { ...ZONE_RIGHTS, title: 'True or false?', skin: 'cards', rounds: 10 };

  // The kit's attract demo tilts a long claim until its lines overlap, so the
  // menu shows two plain tokens instead.
  menuDemo = undefined;
  menuSample() { return ['True', 'False'].map((name) => ({ name, art: false })); }
}
