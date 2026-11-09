import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { AIR_CONTENTS_SORT } from './AtmosphereClimateDeck.js';

// What is in the air, sorted into three crates: catch-and-sort, conveyor-belt skin.
export class AirContentsSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Air sorter: things in the air ride a conveyor belt one at a time; tap the crate each belongs in: main gases, gases in tiny amounts, or not a gas.';
  static CONFIG = { ...AIR_CONTENTS_SORT, title: 'Sort the air', skin: 'belt', rounds: 12 };
}
