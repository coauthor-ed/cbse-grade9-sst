// TwoBulgesScene - why two tides a day. Seen from above the North Pole: the Earth, the sea round it, the Moon off
// to one side. Three beats, one true chain:
//   beat 0  pull arrows on the near water, the Earth's centre and the far water, sized near > centre > far
//   beat 1  the difference: near water drawn ahead, far water left behind, so an oval with two bulges.
//   beat 2  a marked place is carried round through both bulges; a strip traces two highs and two lows.
// The bulge is drawn far too large and the figure says so. No face, no country lines.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { dur } from 'simulations/base/kit/SimAnim.js';
import { SEA_COLOR_MAP, svgEarthDisc, svgMoon, svgSeaColour as sc, pathLine as line } from '../shared/SeaArt.js';
import { frame, words, seaWhite, ctlBar, anim, WHITE } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];
const DAY = 8;

export class TwoBulgesScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 480;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'The Earth seen from above with the Moon to the right. The Moon pulls near water most, the Earth less and far water least, so the sea is stretched into two bulges. As the Earth turns, a marked place passes through both bulges and meets two high tides.';
  static CONTROLS = [];

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'btn', id: 'go', label: 'Turn the Earth once', go: true }], () => { this._ran = true; this.play(DAY); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  css() { return '.svs { padding: 6px; }'; }

  enter(step) { this._ran = false; this.ctl?.show('go', step === 2); }

  stageHeight(st) { return st.portrait ? 370 : 390; }

  paint(st) {
    const W = st.W, H = st.H;
    return { svg: frame(st, 'tb', `<rect width="${W}" height="${H}" ${fill(sc('band6'))}/><g data-anim="e"></g>`) };
  }

  animate(st, t) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, stripH = step === 2 ? 92 : 0;
    const cy = (H - stripH) / 2 + (stripH ? 2 : 0), R = Math.min(P ? 72 : 96, (H - stripH) * 0.3), cx = W * (P ? 0.4 : 0.42), mx = W - (P ? 40 : 64);
    const T = dur(DAY) || DAY, u = this._ran ? Math.min(1, t / T) : (step === 2 ? 1 : 0);
    const bulge = step === 0 ? 0 : (P ? 26 : 34), a = R + 10 + bulge, b = R + 10 - bulge * 0.2;
    let s = '';
    for (let i = 0; i < 40; i++) { const x = (i * 97.3) % W, y = (i * 61.7) % H; s += `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * 0.6}" ${fill(WHITE, 'opacity:0.7')}/>`; }
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${a}" ry="${b}" ${fill(sc('band2'))}/>`;
    s += svgEarthDisc(cx, cy, R / 100, { rot: -u * 360, shade: false });
    s += svgMoon(mx, cy, P ? 0.6 : 0.8, { phase: 0.5 });
    const arrow = (x0, x1, y, w, col) => `<path d="M${x0} ${y}H${x1}" ${stroke(col, w)}/><path d="M${x1} ${y - w * 1.5}l${w * 2} ${w * 1.5}l${-w * 2} ${w * 1.5}Z" ${fill(col)}/>`;
    if (step === 0) {
      const col = sc('sunCore'), y1 = cy;
      s += arrow(cx + R + 6, cx + R + (P ? 46 : 66), y1, 9, col);
      s += arrow(cx - (P ? 22 : 30), cx + (P ? 26 : 34), y1, 6, col);
      s += arrow(cx - R - (P ? 36 : 44), cx - R - 6, y1, 3.5, col);
      s += seaWhite(cx + R + 40, cy - 26, 'Near: most', { size: P ? 15 : 17 }) + seaWhite(cx, cy - 22, 'Centre', { size: P ? 15 : 17 }) + seaWhite(Math.max(48, cx - R - 24), cy + 34, 'Far: least', { size: P ? 15 : 17 });
    }
    if (step === 1) {
      const col = sc('sunCore');
      s += arrow(cx + R + 18, cx + a + 18, cy, 7, col);
      s += `<path d="M${cx - R - 18} ${cy}H${cx - a - 8}" ${stroke(col, 7)}/><path d="M${cx - a - 8} ${cy - 10.5}l-14 10.5l14 10.5Z" ${fill(col)}/>`;
      s += seaWhite(Math.min(W - 86, cx + a), cy - 42, 'Pulled ahead', { size: P ? 15 : 17 }) + seaWhite(Math.max(64, cx - a + 6), cy + 58, 'Left behind', { size: P ? 15 : 17 });
      s += seaWhite(W / 2, H - 14, 'Bulges drawn far too large', { size: 15 });
    }
    if (step === 2) {
      const ang = -Math.PI / 2 - u * Math.PI * 2, wob = (th) => R + 10 + bulge * Math.cos(2 * th) * 0.6 + bulge * 0.4 - 0.2 * bulge, px = cx + Math.cos(ang) * (wob(ang) + 2), py = cy + Math.sin(ang) * (wob(ang) * 0.82 + 2);
      s += `<circle cx="${px}" cy="${py}" r="10" ${fill(sc('red'), `stroke:${WHITE};stroke-width:3`)}/>`;
      s += seaWhite(W / 2, 22, u < 1 ? `${Math.round(u * 24)} hours` : 'One turn of the Earth', { size: 16 });
      s += seaWhite(W - 8, H - stripH - 8, 'Bulges far too large', { anchor: 'end', size: 15 });
      const sy = H - stripH, x0 = 16, x1 = W - 16;
      const yy = (q) => sy + stripH * 0.46 + Math.cos(q * Math.PI * 4) * stripH * 0.28, pts = [];
      for (let q = 0; q <= u + 0.001; q += 0.01) pts.push([x0 + q * (x1 - x0), yy(q)]);
      s += `<rect x="0" y="${sy}" width="${W}" height="${stripH}" ${fill(sc('cloud'))}/>`;
      if (pts.length > 1) s += `<path d="${line(pts)}" ${stroke(sc('red'), 5)}/>`;
      s += words(x0 + (x1 - x0) * 0.25, sy + 18, 'High', { size: 15, ink: sc('ink') }) + words(x0 + (x1 - x0) * 0.75, sy + 18, 'High', { size: 15, ink: sc('ink') });
      s += words(x0 + 26, sy + stripH - 8, 'Low', { size: 15, ink: sc('ink') }) + words(x0 + (x1 - x0) * 0.5, sy + stripH - 8, 'Low', { size: 15, ink: sc('ink') }) + words(x1 - 26, sy + stripH - 8, 'Low', { size: 15, ink: sc('ink') });
    }
    if (step !== 2) s += seaWhite(mx, cy + (P ? 42 : 52), 'Moon', { size: 16 });
    anim(this, 'e', s);
  }
}
