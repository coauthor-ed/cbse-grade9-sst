// RunUpScene - storm waves against a tsunami on one kind of shore. Three beats:
//   beat 0  a storm: dark cloud, wind, a tall wave at a sea wall of rock. Made by wind.
//   beat 1  a section: the sea floor jumps along a fault and lifts the whole water above. Not wind, not tide.
//   beat 2  run-up height: a ruler on one true scale from sea level to 30 m, with a block of ten floors (3 m a
//           floor) and a palm of about 15 m beside the shore. Water is a pale sheet on the slope. No people.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgWaveLine, svgCloud, svgRain, svgFoam, svgPalm, svgStrata, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { frame, words, seaLabel, seaWhite, INK } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];

export class RunUpScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 450;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'Storm waves are made by wind. A tsunami starts when the sea floor jumps in an earthquake and lifts the water above. Its run-up height, up to 30 metres, is shown on a ruler beside a block of ten floors and a palm tree.';
  static CONTROLS = [];

  css() { return '.svs { padding: 6px; }'; }

  stageHeight(st) { return st.portrait ? 370 : 390; }

  paint(st) {
    const step = this.stepIndex;
    const body = step === 0 ? this._storm(st) : step === 1 ? this._quake(st) : this._run(st);
    return { svg: frame(st, 'ru', body) };
  }

  _storm(st) {
    const W = st.W, H = st.H, P = st.portrait, seaY = H * 0.68;
    let s = `<rect width="${W}" height="${H}" ${fill(sc('cloudDark'))}/>`;
    for (const [a, b, q, sd] of [[0.2, 0.2, 1.2, 3], [0.55, 0.16, 1.5, 7], [0.86, 0.24, 1.1, 5]]) s += svgCloud(W * a, H * b, q * (P ? 0.7 : 1), { seed: sd, kind: 'rain' });
    s += svgRain(W * 0.4, H * 0.24, 1, { w: W * 0.8, h: seaY - H * 0.24, t: 0.4, heavy: true });
    s += svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, bands: 4, t: 1.4, wave: 7, len: 30 });
    // One tall wave rolling at the rock.
    // One tall wave rolling at the rock, its crest leaning forward and curling over.
    const cx = W * 0.44, h = H * 0.34, wd = W * 0.2, top = [];
    for (let i = 0; i <= 80; i++) { const x = -10 + i * (W + 20) / 80, d = x - cx, g = Math.exp(-((d / (d > 0 ? wd * 0.5 : wd * 1.5)) ** 2)), q = h * g; top.push([x + 1.25 * q * (q / h) ** 3, seaY - q]); }
    s += `<path d="${line(top)}L${W + 10} ${seaY + 8}L-10 ${seaY + 8}Z" ${fill(sc('band2'))}/>`;
    s += `<path d="${line(top)}" ${stroke(sc('foam'), 5)}/>`;
    s += svgFoam(cx + h * 1.2, seaY - h + 8, 1, { seed: 2 }) + svgFoam(cx + wd * 0.7, seaY - 8, 0.9, { seed: 4 });
    // The rock shore.
    s += `<path d="M${W} ${seaY - H * 0.34}L${W * 0.86} ${seaY - H * 0.3}L${W * 0.8} ${seaY - 40}L${W * 0.76} ${H}L${W} ${H}Z" ${fill(sc('rock'))}/><path d="M${W * 0.86} ${seaY - H * 0.3}L${W * 0.8} ${seaY - 40}L${W * 0.76} ${H}L${W * 0.84} ${H}L${W * 0.9} ${seaY - 30}Z" ${fill(sc('rockDark'), 'opacity:0.75')}/>`;
    s += svgWaveLine(0, seaY, 1, { w: W, amp: 7, len: 30, t: 1.4 });
    s += svgFoam(W * 0.76, seaY - 4, 1.2, { seed: 6 });
    for (let i = 0; i < 3; i++) { const y = H * (0.34 + i * 0.07), x = W * 0.05 + i * 26; s += `<path d="M${x} ${y}h${70 - i * 8}q12 0 10 10" ${stroke(sc('cloud'), 4)}/>`; }
    s += seaLabel(W * 0.2, H * 0.3, 'Strong wind', { size: P ? 17 : 19, display: true });
    return s;
  }

  _quake(st) {
    const W = st.W, H = st.H, P = st.portrait, seaY = H * 0.26, fy = H * 0.72, jx = W * 0.5, lift = 30;
    let s = `<defs>${svgSkyGradient('ru-sky', 0, 10)}</defs><rect width="${W}" height="${seaY + 40}" style="fill:url(#ru-sky)"/>`;
    s += svgCloud(W * 0.82, seaY * 0.5, 0.5, { seed: 3 });
    const top = []; for (let x = -8; x <= W + 8; x += 8) { const g = Math.exp(-(((x - jx - W * 0.1) / (W * 0.22)) ** 2)); top.push([x, seaY - 22 * g]); }
    s += `<clipPath id="ru-w"><path d="${line(top)}L${W + 8} ${H}L-8 ${H}Z"/></clipPath><g clip-path="url(#ru-w)">${svgSeaColumn(-8, seaY - 30, 1, { w: W + 16, h: H - seaY + 30, bands: 5, wave: 0 })}</g><path d="${line(top)}" ${stroke(sc('foam'), 4)}/>`;
    const rockPts = [[0, fy], [jx - 8, fy], [jx + 8, fy - lift], [W, fy - lift], [W, H], [0, H]];
    s += `<clipPath id="ru-r"><path d="${line(rockPts)}Z"/></clipPath><g clip-path="url(#ru-r)">${svgStrata(0, fy - lift - 6, 1, { w: W, h: H - fy + lift + 10, bands: 4, seed: 5 })}</g>`;
    s += `<path d="M${jx + 8} ${fy - lift}L${jx - 20} ${H}" ${stroke(sc('red'), 5)}/>`;
    for (let i = 0; i < 3; i++) { const x = jx + W * (0.1 + i * 0.1); s += `<path d="M${x} ${fy - lift - 8}V${seaY + 40}" ${stroke(sc('cloud'), 5)}/><path d="M${x - 10} ${seaY + 42}l10 -14l10 14Z" ${fill(sc('cloud'))}/>`; }
    s += seaWhite(W * 0.27, fy - 16, 'Sea floor jumps', { size: P ? 16 : 18, display: true });
    s += seaWhite(W * 0.26, seaY + 56, 'Not wind, not tide', { size: P ? 16 : 18, display: true });
    return s;
  }

  _run(st) {
    const W = st.W, H = st.H, P = st.portrait, sideW = W * (P ? 0.46 : 0.4), base = H * 0.84, k = (base - 40) / 33;
    const Y = (m) => base - m * k, sx = W - sideW;
    let s = `<defs>${svgSkyGradient('ru-sky2', 0, 10)}</defs><rect width="${W}" height="${H}" style="fill:url(#ru-sky2)"/>`;
    // Left: the shore, with the sheet of water at its highest point.
    s += svgSeaColumn(0, base, 1, { w: W, h: H - base, bands: 2, wave: 2 });
    const slope = [[sx * 0.12, base + 6], [sx * 0.72, Y(30)], [sx + 4, Y(36)], [sx + 4, H], [sx * 0.12, H]];
    const sheet = [[-4, base - 1], [sx * 0.12, base - 2], [sx * 0.72, Y(30)], [sx * 0.72 - 40, Y(30) + 14], [sx * 0.2, base - 20], [-4, base - 18]];
    s += `<path d="${line(sheet)}Z" ${fill(sc('band2'))}/><path d="${line(slope)}Z" ${fill(sc('sand'))}/><path d="M${sx * 0.12} ${base + 6}L${sx * 0.72} ${Y(30)}" ${stroke(sc('grass'), 6)}/>`;
    s += `<path d="M${sx * 0.72 - 56} ${Y(30)}H${W - 6}" ${stroke(INK, 3, 'stroke-dasharray:9 8')}/>`;
    s += `<path d="M${sx * 0.1 - 6} ${base}H${W - 6}" ${stroke(INK, 3)}/>`;
    s += seaLabel(sx * 0.42, Y(30) - 10, 'Run-up height', { size: P ? 15 : 18, display: true });
    s += seaLabel(sx * 0.3, base + 26, 'Sea level', { size: 15 });
    // Right: one scale. Ruler, block, palm, standing beside the shore as a size guide, not on it.
    s += `<rect x="${sx}" y="0" width="${sideW}" height="${H}" ${fill(sc('cloud'), 'opacity:0.6')}/>`;
    const bx = sx + sideW * 0.3, bw = sideW * 0.34;
    for (let f = 0; f < 10; f++) {
      const y = Y((f + 1) * 3);
      s += `<rect x="${bx}" y="${y}" width="${bw}" height="${3 * k - 1.4}" ${fill(f % 2 ? sc('metalLit') : sc('metal'))}/>`;
      for (let i = 0; i < 3; i++) s += `<rect x="${bx + 5 + i * (bw - 10) / 3}" y="${y + 3}" width="${(bw - 10) / 3 - 4}" height="${Math.max(3, 3 * k - 8)}" ${fill(sc('planeGlass'))}/>`;
    }
    s += svgPalm(sx + sideW * 0.82, base, 15 * k / 122, { lean: 8 });
    const rx = sx + 22;
    s += `<path d="M${rx} ${base}V${Y(30)}M${rx - 8} ${base}h16M${rx - 8} ${Y(30)}h16" ${stroke(sc('red'), 5)}/>`;
    for (const m of [10, 20]) s += `<path d="M${rx - 5} ${Y(m)}h10" ${stroke(sc('red'), 3)}/>`;
    s += words(sx + sideW / 2, Y(30) - 10, '30 m, 10 floors', { size: P ? 15 : 18, ink: INK, display: true });
    s += words(sx + sideW / 2, base + 26, 'Same scale', { size: 15, ink: INK });
    return s;
  }
}
