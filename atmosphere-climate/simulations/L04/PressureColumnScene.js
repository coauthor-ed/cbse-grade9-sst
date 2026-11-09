// PressureColumnScene - blk-l04-s00. Merged from the old column and the book's Q4 build-up.
//   0 air has weight: a sky of air, dense low down and thin high up, pressing on the ground
//   1 one square centimetre carries about 1 kg of air; a palm of 100 square cm about 100 kg, the
//     weight of two 50 kg sacks of rice. No whole-body figure. Chips: 1 square cm or a palm.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, panel, reading, skyRect, sky, SKY_INK, num, svgLand } from '../L03/AirDraw.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const CHIPS = [{ id: 'cm', label: '1 square cm', targets: ['cm'], tone: 1 }, { id: 'palm', label: 'Your palm', targets: ['palm'], tone: 2 }];

/** A label on a small plate, so it reads over the dots. */
const plate = (x, y, t, size) => { const w = t.length * size * 0.56 + 24, h = size + 16; return panel(x - w / 2, y - h / 2, w, h, { r: 10 }) + tx(x, y + size * 0.36, t, { size }); };

function sack(x, y, s) {
  const c1 = 'var(--sim-track)';
  return `<path d="M${x - 40 * s} ${y}C${x - 52 * s} ${y - 40 * s} ${x - 40 * s} ${y - 74 * s} ${x - 16 * s} ${y - 82 * s}L${x - 22 * s} ${y - 96 * s}H${x + 22 * s}L${x + 16 * s} ${y - 82 * s}C${x + 40 * s} ${y - 74 * s} ${x + 52 * s} ${y - 40 * s} ${x + 40 * s} ${y}Z" style="fill:${sky('sail')};stroke:${SKY_INK};stroke-width:3;stroke-linejoin:round"/>`
    + `<path d="M${x - 17 * s} ${y - 83 * s}H${x + 17 * s}" style="stroke:${sky('wood')};stroke-width:4"/>`
    + tx(x, y - 30 * s, '50 kg', { size: 14, col: SKY_INK });
}

export class PressureColumnScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A tall column of air stands on the ground. It presses on each square centimetre with about the weight of 1 kg, so about 100 kg presses on a palm.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Area', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 470 : 420; }
  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.enter(this.stepIndex);
  }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.set({ lit: step === 1 ? 'palm' : null, disabled: step === 0 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step === 0;
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, g = H - 64, step = this.stepIndex, palm = step === 1 && this.tl.chip()?.id !== 'cm';
    let s = skyRect('pcSky', 0, 0, W, H, 0, 40, { r: 18 });
    s += svgLand(0, g, 1, { w: W, h: H - g, kind: 'plain', seed: 5 });
    // air: dots thick near the ground, thin high up (density halves about every 5.5 km)
    const cw = step === 0 ? W - 40 : palm ? (port ? 120 : 190) : 36, cx = step === 0 ? W / 2 : (port ? W * 0.24 : W * 0.3);
    if (step === 1) s += `<rect x="${cx - cw / 2}" y="0" width="${cw}" height="${g}" style="fill:${sky('cloud')};opacity:0.5"/><path d="M${cx - cw / 2} 0V${g}M${cx + cw / 2} 0V${g}" style="stroke:${SKY_INK};stroke-width:3;stroke-dasharray:10 8"/>`;
    let r = 7;
    const N = step === 0 ? 240 : palm ? 110 : 26;
    for (let i = 0; i < N; i++) {
      r = (r * 31 + 11) % 1009;
      const u = r / 1009, q = ((r * 17) % 1009) / 1009;
      const y = g - 8 - (g - 14) * (1 - Math.pow(1 - u, 0.42));     // packs low
      const x = cx - cw / 2 + 5 + q * (cw - 10);
      s += `<circle cx="${num(x)}" cy="${num(y)}" r="3.4" style="fill:${sky('seaDeep')};opacity:0.8"/>`;
    }
    if (step === 0) {
      s += plate(W / 2, 40, 'thin air high up', 18) + plate(W / 2, g - 112, 'more air low down', 18);
      s += plate(W / 2, H - 28, 'the weight of air presses on the ground', port ? 15 : 16);
    } else {
      const ty = g + 2;
      s += `<rect x="${cx - cw / 2 - 3}" y="${ty - 6}" width="${cw + 6}" height="14" rx="4" style="fill:var(--sim-series-2);stroke:${SKY_INK};stroke-width:2.5"/>`;
      s += plate(palm && port ? W / 2 : cx, ty + 34, palm ? 'your palm, 100 square cm' : '1 square cm', 15);
      const bx = cx + cw / 2 + 16, bw = W - bx - 12;
      s += reading(bx, 14, palm ? 'Air on your palm' : 'Air on 1 square cm', palm ? 'about 100 kg' : 'about 1 kg', { w: bw, h: 78, size: bw < 190 ? 24 : 28 });
      if (palm) s += sack(bx + bw * 0.27, g + 2, bw < 150 ? 0.72 : 0.95) + sack(bx + bw * 0.73, g + 2, bw < 150 ? 0.72 : 0.95);
    }
    return { svg: s };
  }
}
