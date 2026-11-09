// ColregsLightsScene - rules of the road at night. Beat 0: one ship at night with five parts of the rules, tap to light.
// Beat 1: four meetings, seen from above and from your own bridge: the colours tell you how the other ship is heading.
// Beat 2: the same four, with who gives way and what each ship does. Own ship is the blue one, heading up the stage.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, tag, arrow, sea, svgCargoShip, svgWaveLine, num, SEA_INK, WHITE } from '../L08/SeaDraw.js';
import { svgShipTop, MEETINGS, RED, GREEN, seaNight } from './ShipTop.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const OWN = 'var(--sim-series-1)';
const PARTS = [
  { id: 'look', label: 'Lookout', targets: ['look'], say: 'Someone keeps watch at all times', at: [0.3, 0.3] },
  { id: 'speed', label: 'Safe speed', targets: ['speed'], say: 'Slow enough to act in time', at: [0.2, 0.74] },
  { id: 'lights', label: 'Lights', targets: ['lights'], say: 'Show where the ship is and which way it heads', at: [0.62, 0.2] },
  { id: 'sound', label: 'Sound signals', targets: ['sound'], say: 'A horn warns other ships', at: [0.34, 0.2] },
  { id: 'shape', label: 'Shapes', targets: ['shape'], say: 'Tell ships what kind of vessel this is', at: [0.8, 0.3] },
];
const MEET = Object.keys(MEETINGS).map((k) => ({ id: k, label: MEETINGS[k].label, targets: [k] }));

