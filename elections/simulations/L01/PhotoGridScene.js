// PhotoGridScene - L01 s06, Fig 7.2 as a plain grid of six captioned photographs, one pair lit a beat:
// three columns on a wide stage, three rows on a phone. b2 adds the count. All photographs: Election Commission of India,
// GODL-India (media/L01/photo-credits.txt).
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS } from 'simulations/base/kit/SimLookDom.js';
import { esc } from 'simulations/base/SimUi.js';

const m = (idx) => [{ idx, dwellMs: null }];
const url = (f) => new URL(`../../media/L01/${f}`, import.meta.url).href;
const PHOTOS = [
  { f: 'young-voter-showing-ink-mark-kerala.jpg', cap: 'Kerala: ink and card', alt: 'A young voter in Kerala holds up her inked finger and her voter identity card outside a polling booth.' },
  { f: 'voters-taking-a-selfie-west-bengal.jpg', cap: 'West Bengal: a photo of the ink', alt: 'Two women in West Bengal hold out a phone to photograph the ink on their fingers.' },
  { f: 'voters-showing-photo-identity-cards-delhi.jpg', cap: 'Delhi: photo voter cards', alt: 'Women in a queue at a polling booth in Delhi hold up their photo voter cards.' },
  { f: 'elderly-voter-at-village-booth-west-bengal.jpg', cap: 'West Bengal: a village booth', alt: 'A polling officer marks the finger of an elderly man in a village schoolroom in West Bengal, while voters wait behind him.' },
  { f: 'official-checking-evm-delhi.jpg', cap: 'Delhi: checking a machine', alt: 'Election officials check an electronic voting machine before polling opens in Delhi.' },
  { f: 'elderly-voter-in-wheelchair-chhattisgarh.jpg', cap: 'Chhattisgarh: by wheelchair', alt: 'A voter in a wheelchair is pushed along a dirt track to a polling station in Chhattisgarh.' },
];
const CSS = `
.pg { display: flex; flex-direction: column; gap: 10px; padding: 12px; box-sizing: border-box; height: 100%; }
.pg-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); grid-auto-flow: column; gap: 10px; flex: 1 1 auto; min-height: 0; }
.sim-dom-root--portrait .pg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(3, minmax(0, 1fr)); grid-auto-flow: row; }
.pg-fig { margin: 0; display: flex; flex-direction: column; min-height: 0; background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); overflow: hidden;
  box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); transition: opacity 0.3s ease; }
.pg-fig img { display: block; width: 100%; flex: 1 1 0; min-height: 0; object-fit: cover; object-position: center 25%; }
.pg-fig figcaption { flex: none; padding: 4px 6px 5px; font: 800 16px/1.15 var(--sim-font); color: var(--sim-label); text-align: center; }
.sim-dom-root--portrait .pg-fig figcaption { font-size: 14px; }
.sim-dom-root[data-step="0"] .pg-fig[data-row="1"], .sim-dom-root[data-step="0"] .pg-fig[data-row="2"],
.sim-dom-root[data-step="1"] .pg-fig[data-row="0"], .sim-dom-root[data-step="1"] .pg-fig[data-row="2"],
.sim-dom-root[data-step="2"] .pg-fig[data-row="0"], .sim-dom-root[data-step="2"] .pg-fig[data-row="1"] { opacity: 0.32; }
.sim-dom-root[data-step="0"] .pg-fig[data-row="0"], .sim-dom-root[data-step="1"] .pg-fig[data-row="1"], .sim-dom-root[data-step="2"] .pg-fig[data-row="2"] { border-color: var(--sim-gold); }
.pg-count { flex: none; margin: 0; text-align: center; font: 700 19px/1.2 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.pg-credit { flex: none; margin: 0; text-align: center; font: 700 14px/1.2 var(--sim-font); color: var(--sim-label-muted); }
`;

export class PhotoGridScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 453;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 620;
  static CONTROLS = [];
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static ARIA_LABEL = 'Six photographs of voters across India, in pairs: ink and a voter card in Kerala, friends photographing ink in West Bengal, voter cards in Delhi, a village polling station in West Bengal, officials checking a machine in Delhi, and a voter in a wheelchair in Chhattisgarh.';

  async setup() {
    await super.setup();
    this.render({ css: SIM_LOOK_DOM_CSS + CSS, html: `<div class="pg"><div class="pg-grid">${PHOTOS.map((p, i) => `<figure class="pg-fig" data-row="${Math.floor(i / 2)}"><img src="${esc(url(p.f))}" alt="${esc(p.alt)}" loading="eager"><figcaption>${esc(p.cap)}</figcaption></figure>`).join('')}</div><p class="pg-count">Over 96.8 crore eligible voters in 2024</p><p class="pg-credit">Photographs: Election Commission of India (GODL-India), Wikimedia Commons</p></div>` });
  }
}
