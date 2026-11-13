import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { FUNCTIONAL_AREAS } from './StartupsDeck.js';

export class FunctionalAreaSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Bakery departments: tasks ride the conveyor belt; sort each task into Operations, Finance, Human Resources, or Marketing before it falls.';
  static CONFIG = { ...FUNCTIONAL_AREAS, title: 'Bakery departments', skin: 'belt', rounds: 12 };
}
