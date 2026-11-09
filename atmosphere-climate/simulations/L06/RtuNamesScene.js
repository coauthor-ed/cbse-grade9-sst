// RtuNamesScene - the book's Table 3.2 as a ring of six, turning from March (L06 s06, 2 beats). A chip or
// a tap on the ring lights a Rtu; the card gives both calendars. Names use the body face, which has the
// diacritics. Beat 0: Vasanta lit. Beat 1: the rags prompt, ring with a drawn tanpura-free music note.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight, TAP_LIGHT_CSS } from 'simulations/base/kit/TapLight.js';
import { READ_CSS } from './IndiaMapSvg.js';

const RTUS = [
  { id: 'vasanta', name: 'Vasanta', en: 'spring', indian: 'Chaitra-Vaiśhākha', greg: 'March-April', tone: 3 },
  { id: 'grishma', name: 'Grīṣhma', en: 'summer', indian: 'Jyeṣhṭha-Āṣhāḍha', greg: 'May-June', tone: 8 },
  { id: 'varsha', name: 'Varṣhā', en: 'monsoon', indian: 'Śhrāvaṇa-Bhādrapada', greg: 'July-August', tone: 1 },
  { id: 'sharad', name: 'Śharad', en: 'early autumn', indian: 'Āśhvina-Kārtika', greg: 'September-October', tone: 2 },
  { id: 'hemanta', name: 'Hemanta', en: 'late autumn', indian: 'Mārgaśhīrṣha-Pauṣha', greg: 'November-December', tone: 4 },
  { id: 'shishira', name: 'Śhiśhira', en: 'winter', indian: 'Māgha-Phālguna', greg: 'January-February', tone: 5 },
];
const CHIPS = RTUS.map((r) => ({ id: r.id, label: r.name, targets: [r.id], tone: r.tone }));
const CSS = `
.rt-card { display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; padding: var(--sim-space-2) var(--sim-space-3); width: 100%; box-sizing: border-box; min-height: 84px; justify-content: center;
  border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); background: var(--sim-bg-surface); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.rt-name { font: 800 var(--sim-text-2xl)/1.1 var(--sim-font); color: var(--sim-label); }
.rt-sub { font: 700 var(--sim-text-md)/1.25 var(--sim-font); color: var(--sim-label-muted); }
.rt-side { position: absolute; right: 0; top: 50%; transform: translateY(-50%); }
.sim-dom-root--portrait .tl-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.sim-dom-root--portrait .tl-chip { padding-inline: 2px; }
`;
const pol = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

export class RtuNamesScene extends SvgScene {
  static HEIGHT = 515;
  static PORTRAIT_HEIGHT = 560;
  static BEAT_STEP_MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A ring of the six traditional Indian seasons, each about two months long. Choosing one shows its months in the Indian and the Gregorian calendars.';

  tl = tapLight({ label: 'The six Ritus', chips: CHIPS, onChange: () => this.repaint() });
  css() { return TAP_LIGHT_CSS + READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? 300 : 340; }

  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.set({ lit: 'vasanta' }); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { this.tl.set({ lit: step === 0 ? 'vasanta' : null }); }

  pointerDown(p) {
    const st = this.sv, cx = this._cx ?? st.W / 2, cy = st.H / 2, dx = p.x - cx, dy = p.y - cy, r = Math.hypot(dx, dy);
    if (r < this._ri || r > this._ro) return false;
    const a = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2), i = Math.floor(a / (Math.PI / 3));
    this.tl.set({ lit: RTUS[i].id });
    this.repaint();
    return false;
  }

  paint(st) {
    const P = st.portrait, cy = st.H / 2, ro = Math.min(st.H / 2 - 6, st.W / 2 - 6), cx = P ? st.W / 2 : ro + 6, ri = ro * 0.46, sel = this.tl.lit()[0];
    this._ri = ri; this._ro = ro; this._cx = cx;
    let svg = '';
    RTUS.forEach((r, i) => {
      const a0 = -Math.PI / 2 + i * Math.PI / 3 + 0.02, a1 = a0 + Math.PI / 3 - 0.04, on = !sel || sel === r.id;
      const [x0, y0] = pol(cx, cy, ro, a0), [x1, y1] = pol(cx, cy, ro, a1), [x2, y2] = pol(cx, cy, ri, a1), [x3, y3] = pol(cx, cy, ri, a0);
      const c = `var(--sim-series-${r.tone})`, m = (a0 + a1) / 2, [tx, ty] = pol(cx, cy, (ro + ri) / 2, m);
      svg += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}A${ro} ${ro} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}A${ri} ${ri} 0 0 0 ${x3.toFixed(1)} ${y3.toFixed(1)}Z" style="fill:color-mix(in oklab, ${c} ${sel === r.id ? 70 : 30}%, var(--sim-bg-surface));stroke:${c};stroke-width:3;opacity:${on ? 1 : 0.55};cursor:pointer"/>`;
      svg += `<text x="${tx.toFixed(1)}" y="${(ty - 3).toFixed(1)}" text-anchor="middle" style="font:800 16px var(--sim-font);fill:var(--sim-label)">${r.name}</text>`;
      svg += `<text x="${tx.toFixed(1)}" y="${(ty + 18).toFixed(1)}" text-anchor="middle" style="font:700 14px var(--sim-font);fill:var(--sim-label)">${r.greg.split('-').map((g) => g.slice(0, 3)).join('-')}</text>`;
    });
    if (this.stepIndex === 1) {
      svg += `<g style="fill:var(--sim-label)"><ellipse cx="${cx - 18}" cy="${cy + 20}" rx="13" ry="10"/><ellipse cx="${cx + 20}" cy="${cy + 12}" rx="13" ry="10"/><path d="M${cx - 7} ${cy + 20}V${cy - 22}L${cx + 31} ${cy - 30}V${cy + 12}H${cx + 25}V${cy - 16}L${cx - 1} ${cy - 10}V${cy + 20}Z"/></g>`;
    } else {
      svg += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" style="font:600 26px var(--sim-font-display, var(--sim-font));fill:var(--sim-label)">Six</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" style="font:800 16px var(--sim-font);fill:var(--sim-label-muted)">Ṛtus</text>`;
    }
    const r = RTUS.find((q) => q.id === sel);
    const head = r
      ? `<div class="rt-card"><span class="rt-name">${r.name}</span><span class="rt-sub">${r.indian}</span><span class="rt-sub">${r.greg}: ${r.en}</span></div>`
      : `<div class="rt-card"><span class="rt-name">Rāgas of the seasons</span><span class="rt-sub">Which rāga goes with which Ṛtu? Ask at home.</span></div>`;
    if (P) return { svg, head };
    return { svg, over: `<div class="rt-side" style="left:${Math.round(cx + ro + 14)}px">${head}</div>` };
  }
}
