// EciAppsScene - blk-l05-s04. Fig. 7.6 as three in-scene tabs, one group in view. The beat sets the
// group; a tap changes it. Kit tones carry no meaning beyond telling the groups apart.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS } from 'simulations/base/kit/SimLookDom.js';
import { tapLight, TAP_LIGHT_CSS } from 'simulations/base/kit/TapLight.js';
import { esc } from 'simulations/base/SimUi.js';

const GROUPS = [
  { id: 'cand', label: 'Candidates', tone: 7, apps: [{ n: 'Suvidha', j: 'Nomination forms, permissions for rallies and vehicles, and their status' }] },
  { id: 'off', label: 'Officials', tone: 5, apps: [{ n: 'ERONET', j: 'Form-processing, databases and E-Rolls' }, { n: 'Sugam', j: 'Vehicles taken from other departments for election work' }] },
  { id: 'vot', label: 'Voters', tone: 3, apps: [{ n: 'ETPBS', j: 'Postal ballots for service voters' }, { n: 'Voter Helpline', j: 'Registration, transposition, verification, election news' }, { n: 'Saksham', j: 'PwDs register and find a polling station' }, { n: 'cVIGIL', j: 'Report a violation within minutes' }] },
];
const CHIPS = GROUPS.map((g) => ({ id: g.id, label: g.label, targets: [g.id], tone: g.tone }));
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const PRESET = [null, 'cand', 'off', 'vot'];

// A phone whose screen holds one tile per service, tile colour for the group, first letter of the service.
const phone = (groups) => `<div class="ea-phone" aria-hidden="true"><i class="ea-speaker"></i><div class="ea-screen">${groups.flatMap((g) => g.apps.map((a) => `<b class="ea-app" style="--c:var(--sim-series-${g.tone})">${esc(a.n[0])}</b>`)).join('')}</div><i class="ea-home"></i></div>`;

const CSS = `
.ea-pic { display: flex; justify-content: center; }
.ea-phone { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 92px; height: 176px; box-sizing: border-box; padding: 8px 7px; border-radius: 16px; background: var(--sim-label); box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-label) 60%, var(--sim-bg-surface)); }
.ea-speaker { width: 22px; height: 4px; border-radius: 2px; background: var(--sim-waste); }
.ea-home { width: 30px; height: 4px; border-radius: 2px; background: var(--sim-waste); }
.ea-screen { flex: 1; width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 28px; align-content: center; gap: 6px; padding: 6px; box-sizing: border-box; border-radius: 6px; background: var(--sim-bg-surface); }
.ea-app { display: flex; align-items: center; justify-content: center; border-radius: 7px; font: 700 15px/1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); background: color-mix(in oklab, var(--c) 45%, var(--sim-bg-surface)); border: calc(2px * var(--look-rim)) solid var(--c); }
.ea-phone:has(.ea-app:nth-child(5)) .ea-screen { grid-auto-rows: 24px; gap: 4px; padding: 4px; }
.ea { display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; padding: 4px 12px 10px; font-family: var(--sim-font); color: var(--sim-label); }
.ea-body { display: grid; grid-template-columns: 100px minmax(0, 1fr); gap: 12px; align-items: center; min-height: 300px; padding: 12px; box-sizing: border-box; background: color-mix(in oklab, var(--c, var(--sim-accent)) 10%, var(--sim-bg-surface)); border: calc(3px * var(--look-rim)) solid var(--c, var(--sim-stroke));
  border-radius: var(--sim-radius-lg); box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--c, var(--sim-stroke)) 60%, var(--sim-label)); }
.ea-list { display: grid; gap: 8px; min-width: 0; }
.ea-card { padding: 8px 12px 10px; background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--c, var(--sim-stroke)); border-radius: var(--sim-radius-md); animation: ea-in 0.32s var(--look-spring) both; animation-delay: var(--d, 0s); min-width: 0; }
.ea-card b { display: block; font: 700 21px/1.15 var(--sim-font-display, var(--sim-font)); }
.ea-card span { display: block; font: 700 15px/1.25 var(--sim-font); }
.ea-count { font: 700 26px/1.15 var(--sim-font-display, var(--sim-font)); }
.ea-hub { display: grid; gap: 10px; min-width: 0; }
.ea-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 14px; background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--c); border-radius: var(--sim-radius-md); font: 700 20px/1.1 var(--sim-font-display, var(--sim-font)); }
.ea-row b { font: 700 30px/1 var(--sim-font-display, var(--sim-font)); }
.sim-dom-root--portrait .ea-body { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .ea-pic { display: none; }
.sim-dom-root--portrait .ea-body[data-few] .ea-pic { display: flex; justify-self: center; }
.sim-dom-root--portrait .ea-body[data-hub] { grid-template-columns: 96px minmax(0, 1fr); gap: 8px; padding: 10px 8px; }
.sim-dom-root--portrait .ea-body[data-hub] .ea-pic { display: flex; }
.ea-body[data-few] .ea-card b { font-size: 26px; }
.ea-body[data-few] .ea-card span { font-size: 17px; }
@keyframes ea-in { from { transform: translateY(8px) scale(0.97); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ea-card { animation: none; } }
`;

export class EciAppsScene extends DomSimulation {
  static WIDTH = 620;
  static HEIGHT = 430;
  static PORTRAIT_WIDTH = 348;
  static PORTRAIT_HEIGHT = 590;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Seven digital services of the Election Commission in three groups: candidates, election officials and voters. Tapping a group shows its services and what each does.';

  tl = tapLight({ label: 'Groups', chips: CHIPS, onChange: () => this.paint(), announce: () => {} });

  async setup() {
    this.bt = -1;
    await super.setup();
    this.render({ css: SIM_LOOK_DOM_CSS + TAP_LIGHT_CSS + CSS, html: '<div class="ea"><div data-chips></div><div data-body></div></div>' });
    this.onBeatChange(0, 4);
  }

  onBeatChange(beat) {
    const b = Math.max(0, Math.min(3, Math.trunc(beat) || 0));
    this.root.dataset.beat = String(b);
    if (b === this.bt) return;
    this.bt = b;
    if (!this.mounted) { const host = this.root.querySelector('[data-chips]'); if (host) { this.tl.mount(host, this); this.mounted = true; } }
    this.tl.set({ lit: PRESET[b] });
    this.paint();
  }

  paint() {
    const host = this.root.querySelector('[data-body]');
    if (!host) return;
    const g = GROUPS.find((d) => d.id === this.tl.chip()?.id);
    if (!g) {
      host.innerHTML = `<div class="ea-body" data-hub><div class="ea-pic">${phone(GROUPS)}</div><div class="ea-hub"><div class="ea-count">Seven services</div>${GROUPS.map((d) => `<div class="ea-row" style="--c:var(--sim-series-${d.tone})"><span>${esc(d.label)}</span><b>${d.apps.length}</b></div>`).join('')}</div></div>`;
    } else {
      host.innerHTML = `<div class="ea-body"${g.apps.length < 3 ? ' data-few' : ''} style="--c:var(--sim-series-${g.tone})"><div class="ea-pic">${phone([g])}</div><div class="ea-list" aria-live="polite">${g.apps.map((a, i) => `<div class="ea-card" style="--d:${i * 0.07}s"><b>${esc(a.n)}</b><span>${esc(a.j)}</span></div>`).join('')}</div></div>`;
    }
    this.relayout?.();
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
