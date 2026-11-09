// ProcessInstitutionScene - L04 s09. The seven rows of the table, one at a time at a readable size.
// Tap a process: its institutions and its values show, word for word. b0 the first three, b1 the other four.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS } from 'simulations/base/kit/SimLookDom.js';
import { tapLight, TAP_LIGHT_CSS } from 'simulations/base/kit/TapLight.js';
import { civicHtml, CIVIC_CSS } from '../shared/CivicArt.js';
import { esc } from 'simulations/base/SimUi.js';

const m = (idx) => [{ idx, dwellMs: null }];
const ROWS = [
  { id: 'leg', label: 'Legislative', name: 'Legislative Process', inst: 'Legislature (Parliament, State legislature, and Local bodies)', vals: ['Representation', 'Deliberation', 'Dissent'], art: 'parliament', tone: 1 },
  { id: 'ele', label: 'Electoral', name: 'Electoral Process', inst: 'Election Commission of India', vals: ['Participation', 'Equality'], art: 'ballotBox', tone: 2 },
  { id: 'jud', label: 'Judicial', name: 'Judicial Process', inst: 'Courts', vals: ['Rule of law', 'Equality', 'Justice'], art: 'court', tone: 5 },
  { id: 'par', label: 'Participatory', name: 'Participatory Processes', inst: 'Media, Civil Society', vals: ['Debate and discussion', 'Freedom of expression'], art: 'newspaper', tone: 3 },
  { id: 'acc', label: 'Accountability', name: 'Accountability Mechanisms', inst: 'CAG, CIC, Lokpal, CVC', vals: ['Transparency'], art: 'bookOpen', tone: 6 },
  { id: 'dec', label: 'Decentralisation', name: 'Decentralisation', inst: 'Rural and Urban local bodies', vals: ['People\u2019s participation at grassroots level'], art: 'square', tone: 7 },
  { id: 'fed', label: 'Federalism', name: 'Federalism', inst: 'Division of powers between the centre and the states is guaranteed through a written constitution', vals: ['Devolution of power'], art: 'book', tone: 8 },
];
const chipsFor = (rows) => rows.map((r) => ({ id: r.id, label: r.label, targets: [r.id], tone: r.tone }));

const CSS = `
.pi { display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box; padding: 6px 14px 10px; font-family: var(--sim-font); color: var(--sim-label); }
.pi-card { --c: var(--sim-series-1); flex: 1 1 auto; position: relative; min-height: 0; padding: 12px 18px; box-sizing: border-box; overflow: hidden;
  background: color-mix(in oklab, var(--c) 10%, var(--sim-bg-surface)); border: calc(3px * var(--look-rim)) solid var(--c); border-radius: var(--sim-radius-lg); box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--c) 60%, var(--sim-label)); }
.sim-dom-root[data-beat="0"] .pi-card { min-height: 300px; }
.pi-card { display: flex; flex-direction: column; justify-content: center; }
.pi-pic { position: absolute; right: 14px; top: 8px; width: 92px; }
.pi-card h3 { margin: 0 130px 6px 0; font: 700 32px/1.1 var(--sim-font-display, var(--sim-font)); }
.pi-inst { margin: 0 0 10px 0; font: 700 28px/1.2 var(--sim-font); }
.pi-vals { display: flex; flex-wrap: wrap; gap: 8px; }
.pi-val { padding: 2px 14px; border-radius: var(--look-pill); font: 800 28px/1.25 var(--sim-font); background: color-mix(in oklab, var(--c) 30%, var(--sim-bg-surface)); box-shadow: 0 calc(2px * var(--look-lip)) 0 color-mix(in oklab, var(--c) 60%, var(--sim-label)); }
.pi-enter { animation: pi-in 0.34s var(--look-spring) both; }
@keyframes pi-in { from { transform: translateY(8px) scale(0.98); opacity: 0.2; } }
@media (prefers-reduced-motion: reduce) { .pi-enter { animation: none; } }
`;

export class ProcessInstitutionScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 453;
  static PORTRAIT_WIDTH = 680;
  static PORTRAIT_HEIGHT = 453;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'Seven democratic processes on chips. Tapping one shows its institutions and its democratic values.';

  tl = tapLight({ label: 'Democratic processes', chips: chipsFor(ROWS.slice(0, 3)), onChange: () => this.paint() });

  async setup() {
    await super.setup();
    this.bt = -1;
    this.render({ css: SIM_LOOK_DOM_CSS + TAP_LIGHT_CSS + CIVIC_CSS + CSS, html: '<div class="pi"><div data-chips></div><div class="pi-card" data-card aria-live="polite"></div></div>' });
    const host = this.root.querySelector('[data-chips]');
    if (host) this.tl.mount(host, this);
    this.onBeatChange(0, 2);
  }

  onBeatChange(beat) {
    const b = Math.max(0, Math.min(1, Math.trunc(beat) || 0));
    this.root.dataset.beat = String(b);
    if (b === this.bt) return;
    this.bt = b;
    this.tl.set({ chips: chipsFor(b === 0 ? ROWS.slice(0, 3) : ROWS.slice(3)), lit: b === 0 ? 'leg' : 'par' });
    this.paint();
  }

  paint() {
    const r = ROWS.find((x) => x.id === this.tl.chip()?.id) ?? ROWS[this.bt === 0 ? 0 : 3];
    const card = this.root.querySelector('[data-card]');
    if (!card) return;
    card.style.setProperty('--c', `var(--sim-series-${r.tone})`);
    card.innerHTML = `<div class="pi-pic pi-enter">${r.id === 'fed' ? '' : civicHtml(r.art, { size: r.art === 'newspaper' || r.art === 'book' || r.art === 'ballotBox' ? 56 : 92 })}</div>
      <div class="pi-enter"><h3>${esc(r.name)}</h3><p class="pi-inst">${esc(r.inst)}</p><div class="pi-vals">${r.vals.map((v) => `<span class="pi-val">${esc(v)}</span>`).join('')}</div></div>`;
    this.relayout?.();
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
