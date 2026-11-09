// SeamountGuyotScene - one volcano through its life, then the deep shapes of the sea floor. Four beats:
//   beat 0  the ridge cut open: rift valley along its top, magma rising below
//   beat 1  a step control grows the volcano: under the surface it is a seamount, through it a volcanic island
//   beat 2  a step control wears the island flat, then it sinks: a guyot, true order and sea level kept
//   beat 3  trench, submarine canyon and abyssal hills on the section
// Each beat rests on its own last stage from a cold start; a press changes the stage and the chip says which.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgWaveLine, svgStrata, svgCloud, svgFoam, svgSeaColour as sc, svgSkyGradient } from '../shared/SeaArt.js';
import { svgSeaFloor, mapper, floorDepth, FEATURES } from '../shared/SeaFloor.js';
import { frame, seaLabel, seaWhite, ctlBar } from '../shared/SeaBits.js';

const S_RIDGE = 0, S_GROW = 1, S_WEAR = 2, S_DEEP = 3;
const one = (idx) => [{ idx, dwellMs: null }];
const GROW = [{ value: 'sea', label: 'Seamount' }, { value: 'isl', label: 'Volcanic island' }];
const WEAR = [{ value: 'isl', label: 'Island' }, { value: 'flat', label: 'Worn flat' }, { value: 'guy', label: 'Guyot' }];

export class SeamountGuyotScene extends SvgScene {
  static BEAT_STEP_MAP = [one(S_RIDGE), one(S_GROW), one(S_WEAR), one(S_DEEP)];
  static WIDTH = 640;
  static HEIGHT = 480;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 480;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A volcano on the sea floor seen from the side. Under the surface it is a seamount, through the surface a volcanic island. Waves wear its top flat, and it sinks as a guyot. A ridge with a rift valley, and a trench and canyon, are also shown.';
  static CONTROLS = [];

