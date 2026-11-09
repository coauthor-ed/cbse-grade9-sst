// ThreeArmsGame - L04 close. The learner gives three jobs to three offices; three cases then run
// against that plan. A plan that keeps any two jobs in one office lets one case through.
// Control names: [data-job=make|run|judge][data-office=A|B|C], the Check button .gm-check.
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { SIM_LOOK_DOM_CSS, burst } from 'simulations/base/kit/SimLookDom.js';

const OFFICES = ['A', 'B', 'C'];
const JOBS = [{ id: 'make', text: 'Makes laws' }, { id: 'run', text: 'Implements laws' }, { id: 'judge', text: 'Interprets laws' }];
const CASES = [
  { text: 'A law goes against the Constitution.', a: 'judge', b: 'make', yes: 'A separate office declares it unconstitutional.', no: 'The office that wrote it also judges it, so the law stands.' },
  { text: 'An officer misuses a power.', a: 'judge', b: 'run', yes: 'A separate office reviews what the officer did.', no: 'The office that acted also judges itself.' },
  { text: 'An agency wants to write its own rules.', a: 'make', b: 'run', yes: 'A separate office frames the rules it must follow.', no: 'The office that enforces rules also writes them.' },
];

const CSS = `
.ta .kicker { display: none; }
.gm.ta { background: color-mix(in oklab, var(--sim-bg-surface) 90%, var(--sim-gold)); border-radius: var(--sim-radius-lg); }
.ta .ta-board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 470px minmax(0, 1fr); grid-template-areas: 'plan cases' 'plan go'; gap: 8px 16px; align-items: start; }
.ta .ta-plan { grid-area: plan; }
.ta .ta-cases { grid-area: cases; }
.ta .ta-go { grid-area: go; }
.ta .ta-go .gm-check { width: 100%; }
.ta .ta-grid { display: grid; gap: 8px; }
.ta .ta-row { display: grid; grid-template-columns: 150px repeat(3, minmax(0, 1fr)); gap: 8px; align-items: center; }
.ta .ta-job { font: 800 16px/1.2 var(--sim-font); }
.ta .ta-head { font: 800 15px/1.1 var(--sim-font); color: var(--sim-label-muted); text-align: center; }
.ta .ta-office { min-height: 50px; border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font: 700 21px var(--sim-font-display, var(--sim-font)); }
.ta .ta-office[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 36%, var(--sim-bg-surface)); border-color: var(--sim-accent); }
.ta .ta-cases { display: grid; gap: 8px; }
.ta .ta-case { display: grid; gap: 2px; padding: 8px 12px; min-height: 48px; background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.ta .ta-case p { margin: 0; font: 800 16px/1.25 var(--sim-font); }
.ta .ta-case:not([data-s]) small { display: none; }
.ta .ta-case small { font: 700 15px/1.25 var(--sim-font); color: var(--sim-label-muted); }
.ta .ta-case[data-s="yes"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); }
.ta .ta-case[data-s="no"] { border-color: var(--sim-bad); background: color-mix(in oklab, var(--sim-bad) 12%, var(--sim-bg-surface)); }
.ta .ta-case[data-s] small { color: var(--sim-label); }
.sim-dom-root--portrait .ta .ta-board { display: flex; flex-direction: column; align-items: stretch; gap: 10px; }
.sim-dom-root--portrait .ta .ta-cases { order: 3; }
.sim-dom-root--portrait .gm.ta { padding: 6px 6px 8px; }
.sim-dom-root--portrait .ta .sub { padding-right: 52px; }
.sim-dom-root--portrait .ta .ta-row { grid-template-columns: 100px repeat(3, minmax(0, 1fr)); gap: 6px; }
.sim-dom-root--portrait .ta .ta-job { font-size: 15px; }
`;

export class ThreeArmsGame extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Give three jobs to three offices. Then run three cases, and see if your plan catches all of them.' } };
  static ARIA_LABEL = 'Give each of three jobs, making, implementing and interpreting laws, to office A, B or C. Three cases then run against the plan.';

  async setup() {
    await super.setup();
    this.pick = { make: null, run: null, judge: null }; this.ran = false;
    mountGame(this, { check: { label: 'Run the three cases', in: '[data-go]' }, css: SIM_LOOK_DOM_CSS + CSS, html: `<div class="gm ta"><div class="gm-head"><p class="kicker">Separation of powers</p><h2>Who does which job?</h2><p class="sub">One office can hold two jobs. Try it.</p></div>
      <div class="ta-board"><div class="ta-plan"><div class="ta-grid"><div class="ta-row"><span></span>${OFFICES.map((o) => `<span class="ta-head">Office ${o}</span>`).join('')}</div>
      ${JOBS.map((j) => `<div class="ta-row" role="group" aria-label="${j.text}"><span class="ta-job">${j.text}</span>${OFFICES.map((o) => `<button type="button" class="tap ta-office" data-job="${j.id}" data-office="${o}" aria-label="${j.text}: office ${o}" aria-pressed="false">${o}</button>`).join('')}</div>`).join('')}</div></div><div class="ta-go" data-go></div>
      <div class="ta-cases">${CASES.map((c, i) => `<div class="ta-case" data-case="${i}"><p>${c.text}</p><small data-res="${i}">Waiting for your plan.</small></div>`).join('')}</div></div></div>` });
    if (!this.root.querySelector('[data-job]')) return;
    this.root.querySelectorAll('[data-job]').forEach((b) => onTap(b, () => { this.pick[b.dataset.job] = b.dataset.office; this.ran = false; this.paint(); }));
    this.paint();
  }

  checkObjective() {
    if (!Object.values(this.pick).every(Boolean)) return { ok: false, hint: 'Give every job to an office first.' };
    this.ran = true;
    this.paint();
    const ok = CASES.every((c) => this.pick[c.a] !== this.pick[c.b]);
    if (ok) burst(this.root.querySelector('.ta-cases'));
    return ok ? { ok: true } : { ok: false, hint: 'One case got through. Two jobs share an office.' };
  }

  paint() {
    this.root.querySelectorAll('[data-job]').forEach((b) => b.setAttribute('aria-pressed', this.pick[b.dataset.job] === b.dataset.office ? 'true' : 'false'));
    CASES.forEach((c, i) => {
      const el = this.root.querySelector(`[data-case="${i}"]`), res = this.root.querySelector(`[data-res="${i}"]`);
      if (!this.ran) { el.removeAttribute('data-s'); res.textContent = 'Waiting for your plan.'; return; }
      const ok = this.pick[c.a] !== this.pick[c.b];
      el.dataset.s = ok ? 'yes' : 'no'; res.textContent = ok ? c.yes : c.no;
    });
    this.relayout?.();
  }
}
