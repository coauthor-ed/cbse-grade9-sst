import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { CAMPAIGN_ACTIONS } from '../L01/ElectionsDeck.js';

// Allowed, or an Offence? - sort each campaign action.
export class CampaignActionSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Allowed or an offence: one campaign action falls at a time; tap the bin it belongs in, allowed or an electoral offence.';
  static CONFIG = { ...CAMPAIGN_ACTIONS, title: 'Allowed, or an Offence?', skin: 'sky', rounds: 8 };
  menuSample() { return ['allowed', 'an electoral offence'].map((name) => ({ name, art: false })); }
}
