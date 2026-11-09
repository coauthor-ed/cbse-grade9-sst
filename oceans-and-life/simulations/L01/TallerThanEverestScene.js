// TallerThanEverestScene - real numbers on one true scale. Sea level is one line across the stage.
//   beat 0  Mount Everest above the line and the Mariana Trench below it: the trench could hold Everest.
//   beat 1  Everest beside Mauna Kea, mostly under water. A switch moves the measuring line: from sea level, or
//           from each mountain's own base. The switch rests on sea level from a cold start.
// Numbers: Everest 8,849 m above sea level; Mauna Kea about 4,200 m above it, about 10,000 m base to top;
// Mariana about 11 km deep; ridge about 65,000 km long.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgWaveLine, svgCloud, svgStrata, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { frame, words, seaLabel, seaWhite, ctlBar, INK } from '../shared/SeaBits.js';

const S_REC = 0, S_MEASURE = 1;
const one = (idx) => [{ idx, dwellMs: null }];
const TOP_M = 10000, BOT_M = 12000;

// A mountain shape: a craggy outline from foot to peak, in stage px.
function crag(cx, foot, peak, hw, seed = 1) {
  const pts = [[cx - hw, foot]];
  const n = 7;
  for (let i = 1; i < n; i++) { const u = i / n, wob = Math.sin(i * 2.4 + seed) * 0.05; pts.push([cx - hw * (1 - u) + hw * wob * 0.6, foot + (peak - foot) * (u * u * 0.3 + u * 0.7)]); }
  pts.push([cx, peak]);
  for (let i = n - 1; i > 0; i--) { const u = i / n, wob = Math.sin(i * 3.1 + seed) * 0.05; pts.push([cx + hw * (1 - u) + hw * wob * 0.6, foot + (peak - foot) * (u * u * 0.3 + u * 0.7)]); }
  pts.push([cx + hw, foot]);
  return pts;
}

export class TallerThanEverestScene extends SvgScene {
  static BEAT_STEP_MAP = [one(S_REC), one(S_MEASURE)];
  static WIDTH = 640;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 520;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'Mountains and the deepest trench on one scale with sea level across the middle. Everest stands 8,849 metres above sea level. The Mariana Trench goes about 11 kilometres down. Mauna Kea rises about 10,000 metres from the sea floor, about 4,200 metres above sea level.';
  static CONTROLS = [];

