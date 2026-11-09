// InsolationAngleScene - blk-l03-s02 setup and blk-l03-s03. The Sun at the left, the Earth in March
// with the Sun over the equator, two equal beams (Fig 3.6). Numbers are the real geometry: a beam at
// latitude 60 falls on a patch 1/cos(60) = 2 times as long, so each piece of ground gets half.
//   step 0  setup: two equal beams reach the Earth. No patches, no sizes.
//   step 1  the lit patches, drawn and laid flat side by side
//   step 2  energy shown as dots on each patch; insolation named
//   step 3  the air shell: the slant path through it is longer (shell drawn thicker)
//   step 4  distance: 15 crore km against a few thousand km
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { sunEdge, AIR_CSS, tx, panel, loadGeo, globe, sky, SKY_INK, MUTED, LABEL, creditPlate } from './AirDraw.js';

const SETUP = [[{ idx: 0, dwellMs: null }]];
const MAP = [1, 2, 3, 4].map((i) => [{ idx: i, dwellMs: null }]);
const BEAM = 30;                       // beam width in stage px, the same for both
const rad = (d) => d * Math.PI / 180;
const CHIPS = [{ id: 'l30', label: '30\u00b0N', targets: ['l30'], tone: 3 }, { id: 'l60', label: '60\u00b0N', targets: ['l60'], tone: 2 }];