export class ColregsLightsScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 600;
  static ARIA_LABEL = 'Two ships at night. A red light shows on the left side of a ship, a green light on the right side and white lights on the masts. Four meetings show who gives way.';
  static COLOR_MAP = SEA_COLOR_MAP;
  static CONTROLS = [];
  tl = tapLight({ label: 'Choose', chips: PARTS, onChange: () => this.repaint() });
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 490 : 400; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.set(step === 0 ? { chips: PARTS, lit: 'look' } : { chips: MEET, lit: step === 1 ? 'head' : 'right' });
    this.relayout?.();
  }
  _deck(st) {
    const W = st.W, H = st.H, P = st.portrait, sy = H * 0.66, lit = this.tl.chip?.()?.id ?? 'look';
    let s = seaNight(W, H, 'cl') + `<rect x="0" y="${num(sy)}" width="${W}" height="${num(H - sy)}" rx="14" style="fill:color-mix(in oklab, ${sea('seaDeep')} 62%, ${SEA_INK})"/>`;
    for (let i = 0; i < 26; i++) s += `<circle cx="${num((Math.sin(i * 12.9898) * 0.5 + 0.5) * W)}" cy="${num(10 + (Math.sin(i * 78.233) * 0.5 + 0.5) * sy * 0.55)}" r="${1.5 + (i % 3) * 0.5}" style="fill:${WHITE};opacity:0.75"/>`;
    const x = W * 0.5, k = P ? 0.92 : 1.2, L = 140 * k;
    s += svgCargoShip(x, sy + 3, k, {});
    s += svgWaveLine(0, sy, 1, { w: W, amp: 3 });
    const mx = x + L * 0.1, my = sy - 96 * k, br = x - L * 0.78, bry = sy - 62 * k;
    const bulb = (cx, cy, c, on) => `<circle cx="${num(cx)}" cy="${num(cy)}" r="${on ? 15 : 0}" style="fill:${c};opacity:0.28"/><circle cx="${num(cx)}" cy="${num(cy)}" r="7" style="fill:${c};stroke:${WHITE};stroke-width:2"/>`;
    s += `<path d="M${num(mx)} ${num(sy - 40 * k)}V${num(my)}" style="stroke:${WHITE};stroke-width:4"/>`;
    s += bulb(mx, my, WHITE, lit === 'lights') + bulb(x + L * 0.9, sy - 30 * k, GREEN, lit === 'lights');
    if (lit === 'look') s += `<circle cx="${num(br)}" cy="${num(bry - 18)}" r="6" style="fill:${WHITE}"/><rect x="${num(br - 5)}" y="${num(bry - 12)}" width="10" height="16" rx="3" style="fill:${OWN}"/><path d="M${num(br + 8)} ${num(bry - 16)}L${num(W - 4)} ${num(bry - 46)}V${num(bry + 14)}Z" style="fill:${sea('sunCore')};opacity:0.22"/>`;
    if (lit === 'speed') s += arrow(x + L + 2, sy + 22, Math.min(W - 8, x + L + 40), sy + 22, { w: 5, col: WHITE, haloCol: SEA_INK });
    if (lit === 'sound') for (let i = 1; i <= 3; i++) s += `<path d="M${num(br - 8 - i * 10)} ${num(bry - 30 - i * 6)}a${i * 11} ${i * 11} 0 0 0 0 ${i * 22}" style="fill:none;stroke:${WHITE};stroke-width:3.5;stroke-linecap:round;opacity:${1 - i * 0.2}"/>`;
    if (lit === 'shape') { const sx = mx, sy2 = my + 24; s += `<path d="M${num(sx - 13)} ${num(sy2 - 12)}L${num(sx + 13)} ${num(sy2 - 12)}L${num(sx)} ${num(sy2 + 4)}Z M${num(sx - 13)} ${num(sy2 + 18)}L${num(sx + 13)} ${num(sy2 + 18)}L${num(sx)} ${num(sy2 + 2)}Z" style="fill:${sea('cloud')};stroke:${SEA_INK};stroke-width:2"/>`; }
    const p = PARTS.find((c) => c.id === lit);
    s += tx(W / 2, H - 22, p.say, { size: P ? 15 : 17, col: WHITE, display: !P, weight: 700 });
    return s;
  }
  _top(x0, y0, W, H, id, act) {
    const m = MEETINGS[id], cx = x0 + W / 2, by = y0 + H - 54, dx = Math.min(W * 0.34, 120), dy = H - 120, ox = cx + m.at[0] * dx, oy = by + m.at[1] * dy - (m.at[1] === -1 ? 0 : 56);
    let s = svgShipTop(ox, oy, m.rot, 0.72, { lights: true, hull: WHITE });
    s += svgShipTop(cx, by, 0, 0.72, { hull: OWN });
    if (act) {
      if (m.mine === 'hold') s += arrow(cx, by - 52, cx, by - 104, { w: 5, col: WHITE, haloCol: SEA_INK });
      else s += `<path d="M${cx} ${by - 48}Q${cx + 4} ${by - 84} ${cx + 52} ${by - 92}" style="fill:none;stroke:${WHITE};stroke-width:5;stroke-linecap:round"/>` + arrow(cx + 40, by - 90, cx + 62, by - 94, { w: 5, col: WHITE, haloCol: SEA_INK, head: 13, halo: false });
      const a = m.rot * Math.PI / 180, fx = Math.sin(a), fy = -Math.cos(a);
      if (m.other === 'hold' && id !== 'behind') s += arrow(ox + fx * 46, oy + fy * 46, ox + fx * 94, oy + fy * 94, { w: 5, col: WHITE, haloCol: SEA_INK });
      if (m.other === 'right') s += arrow(ox + fx * 46, oy + fy * 46, ox + fx * 84 - fy * 34, oy + fy * 84 + fx * 34, { w: 5, col: WHITE, haloCol: SEA_INK });
    }
    s += tx(cx, y0 + H - 6, 'you', { size: 15, col: WHITE });
    return s;
  }
  _view(x, y, w, h, id) {
    // what you see ahead from your own bridge: a dark ship with its lights
    const m = MEETINGS[id], cx = x + w / 2, sy = y + h * 0.66;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="fill:color-mix(in oklab, ${sea('seaDeep')} 18%, ${SEA_INK});stroke:${WHITE};stroke-width:3"/>`;
    s += `<path d="M${x + 3} ${num(sy)}H${x + w - 3}" style="stroke:${sea('seaMid')};stroke-width:2"/>`;
    const bulb = (px, py, c, r = 9) => `<circle cx="${num(px)}" cy="${num(py)}" r="${r + 8}" style="fill:${c};opacity:0.3"/><circle cx="${num(px)}" cy="${num(py)}" r="${r}" style="fill:${c}"/>`;
    if (m.see.includes('red') && m.see.includes('green')) s += bulb(cx - 34, sy - 14, GREEN) + bulb(cx + 34, sy - 14, RED);
    else if (m.see.includes('red')) s += bulb(cx - 8, sy - 14, RED);
    else if (m.see.includes('green')) s += bulb(cx + 8, sy - 14, GREEN);
    if (id === 'behind') s += bulb(cx, sy - 16, WHITE);
    else s += bulb(cx + (id === 'right' ? -20 : id === 'left' ? 20 : 0), sy - 54, WHITE, 7);
    s += tx(cx, y + h - 10, 'what you see ahead', { size: 15, col: WHITE, weight: 700 });
    return s;
  }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex;
    if (step === 0) return { svg: frame(st, this._deck(st)) };
    const id = this.tl.chip?.()?.id ?? 'head', m = MEETINGS[id] ?? MEETINGS.head;
    let s = seaNight(W, H, 'clt');
    if (P) {
      s += this._top(0, 4, W, H * (step === 1 ? 0.58 : 0.8), id, step === 2);
      s += step === 1 ? this._view(10, H * 0.6, W - 20, H * 0.3, id) : '';
    } else {
      s += this._top(0, 4, W * (step === 1 ? 0.56 : 1), H - (step === 1 ? 62 : 92), id, step === 2);
      if (step === 1) s += this._view(W * 0.58, 16, W * 0.4, H - 92, id);
    }
    if (step === 1) s += tag(W / 2, H - 22, m.read.length > 38 && P ? m.read.split(':')[0] : m.read, { size: P ? 15 : 16 });
    else { s += tag(W / 2, H - 50, m.you, { size: 19, col: WHITE }); s += tx(W / 2, H - 16, m.role, { size: 16, col: WHITE }); }
    return { svg: frame(st, s) };
  }
}