  _from = 'sea';

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'seg', id: 'from', label: 'Measure from', options: [{ value: 'sea', label: 'From sea level' }, { value: 'base', label: 'From its own base' }], value: 'sea' }], (id, v) => { this._from = v; this.repaint(); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  css() { return '.svs { padding: 6px; }'; }

  enter(step) {
    this._from = 'sea';
    this.ctl?.set('from', 'sea');
    this.ctl?.show('from', step === S_MEASURE);
  }

  stageHeight(st) { return st.portrait ? 390 : 410; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex;
    const pad = 12, k = (H - 2 * pad) / (TOP_M + BOT_M), seaY = pad + TOP_M * k, Y = (m) => seaY - m * k;
    const floorDeep = Y(-5400);
    const everestX = W * 0.24, hwE = W * 0.17;
    const secondX = W * (P ? 0.72 : 0.7);
    let body = `<defs>${svgSkyGradient('tt-sky', 0, 12)}</defs><rect width="${W}" height="${seaY + 3}" style="fill:url(#tt-sky)"/>`;
    body += svgCloud(W * 0.62, Y(8200), P ? 0.42 : 0.56, { seed: 3 });
    body += svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, bands: 6, t: 0.9, wave: 2 });
    // Land under Everest: a continent standing on sea level.
    const land = [[0, H], [0, seaY - 8], [W * 0.42, seaY - 2], [W * 0.44, seaY + 30], [W * 0.5, floorDeep], [W, floorDeep], [W, H]];
    if (step === S_REC) {
      const tx = W * 0.72, tw = W * 0.09, tb = Y(-11000);
      const fl = [[0, H], [0, seaY - 8], [W * 0.46, seaY - 2], [W * 0.5, seaY + 44], [W * 0.55, floorDeep], [tx - tw * 1.7, floorDeep], [tx - tw * 0.6, Y(-8200)], [tx - tw * 0.16, tb], [tx + tw * 0.16, tb], [tx + tw * 0.6, Y(-8200)], [tx + tw * 1.7, floorDeep], [W, floorDeep - 12], [W, H]];
      body += this._rock(fl, W, H, seaY);
      body += this._peak(everestX, seaY - 2, Y(8849), hwE, 2);
      body += this._rule(tx, seaY, tb, 'about 11 km', true, P);
      body += seaLabel(Math.min(W - 100, everestX + hwE + 12), Y(7400), 'Everest', { anchor: 'start', size: 19, display: true });
      body += seaLabel(Math.min(W - 100, everestX + hwE + 12), Y(6000), '8,849 m', { anchor: 'start', size: 17 });
      body += seaWhite(W * 0.36, H - 16, 'Mariana Trench', { size: 18, display: true });
      body += seaWhite(W * 0.36, H - 40, 'Deepest place on Earth', { size: 14 });
    } else {
      body += this._rock(land, W, H, seaY);
      body += this._peak(everestX, seaY - 2, Y(8849), hwE, 2);
      const mkBase = floorDeep, mkPeak = Y(4200), hwM = W * 0.2;
      body += this._peak(secondX, mkBase + 2, mkPeak, hwM, 5, true);
      body += `<clipPath id="tt-under"><rect x="0" y="${seaY}" width="${W}" height="${H}"/></clipPath><g clip-path="url(#tt-under)"><path d="${line(crag(secondX, mkBase + 2, mkPeak, hwM, 5))}Z" ${fill(sc('seaMid'), 'opacity:0.34')}/></g>`;
      const fromSea = this._from === 'sea';
      body += this._rule(everestX, seaY - 2, Y(8849), '8,849 m', false, P, -1);
      if (fromSea) {
        body += this._rule(secondX, seaY, mkPeak, 'about 4,200 m', false, P, 0, mkPeak - 22);
        body += `<path d="M0 ${seaY}H${W}" ${stroke(sc('sunCore'), 4)}/>`;
        body += seaLabel(W / 2, seaY - 8, 'Sea level', { size: 15 });
      } else {
        body += this._rule(secondX, mkBase, mkPeak, 'about 10,000 m', false, P, 0);
        body += `<path d="M${secondX - hwM - 4} ${mkBase}H${secondX + hwM + 4}" ${stroke(sc('sunCore'), 4)}/>`;
      }
      body += seaLabel(everestX, Y(9400) + 4, 'Everest', { size: 18, display: true });
      body += seaLabel(secondX, mkPeak - (fromSea ? 48 : 14), 'Mauna Kea', { size: 18, display: true });
    }
    body += svgWaveLine(0, seaY, 1, { w: W, amp: 2, t: 0.9 });
    return { svg: frame(st, 'tt', body) };
  }

  _rock(pts, W, H, seaY) {
    const id = 'tt-rock';
    return `<clipPath id="${id}"><path d="${line(pts)}Z"/></clipPath><g clip-path="url(#${id})">${svgStrata(0, seaY - 12, 1, { w: W, h: H - seaY + 14, bands: 5, seed: 3 })}</g>`;
  }

  _peak(cx, foot, peak, hw, seed, sea) {
    const pts = crag(cx, foot, peak, hw, seed), n = pts.length, half = pts.slice(Math.floor(n / 2));
    const snowY = peak + (foot - peak) * 0.2;
    const snow = pts.filter(([, y]) => y <= snowY);
    return `<path d="${line(pts)}Z" ${fill(sc(sea ? 'rockMid' : 'rock'))}/><path d="${line(half)}L${cx} ${foot}Z" ${fill(sc('rockDark'), 'opacity:0.7')}/>`
      + (sea ? `<path d="M${cx - 12} ${peak + 6}Q${cx} ${peak - 3} ${cx + 12} ${peak + 6}" ${stroke(sc('sand'), 6)}/>` : `<path d="${line(snow)}Z" ${fill(sc('snow'))}/>`);
  }

  // A measuring line with a reading in a pill beside it.
  _rule(x, y0, y1, text, down, P, side = 1, at = null) {
    const col = sc('sunCore'), mid = at ?? (y0 + y1) / 2, tw = text.length * 8.4 + 22, tx = side > 0 ? x + 12 : side < 0 ? x - 12 - tw : x - tw / 2;
    const lx = Math.min(this.sv.W - tw - 8, Math.max(8, tx));
    return `<path d="M${x} ${y0}L${x} ${y1}" ${stroke(col, 5)}/><path d="M${x - 9} ${y0}h18M${x - 9} ${y1}h18" ${stroke(col, 5)}/>`
      + `<rect x="${lx}" y="${mid - 15}" width="${tw}" height="30" rx="15" ${fill(sc('cloud'), `stroke:${INK};stroke-width:2.5`)}/>`
      + words(lx + tw / 2, mid + 6, text, { size: 16, ink: INK, display: true });
  }
}