  _grow = 'isl';
  _wear = 'guy';

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [
      { kind: 'seg', id: 'grow', label: 'Stage', options: GROW, value: 'isl' },
      { kind: 'seg', id: 'wear', label: 'Stage', options: WEAR, value: 'guy' },
    ], (id, v) => { if (id === 'grow') this._grow = v; else this._wear = v; this.repaint(); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  css() { return '.svs { padding: 6px; }'; }

  enter(step) {
    this._grow = 'isl'; this._wear = 'guy';
    if (!this.ctl) return;
    this.ctl.set('grow', 'isl'); this.ctl.set('wear', 'guy');
    this.ctl.show('grow', step === S_GROW);
    this.ctl.show('wear', step === S_WEAR);
  }

  stageHeight(st) { return st.portrait ? 360 : 400; }

  _volcanoScene(st, top, flat) {
    // top: height of the summit as a part of the sea depth (1 reaches the surface). flat: half width of a flat top, px.
    const W = st.W, H = st.H, P = st.portrait, seaY = H * 0.3, floorY = H * 0.8, depth = floorY - seaY, cx = W * 0.5;
    const baseW = W * (P ? 0.46 : 0.36), ty = floorY - depth * top;
    let body = `<defs>${svgSkyGradient('sg-sky', 0, 12)}</defs><rect width="${W}" height="${seaY + 4}" style="fill:url(#sg-sky)"/>`;
    body += svgCloud(W * 0.8, seaY * 0.46, P ? 0.5 : 0.66, { seed: 4 });
    body += svgSeaColumn(0, seaY, 1, { w: W, h: floorY - seaY + 12, bands: 5, t: 1.1, wave: 3 });
    const pts = [[cx - baseW, floorY + 2], [cx - baseW * 0.55, floorY - depth * top * 0.34], [cx - Math.max(flat, 16), ty + (flat ? 0 : 6)]];
    const pts2 = [[cx + Math.max(flat, 16), ty + (flat ? 0 : 6)], [cx + baseW * 0.55, floorY - depth * top * 0.34], [cx + baseW, floorY + 2]];
    const cone = `M${pts[0].join(' ')}Q${pts[1].join(' ')} ${pts[2].join(' ')}${flat ? `L${pts2[0].join(' ')}` : `Q${cx} ${ty - 12} ${pts2[0].join(' ')}`}Q${pts2[1].join(' ')} ${pts2[2].join(' ')}Z`;
    const shade = `M${cx + 4} ${ty}L${pts2[0].join(' ')}Q${pts2[1].join(' ')} ${pts2[2].join(' ')}L${cx + 18} ${floorY}Z`;
    body += `<path d="${cone}" ${fill(sc('rock'))}/><path d="${shade}" ${fill(sc('rockDark'), 'opacity:0.7')}/>`;
    body += `<path d="M${cx - baseW * 0.62} ${floorY - depth * top * 0.2}Q${cx} ${floorY - depth * top * 0.32} ${cx + baseW * 0.62} ${floorY - depth * top * 0.2}M${cx - baseW * 0.34} ${floorY - depth * top * 0.56}Q${cx} ${floorY - depth * top * 0.64} ${cx + baseW * 0.34} ${floorY - depth * top * 0.56}" ${stroke(sc('rockDeep'), 3, 'opacity:0.4')}/>`;
    body += svgStrata(0, floorY, 1, { w: W, h: H - floorY, bands: 3, seed: 6 });
    body += svgSeaFloorSkin(W, floorY);
    return { body, seaY, floorY, ty, cx };
  }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex;
    let body = '';
    if (step === S_RIDGE || step === S_DEEP) {
      const from = step === S_RIDGE ? 660 : 800, to = step === S_RIDGE ? 850 : 1000, bw = W * 1000 / (to - from);
      const box = { x: -bw * from / 1000, y: 0, w: bw, h: H, seaY: H * (step === S_RIDGE ? 0.16 : 0.14) };
      const mp = mapper(box);
      const X = mp.X, Y = (x) => mp.Y(floorDepth(x));
      body += `<defs>${svgSkyGradient('sg-sky2', 0, 12)}</defs><rect width="${W}" height="${box.seaY + 4}" style="fill:url(#sg-sky2)"/>`;
      body += svgSeaColumn(0, box.seaY, 1, { w: W, h: H - box.seaY, bands: 6, t: 1, wave: 2.4 });
      body += svgSeaFloor(box, { from, to, step: 2 }) + svgWaveLine(0, box.seaY, 1, { w: W, amp: 2.4, t: 1 });
      const tag = (id, dy, dx = 0) => { const q = FEATURES.find((z) => z.id === id), x = Math.max(70, Math.min(W - 70, X(q.x) + dx)); return seaWhite(x, Y(q.x) + dy, q.name, { size: P ? 16 : 18, display: true }); };
      if (step === S_RIDGE) {
        body += tag('rift', -18) + seaWhite(W * 0.28, box.seaY + 34, 'Mid-ocean ridge', { size: P ? 17 : 19, display: true }) + seaWhite(X(756), mp.base + 26, 'Magma', { size: 16 });
      } else {
        body += tag('trench', -24, -40) + seaWhite(Math.min(W - 92, X(930)), box.seaY + 40, 'Submarine canyon', { size: P ? 15 : 17, display: true });
        body += `<path d="M${X(930)} ${box.seaY + 48}L${X(930)} ${Y(930) - 8}" ${stroke(sc('cloud'), 3)}/>`;
      }
      body += step === S_RIDGE ? seaWhite(W - 10, 22 + box.seaY, 'Not to scale', { anchor: 'end', size: 15 }) : seaWhite(14, 22 + box.seaY, 'Not to scale', { anchor: 'start', size: 15 });
    } else {
      const v = step === S_GROW ? this._grow : this._wear;
      const top = v === 'sea' ? 0.7 : v === 'isl' ? 1.1 : v === 'flat' ? 1.0 : 0.72, flat = v === 'flat' || v === 'guy' ? (P ? 56 : 74) : 0;
      const d = this._volcanoScene(st, top, flat);
      body += d.body + svgWaveLine(0, d.seaY, 1, { w: W, amp: 3, t: 1.1 });
      if (v === 'flat') body += svgFoam(d.cx - 66, d.seaY + 1, 0.8) + svgFoam(d.cx + 66, d.seaY + 1, 0.8, { seed: 5 });
      if (v === 'isl') body += `<path d="M${d.cx - 7} ${d.ty - 8}q-8 -14 6 -22q-6 -12 10 -18" ${stroke(sc('whiteShade'), 7)}/>`;
      const name = { sea: 'Seamount', isl: 'Volcanic island', flat: 'Top worn flat by waves', guy: 'Guyot' }[v];
      body += seaLabel(W / 2, 26, name, { size: P ? 20 : 24, display: true });
      if (v === 'guy') body += seaWhite(W - 10, d.floorY - 14, 'Sunk below the sea', { anchor: 'end', size: 15 });
      if (v === 'flat') body += seaWhite(W - 10, d.floorY - 14, 'Over a very long time', { anchor: 'end', size: 15 });
    }
    return { svg: frame(st, 'sg', body) };
  }
}

function svgSeaFloorSkin(W, y) {
  return `<rect x="0" y="${y - 3}" width="${W}" height="8" ${fill(sc('sand'))}/>`;
}
