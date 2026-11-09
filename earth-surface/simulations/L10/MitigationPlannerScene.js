// MitigationPlannerScene ("An imagined valley") - tap a fix, tap the hazard it reduces. Four hazards, two fixes each.
// A made-up valley with no real place. A plain tally per place, no budget and no timer.
// Control names: .card[data-id], .bin[data-bin], .gm-check.
import { SortBoard } from 'simulations/base/kit/GameFrame.js';
import { art, INK, svgRock, svgSnow, svgWater, svgSand, under } from '../L08/LandDraw.js';

const c = (id, big, answer, aria) => ({ id, html: `<span class="fx">${big}</span>`, chip: big, answer, aria });
const num = (x, y, t) => `<circle cx="${x}" cy="${y}" r="19" style="fill:${art('snow')};stroke:${INK};stroke-width:2.5"/><text x="${x}" y="${y + 8}" text-anchor="middle" style="fill:${INK};font-size:24px;font-weight:800">${t}</text>`;
function valley() {
  const W = 480, H = 136;
  const g = (x) => 104 - Math.max(0, 1 - x / 220) * 90 + Math.max(0, (x - 300) / 180) * -14;
  let s = `<rect width="${W}" height="${H}" style="fill:${art('skyLow')}"/>`;
  s += svgRock(under(g, -5, W + 5, H + 5, 12), { seed: 4, fill: 'slate', bands: ['slate', 'rockDark'], bandH: 22 });
  s += svgSnow([[-5, 10], [64, 44], [40, 58], [-5, 40]], { seed: 3 });
  s += svgWater([[84, 58], [124, 60], [118, 70], [90, 68]], { ripples: 1 });
  s += `<path d="M124 60q9 -9 18 8" style="fill:${art('soil')};stroke:${INK};stroke-width:2"/>`;
  s += `<path d="M196 88L226 100H300" style="fill:none;stroke:${art('slateDark')};stroke-width:7;stroke-linecap:round"/>`;
  s += svgSand([[340, 92], [W + 5, 80], [W + 5, H + 5], [340, H + 5]], { seed: 6, dark: true });
  return `<svg class="vy" viewBox="0 0 ${W} ${H}" role="img" aria-label="An imagined valley: a snow slope, a glacial lake, a road cut and dry fields">${s}${num(30, 24, 1)}${num(104, 46, 2)}${num(208, 72, 3)}${num(420, 66, 4)}</svg>`;
}

export class MitigationPlannerScene extends SortBoard {
  static HEIGHT = 332;
  static OBJECTIVE = { prompt: { en: 'Match each fix to the hazard it reduces in this imagined valley.' } };
  static ARIA_LABEL = 'An imagined valley with four hazards. Tap a fix, then tap the hazard it reduces.';
  static KEY = 'mp';
  static LINE = 'One tap on a fix, one tap on a place.';
  static HEAD = { kicker: 'An imagined valley', title: 'Which fix goes where?', sub: 'Tap a fix, then tap its place.' };
  static CARDS = [
    c('wall', 'Retaining wall', 'land', 'Retaining wall'), c('drain', 'Clear drains', 'land', 'Clear drains'),
    c('fence', 'Snow fences', 'snow', 'Snow fences'), c('tunnel', 'Road tunnel', 'snow', 'Road tunnel'),
    c('pipe', 'Pipes lower the lake', 'glof', 'Pipes that lower the lake'), c('siren', 'Warning sirens', 'glof', 'Warning sirens'),
    c('belt', 'Belt of trees', 'dust', 'Belt of trees'), c('cover', 'Ground cover', 'dust', 'Ground cover'),
  ];
  static BINS = [
    { id: 'snow', label: '1 Snow slope: avalanche' }, { id: 'glof', label: '2 Moraine lake: GLOF' },
    { id: 'land', label: '3 Road cut: landslide' }, { id: 'dust', label: '4 Dry fields: dust storm' },
  ];
  static CSS = `
  .gm.mp { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 14px; gap: 6px; }
  .mp { --cols: 3; --cols-p: 2; }
  .mp .board { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto; align-content: start; gap: 8px; margin-top: 0; }
  .sim-dom-root--portrait .vy { position: static; width: 100%; height: auto; margin-top: 4px; }
  .sim-dom-root--portrait .mp .board { margin-top: 0; }
  .mp .bins { flex-direction: row; max-height: none; overflow: visible; margin-right: 200px; }
  .mp .bin { flex: 1 1 0; }
  .sim-dom-root--portrait .mp .bins { flex-direction: column; margin-right: 0; }
  .sim-dom-root--portrait .mp .bin { flex: none; }
  .mp .card { min-height: 48px; }
  .mp .fx { font-size: 15px; font-weight: 800; line-height: 1.15; }
  .mp .tray { align-content: start; }
  .sim-dom-root--portrait .mp .sub { padding-right: 56px; }
  .gm-head:has(.vy) { max-width: none; }
  .mp .gm-check--corner { bottom: 10px; }
  .mp .bin { min-height: 54px; padding: 5px 10px; }
  .vy { position: absolute; left: 14px; top: 46px; display: block; width: 565px; height: 160px; border-radius: 10px; border: var(--sim-border); box-sizing: border-box; }
  .mp .sub + .vy { margin-bottom: 0; }
  .sim-dom-root:not(.sim-dom-root--portrait) .mp .gm-head { display: flex; gap: 12px; align-items: baseline; height: 32px; }
  .sim-dom-root:not(.sim-dom-root--portrait) .mp .gm-head .kicker { margin: 0; }
  .sim-dom-root:not(.sim-dom-root--portrait) .mp .tray { margin: 0 62px 0 576px; }
  .sim-dom-root:not(.sim-dom-root--portrait) .mp .bin { max-height: 106px; overflow-y: auto; }
  .sim-dom-root:not(.sim-dom-root--portrait) .q-mascot .q-bubble { top: -24px; }
  `;
  _render() { if (this.root.querySelector('.bin')) super._render(); }
  wrongHint(card) { return `${card.chip} does not fit there. Ask what is moving at each place.`; }
  async setup() {
    await super.setup();
    const h = this.root?.querySelector?.('.gm-head');
    if (h) h.insertAdjacentHTML?.('beforeend', valley());
  }
}