export class InsolationAngleScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: SETUP, [Number.MAX_SAFE_INTEGER]: SETUP, 1: SETUP, 4: MAP };
  static ARIA_LABEL = 'The Sun shines two equal beams on the Earth, one at the equator and one at 60 degrees north. The beam at 60 degrees north lights a patch twice as long, so each piece of ground gets half the energy.';
  static CONTROLS = [];
  static PORTRAIT_HEIGHT = 600;

  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 500 : 440; }
  tl = tapLight({ label: 'Latitude', chips: CHIPS, onChange: () => this.repaint() });
  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.enter(this.stepIndex);
    this._g = await loadGeo();
    this.repaint();
  }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.set({ lit: 'l60', disabled: step !== 2 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step !== 2;
  }

  // The lit stretch of the left limb for a beam centred on latitude la.
  _patch(cx, cy, R, la) {
    const y = cy - R * Math.sin(rad(la));
    const a0 = Math.asin(Math.min(1, (y - BEAM / 2 - cy) / R)), a1 = Math.asin(Math.min(1, (y + BEAM / 2 - cy) / R));
    const p = (a) => [cx - R * Math.cos(a), cy + R * Math.sin(a)];
    return { y, a: p(a0), b: p(a1) };
  }

  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    const la = step === 2 && this.tl.chip()?.id === 'l30' ? 30 : 60;
    const R = port ? 128 : 158, cx = port ? W - R - 8 : W - R - 18, cy = port ? 158 : 196;
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('seaDeep')}"/>`;
    const sun = sunEdge(cy, port ? 104 : 148);
    const shell = step === 3 ? 28 : 0;
    if (shell) s += `<path d="M${cx} ${cy - R - shell}A${R + shell} ${R + shell} 0 0 0 ${cx} ${cy + R + shell}Z" style="fill:${sky('hazeLow')};opacity:0.55"/>`;
    s += globe(this._g, cx, cy, R, { rotate: [-62, 0, 0], india: true }).svg;
    s += `<path d="M${cx - R} ${cy}H${cx + R}" style="stroke:${sky('cloud')};stroke-width:2;stroke-dasharray:8 7"/>`;
    const lat = cy - R * Math.sin(rad(la)), lx = R * Math.cos(rad(la));
    s += `<path d="M${cx - lx} ${lat}H${cx + lx}" style="stroke:${sky('cloud')};stroke-width:2;stroke-dasharray:8 7"/>`;
    s += tx(cx + R * 0.55, cy - 8, 'Equator', { size: 15, col: sky('cloud'), halo: SKY_INK });
    s += tx(cx + lx * 0.55, lat - 8, `${la}\u00b0N`, { size: 15, col: sky('cloud'), halo: SKY_INK });
    const eq = this._patch(cx, cy, R, 0), hi = this._patch(cx, cy, R, la);
    const beam = (p, id) => {
      const x0 = 10;
      return `<path d="M${x0} ${p.y - BEAM / 2}L${p.a[0].toFixed(1)} ${p.a[1].toFixed(1)}${id === 'hi' ? `A${R} ${R} 0 0 0 ${p.b[0].toFixed(1)} ${p.b[1].toFixed(1)}` : `A${R} ${R} 0 0 0 ${p.b[0].toFixed(1)} ${p.b[1].toFixed(1)}`}L${x0} ${p.y + BEAM / 2}Z" style="fill:${sky('sunCore')};opacity:0.88;stroke:${sky('sun')};stroke-width:2"/>`;
    };
    s += beam(hi, 'hi') + beam(eq, 'eq') + sun;
        if (step >= 1) {
      const arc = (p) => `<path d="M${p.a[0].toFixed(1)} ${p.a[1].toFixed(1)}A${R} ${R} 0 0 0 ${p.b[0].toFixed(1)} ${p.b[1].toFixed(1)}" style="fill:none;stroke:var(--sim-series-2);stroke-width:9;stroke-linecap:round"/>`;
      s += arc(eq) + arc(hi);
    }
    if (step === 3) {
      const yy = hi.y, dep = (r) => cx - Math.sqrt(r * r - (yy - cy) * (yy - cy));
      const x1 = dep(R + shell), x2 = dep(R);
      const e1 = cx - (R + shell), e2 = cx - R;
      s += `<path d="M${x1.toFixed(1)} ${yy}H${x2.toFixed(1)}" style="stroke:var(--sim-series-5);stroke-width:7;stroke-linecap:round"/>`;
      s += `<path d="M${e1} ${cy}H${e2}" style="stroke:var(--sim-series-5);stroke-width:7;stroke-linecap:round"/>`;
    }
    // Lower card
    const P = port ? { x: 10, y: 304, w: W - 20, h: H - 334 } : { x: 12, y: H - 180, w: Math.min(310, W - 2 * R - 40), h: 164 };
    if (step === 0) {
      s += tx(port ? 104 : 190, cy + 46, 'two equal beams', { size: 17, col: sky('cloud') });
    } else if (step <= 2) s += this._flat(P, step, la);
    else if (step === 3) {
      s += panel(P.x, P.y, P.w, P.h);
      s += tx(P.x + P.w / 2, P.y + 28, 'Air the beam must cross', { size: 16 });
      const bar = (y, lab, w) => `<rect x="${P.x + 94}" y="${y}" width="${w}" height="20" rx="6" style="fill:var(--sim-series-5);stroke:var(--sim-stroke);stroke-width:2"/>` + tx(P.x + 14, y + 16, lab, { size: 15, anchor: 'start' });
      const u = Math.min(100, (P.w - 110) / 2);
      s += bar(P.y + 48, 'Equator', u) + bar(P.y + 82, '60\u00b0N', 2 * u);
      s += tx(P.x + P.w / 2, P.y + P.h - 16, 'air shell drawn thicker', { size: 14, col: MUTED, weight: 700 });
    } else {
      s += panel(P.x, P.y, P.w, P.h);
      s += tx(P.x + P.w / 2, P.y + 28, 'Sun to Earth', { size: 16 });
      s += `<path d="M${P.x + 20} ${P.y + 58}H${P.x + P.w - 20}" style="stroke:var(--sim-series-2);stroke-width:12;stroke-linecap:round"/>`;
      s += tx(P.x + P.w / 2, P.y + 92, 'about 15 crore km', { size: 22, display: true, weight: 700 });
      s += tx(P.x + P.w / 2, P.y + 122, 'Arctic extra: a few thousand km,', { size: 15, weight: 700, col: LABEL });
      s += tx(P.x + P.w / 2, P.y + 142, 'too small to draw on this bar', { size: 15, weight: 700, col: LABEL });
    }
    s += this._g ? creditPlate(W, H) : '';
    return { svg: s };
  }

  // The two patches laid flat: same dots, twice the ground.
  _flat(P, step, la) {
    let s = panel(P.x, P.y, P.w, P.h);
    const base = Math.min(84, (P.w - 56) / 3), h = 62, y = P.y + 38, x1 = P.x + 16, x2 = x1 + base + 24;
    const k = 1 / Math.cos(rad(la));
    s += tx(x1 + base / 2, y - 12, 'Equator', { size: 15 }) + tx(x2 + base * k / 2, y - 12, `${la}\u00b0N`, { size: 15 });
    const tile = (x, w) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" style="fill:${sky('sand')};stroke:var(--sim-stroke);stroke-width:2.5"/>`;
    s += tile(x1, base) + tile(x2, k * base);
    if (step === 2) {
      for (let i = 0; i < 12; i++) {
        const dx = (i % 4 + 0.5) / 4, dy = (Math.floor(i / 4) + 0.5) / 3;
        s += `<circle class="air-in" cx="${x1 + dx * base}" cy="${y + dy * h}" r="4.5" style="fill:var(--sim-series-2);stroke:${SKY_INK};stroke-width:1"/>`;
        s += `<circle class="air-in" cx="${x2 + dx * k * base}" cy="${y + dy * h}" r="4.5" style="fill:var(--sim-series-2);stroke:${SKY_INK};stroke-width:1"/>`;
      }
      s += tx(x1 + base / 2, y + h + 24, 'crowded', { size: 16, display: true, weight: 700 }) + tx(x2 + base * k / 2 + (la === 30 ? 26 : 0), y + h + 24, la === 30 ? 'a little less per part' : 'half as much per part', { size: 16, display: true, weight: 700 });
    } else {
      s += tx(x1 + base / 2, y + h + 24, 'small', { size: 16, display: true, weight: 700 }) + tx(x2 + base, y + h + 24, 'twice as long', { size: 16, display: true, weight: 700 });
    }
    return s;
  }
}
