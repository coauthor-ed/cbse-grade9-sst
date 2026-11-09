/**
 * Base60Scene - blk-l09-s04, 3 beats. Beat 0: three Sumerian firsts, drawn. Beat 1: a ring of 60 tokens and a ring of 10, and
 * chips that share the ring into 2, 3, 4, 5, 6, 7 or 12 groups. Leftovers stay hollow. 7 fails on 60; 3, 4, 6, 7 and 12 fail on
 * 10. Beat 2: a clock, the sixties still in use. Base chain: SvgScene. Chips are in the scene (TapLight).
 */
import { SvgScene, tone, fill, stroke, shade, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { CLAY, SOIL, SAND, WATER, n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const NUMS = [2, 3, 4, 5, 6, 7, 12];
const CHIPS = NUMS.map((v) => ({ id: `s${v}`, label: String(v), targets: [`s${v}`] }));
const RINGS = [{ id: 'r60', label: 'Ring of 60', targets: ['r60'], tone: 2 }, { id: 'r10', label: 'Ring of 10', targets: ['r10'], tone: 5 }];
const TONES = [2, 5, 3, 6];
const DIV = '\u00f7';

export class Base60Scene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A wheeled cart, a sailboat and a measured field. Then a ring of 60 tokens shared into equal groups, compared with a ring of 10. Then a clock with 60 minutes.';

  _failed = new Set();
  _found = false;
  tlN = tapLight({ label: 'Share into groups', chips: CHIPS, onChange: () => this._change() });
  tlR = tapLight({ label: 'Which ring', chips: RINGS, onChange: () => this._change() });

  async setup() {
    await super.setup();
    this.tlR.mount(this.root, this);
    this.tlN.mount(this.root, this);
    this._preset();
    this.repaint();
  }

  destroy() { this.tlN.destroy(); this.tlR.destroy(); super.destroy(); }
  enter() { this._preset(); }

  _preset() {
    const on = this.stepIndex === 1;
    this.tlR.set({ lit: on ? 'r60' : null, disabled: !on });
    this.tlN.set({ lit: on ? 's3' : null, disabled: !on });
    this.root.classList.toggle('b6-off', !on);
    this._just = false;
  }

  _nums() { return { ring: this.tlR.has('r10') ? 10 : 60, by: NUMS.find((v) => this.tlN.has(`s${v}`)) ?? null }; }

  _change() {
    const { ring, by } = this._nums();
    if (by && ring === 10 && ring % by) this._failed.add(by);
    this.repaint();
    if (by && ring === 60 && !(ring % by) && this._failed.has(by) && !this._found) { this._found = true; this.celebrate(this.sv.W / 2, this.sv.H / 2); }
  }

  stageHeight(st) { return st.portrait ? (this.stepIndex === 1 ? 372 : 520) : (this.stepIndex === 1 ? 344 : 440); }

  css() {
    return `
.b6-off > .tl-row { display: none; }
svg .b6-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; }
svg .b6-t { font-family: var(--sim-font); font-weight: 800; }
`;
  }

  paint(st) {
    const s = this.stepIndex;
    if (s === 0) return { svg: this._firsts(st), floor: undefined };
    if (s === 2) return { svg: this._clock(st) };
    return { svg: this._ring(st) };
  }

  _text(x, y, t, size, o = {}) { return `<text class="${o.cls ?? 'b6-w'}" x="${n(x)}" y="${n(y)}" text-anchor="${o.a ?? 'middle'}" font-size="${size}" dominant-baseline="central" ${fill(o.col ?? 'var(--sim-label)')}>${t}</text>`; }

  _ring(st) {
    const { ring, by } = this._nums(), W = st.W, H = st.H, port = st.portrait, cx = port ? W / 2 : W * 0.33, cy = port ? H * 0.42 + 4 : H / 2 + 2;
    const R = port ? 128 : 146, q = by ? Math.floor(ring / by) : ring, left = by ? ring % by : 0, used = by ? q * by : ring;
    const r = ring === 60 ? R * 0.046 : R * 0.2;
    let out = '';
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2 - Math.PI / 2, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), g = by ? Math.floor(i / q) : 0;
      if (i < used) out += `<circle cx="${n(x)}" cy="${n(y + 2)}" r="${n(r)}" ${fill(shade(tone(TONES[g % 4]), 62))}/><circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" ${fill(tone(TONES[g % 4]))}/>`;
      else out += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r - 1)}" ${stroke('var(--sim-bad)', 3, 'stroke-dasharray:3 4')}/>`;
    }
    if (by) for (let g = 0; g < by; g++) { const a = (g * q / ring) * Math.PI * 2 - Math.PI / 2 - Math.PI / ring; out += `<path d="M${n(cx + (R - r * 2.2) * Math.cos(a))} ${n(cy + (R - r * 2.2) * Math.sin(a))}L${n(cx + (R + r * 2.2) * Math.cos(a))} ${n(cy + (R + r * 2.2) * Math.sin(a))}" ${stroke('var(--sim-label)', 3)}/>`; }
    const ok = !left, tx = port ? cx : W * 0.8;
    if (port) {
      out += this._text(cx, cy, by ? String(q) : ring, 50) + this._text(cx, cy + 36, 'in each', 19, { cls: 'b6-t', col: 'var(--sim-label-muted)' });
      out += this._text(cx, H - 22, by ? `${ring} ${DIV} ${by} = ${q}${left ? `, ${left} left over` : ', none left over'}` : '', 25, { col: ok ? 'var(--sim-label)' : 'var(--sim-bad)' });
    } else {
      out += this._text(cx, cy, ring, 58) + this._text(cx, cy + 48, 'tokens', 19, { cls: 'b6-t', col: 'var(--sim-label-muted)' });
      if (by) {
        out += this._text(tx, H / 2 - 74, `${ring} ${DIV} ${by}`, 38) + this._text(tx, H / 2 - 18, `${q} in each`, 34);
        const col = ok ? 'var(--sim-good)' : 'var(--sim-bad)', w = 200;
        out += cushionRect(tx - w / 2, H / 2 + 26, w, 56, 18, col) + this._text(tx, H / 2 + 54, ok ? 'None left over' : `${left} left over`, 24, { col: ok ? 'var(--sim-ink-on-good, var(--sim-bg-deep))' : 'var(--sim-ink-on-bad, var(--sim-bg-deep))' });
      }
    }
    return out;
  }

  _firsts(st) {
    const W = st.W, port = st.portrait, H = st.H;
    if (port) {
      return this._cart(W * 0.5, 100, 0.92) + this._text(W / 2, 128, 'Wheeled cart', 25)
        + this._boat(W * 0.5, 284, 0.96) + this._text(W / 2, 314, 'Sailboat', 25)
        + this._field(W * 0.5, 404, 1) + this._text(W / 2, 480, 'Measured fields', 25);
    }
    return this._cart(W * 0.2, 190, 0.96) + this._text(W * 0.2, 230, 'Wheeled cart', 25)
      + this._boat(W * 0.78, 190, 1) + this._text(W * 0.78, 230, 'Sailboat', 25)
      + this._field(W * 0.5, 330, 1.25) + this._text(W * 0.5, H - 18, 'Measured fields', 25);
  }

  _cart(x, y, k) {
    const wood = 'var(--sim-elev-high)', wheel = (cx) => `<circle cx="${n(cx)}" cy="${n(y - 26 * k)}" r="${n(26 * k)}" ${fill(shade(wood, 56))}/><circle cx="${n(cx)}" cy="${n(y - 26 * k)}" r="${n(20 * k)}" ${fill(wood)}/><rect x="${n(cx - 18 * k)}" y="${n(y - 30 * k)}" width="${n(36 * k)}" height="${n(8 * k)}" rx="2" ${fill(shade(wood, 70))}/><circle cx="${n(cx)}" cy="${n(y - 26 * k)}" r="${n(6 * k)}" ${fill(shade(wood, 44))}/>`;
    return `<rect x="${n(x - 86 * k)}" y="${n(y - 76 * k)}" width="${n(172 * k)}" height="${n(40 * k)}" rx="${n(8 * k)}" ${fill(wood)}/><rect x="${n(x - 86 * k)}" y="${n(y - 50 * k)}" width="${n(172 * k)}" height="${n(14 * k)}" rx="${n(6 * k)}" ${fill(shade(wood, 72))}/><path d="M${n(x + 86 * k)} ${n(y - 52 * k)}L${n(x + 134 * k)} ${n(y - 60 * k)}" ${stroke(shade(wood, 62), 9 * k)}/>` + wheel(x - 54 * k) + wheel(x + 54 * k);
  }

  _boat(x, y, k) {
    const wood = 'var(--sim-elev-high)';
    return `<rect x="${n(x - 130 * k)}" y="${n(y - 12 * k)}" width="${n(260 * k)}" height="${n(14 * k)}" rx="${n(7 * k)}" ${fill(WATER)}/>`
      + `<path d="M${n(x - 92 * k)} ${n(y - 40 * k)}Q${n(x)} ${n(y - 22 * k)} ${n(x + 92 * k)} ${n(y - 40 * k)}L${n(x + 68 * k)} ${n(y - 6 * k)}H${n(x - 68 * k)}Z" ${fill(wood)}/>`
      + `<rect x="${n(x - 4 * k)}" y="${n(y - 132 * k)}" width="${n(8 * k)}" height="${n(102 * k)}" rx="3" ${fill(shade(wood, 66))}/>`
      + `<path d="M${n(x + 8 * k)} ${n(y - 126 * k)}Q${n(x + 84 * k)} ${n(y - 80 * k)} ${n(x + 60 * k)} ${n(y - 42 * k)}H${n(x + 8 * k)}Z" ${fill(SAND)}/><path d="M${n(x - 8 * k)} ${n(y - 112 * k)}Q${n(x - 56 * k)} ${n(y - 76 * k)} ${n(x - 44 * k)} ${n(y - 46 * k)}H${n(x - 8 * k)}Z" ${fill(shade(SAND, 88))}/>`;
  }

  _field(x, y, k) {
    const w = 210 * k, h = 96 * k, l = x - w / 2, t = y - h / 2, green = 'var(--sim-elev-low)', cols = 4;
    let out = `<rect x="${n(l)}" y="${n(t + 5)}" width="${n(w)}" height="${n(h)}" rx="6" ${fill(shade(green, 60))}/><rect x="${n(l)}" y="${n(t)}" width="${n(w)}" height="${n(h)}" rx="6" ${fill(green)}/>`;
    for (let i = 1; i < cols; i++) out += `<path d="M${n(l + i * w / cols)} ${n(t)}V${n(t + h)}" ${stroke(SAND, 5, 'stroke-dasharray:8 8')}/>`;
    for (const px of [l, l + w]) for (const py of [t, t + h]) out += `<rect x="${n(px - 5)}" y="${n(py - 14)}" width="10" height="24" rx="3" ${fill(SOIL)}/>`;
    return out;
  }

  _clock(st) {
    const W = st.W, H = st.H, port = st.portrait, cx = W / 2, cy = port ? 196 : 214, R = port ? 158 : 170;
    let out = `<circle cx="${cx}" cy="${cy + 7}" r="${R + 10}" ${fill(shade(CLAY, 58))}/><circle cx="${cx}" cy="${cy}" r="${R + 10}" ${fill(CLAY)}/><circle cx="${cx}" cy="${cy}" r="${R}" ${fill('var(--sim-bg-surface)')}/>`;
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2, major = i % 5 === 0, r1 = R - (major ? 22 : 12);
      out += `<path d="M${n(cx + r1 * Math.cos(a))} ${n(cy + r1 * Math.sin(a))}L${n(cx + (R - 4) * Math.cos(a))} ${n(cy + (R - 4) * Math.sin(a))}" ${stroke('var(--sim-label)', major ? 5 : 2.5)}/>`;
    }
    for (const v of [15, 30, 45, 60]) { const b = (v / 60) * Math.PI * 2 - Math.PI / 2; out += this._text(cx + (R - 48) * Math.cos(b), cy + (R - 48) * Math.sin(b), v, 26); }
    const hand = (v, len, w, col) => { const a = (v / 60) * Math.PI * 2 - Math.PI / 2; return `<path d="M${cx} ${cy}L${n(cx + len * Math.cos(a))} ${n(cy + len * Math.sin(a))}" ${stroke(col, w)}/>`; };
    out += hand(10, R * 0.54, 11, 'var(--sim-label)') + hand(38, R * 0.76, 7, tone(2)) + `<circle cx="${cx}" cy="${cy}" r="11" ${fill('var(--sim-label)')}/>`;
    const y = cy + R + 54;
    if (port) return out + this._text(W * 0.27, y, '60 minutes', 25) + this._text(W * 0.73, y, '60 seconds', 25) + this._text(cx, y + 40, '360 degrees in a circle', 25);
    return out + this._text(W * 0.14, cy - 40, '60', 44) + this._text(W * 0.14, cy, 'minutes', 22) + this._text(W * 0.14, cy + 60, '60', 44) + this._text(W * 0.14, cy + 100, 'seconds', 22) + this._text(W * 0.87, cy + 10, '360', 44) + this._text(W * 0.87, cy + 50, 'degrees', 22);
  }
}
