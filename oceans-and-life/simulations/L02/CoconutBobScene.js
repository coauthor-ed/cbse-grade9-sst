// CoconutBobScene - what water does under a wave. The physics is the small circle: a point at rest position
// (x0, z) in water goes round a circle of radius a * e^(-z / L), forward on the crest and back in the trough.
// The wave passes from left to right. Mounted twice:
//   1 beat, the predict: a still sea, a coconut, ten waves coming, no outcome shown.
//   3 beats, blk-l02-s03: beat 0 ten waves pass and the coconut ends where it began, with a marker there;
//   beat 1 two marked drops, and the circles they leave, smaller with depth; beat 2 a row of drops, each going
//   round in turn while the energy goes on. Each run ends on a whole number of waves, so the rest frame is true.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { dur } from 'simulations/base/kit/SimAnim.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgCloud, svgFish, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { frame, seaLabel, seaWhite, ctlBar, anim } from '../shared/SeaBits.js';

const S_SETUP = 0, S_BOB = 1, S_CIRCLE = 2, S_ENERGY = 3;
const one = (idx) => [{ idx, dwellMs: null }];
const PERIOD = 1.7, A = 28, L = 95, WAVES = { [S_BOB]: 10, [S_CIRCLE]: 3, [S_ENERGY]: 4 };

export class CoconutBobScene extends SvgScene {
  static BEAT_STEP_MAP = [one(S_BOB), one(S_CIRCLE), one(S_ENERGY)];
  static BEAT_MAPS = { [Number.MAX_SAFE_INTEGER]: [one(S_SETUP)], 1: [one(S_SETUP)], 3: [one(S_BOB), one(S_CIRCLE), one(S_ENERGY)] };
  // A setup mount on a predict gets onBeatChange(MAX, MAX) from the host, so MAX has its own map.
  static WIDTH = 640;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 470;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A coconut floats on the sea as waves pass. It goes up on each crest and down in each trough. Marked water drops go round small circles, smaller deeper down, and each ends near where it began while the wave moves on.';
  static CONTROLS = [];

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'btn', id: 'go', label: 'Send the waves', go: true }], () => this._run());
    this.enter(this.stepIndex);
    this.repaint();
    this._run();
  }

  css() { return '.svs { padding: 6px; } .sim-dom-root--portrait.svs { padding: 4px 0; }'; }

  enter(step) {
    this.ctl?.show('go', step !== S_SETUP);
    this.ctl?.label('go', step === S_BOB ? 'Send ten waves' : 'Send the waves');
    if (this.ctl && step !== S_SETUP) this.after(0, () => this._run());
  }

  _run() { if (this.stepIndex !== S_SETUP) this.play((WAVES[this.stepIndex] ?? 1) * PERIOD); }

  stageHeight(st) { return st.portrait ? 340 : 370; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, seaY = H * 0.3;
    let body = `<defs>${svgSkyGradient('cb-sky', 0, 10)}</defs><rect width="${W}" height="${seaY + 40}" style="fill:url(#cb-sky)"/>`;
    body += svgCloud(W * 0.56, seaY * 0.4, P ? 0.46 : 0.6, { seed: 4 });
    body += '<g data-anim="sea"></g>';
    return { svg: frame(st, 'cb', body) };
  }

  animate(st, t) {
    const W = st.W, H = st.H, P = st.portrait, seaY = H * 0.3, step = this.stepIndex, k = Math.PI * 2 / (P ? 230 : 300), om = Math.PI * 2 / PERIOD;
    const total = (WAVES[step] ?? 1) * PERIOD, run = dur(total) || total;
    const u = step === S_SETUP ? 0 : Math.min(t, run);
    const amp = step === S_SETUP ? 2 : A * Math.sin(Math.min(1, (u + 0.2) / 0.8) * Math.PI / 2);
    const cx = W * 0.5, phase = (x) => k * (x - cx) - om * (run - u) * -1;
    // Surface: the trochoid of the drops at the surface.
    const surf = []; for (let x = -30; x <= W + 30; x += 8) { const p = phase(x); surf.push([x + amp * Math.sin(p) * 0.9, seaY - amp * Math.cos(p)]); }
    let s = svgSeaColumn(0, seaY + 34, 1, { w: W, h: H - seaY - 34, bands: 4, t: 0.4, wave: 1 });
    s = `<path d="${line(surf)}L${W + 30} ${seaY + 60}L-30 ${seaY + 60}Z" ${fill(sc('band1'))}/>${s}`;
    s += `<path d="${line(surf)}" ${stroke(sc('foam'), 4)}/>`;
    if (step !== S_ENERGY) s += svgFish(W * 0.2, H * 0.86, 0.5, { kind: 1 });
    const at = (x0, z) => { const a = amp * Math.exp(-z / L), p = phase(x0); return [x0 + a * Math.sin(p) * 0.9, seaY + z - a * Math.cos(p)]; };
    const dot = (x, y, r, tone) => `<circle cx="${x}" cy="${y}" r="${r}" ${fill(tone, `stroke:${sc('ink')};stroke-width:2.5`)}/>`;
    const coconut = (x, y) => `<ellipse cx="${x}" cy="${y - 4}" rx="20" ry="17" ${fill(sc('woodDark'))}/><ellipse cx="${x - 5}" cy="${y - 9}" rx="11" ry="8" ${fill(sc('wood'))}/><ellipse cx="${x + 8}" cy="${y + 1}" rx="4" ry="3" ${fill(sc('ink'))}/>`;
    if (step === S_SETUP) {
      s += coconut(cx, seaY - 4);
      s += seaWhite(W * 0.24, seaY + 62, 'Ten waves coming', { size: P ? 16 : 18 });
      s += `<path d="M${W * 0.08} ${seaY + 80}H${W * 0.38}" ${stroke(sc('cloud'), 6)}/><path d="M${W * 0.38} ${seaY + 69}l16 11l-16 11Z" ${fill(sc('cloud'))}/>`;
      s += seaLabel(W - 10, 22, 'Beach this way', { anchor: 'end', size: 15 });
    }
    if (step === S_BOB) {
      const [x, y] = at(cx, 0);
      s += `<path d="M${cx} ${seaY - 44}V${seaY + 52}" ${stroke(sc('cloud'), 3, 'stroke-dasharray:7 7')}/>`;
      s += seaWhite(cx + 12, seaY + 56, 'Where it started', { anchor: 'start', size: 15 });
      s += coconut(x, y);
      const n = u >= run - 0.01 ? 10 : Math.min(10, Math.floor(u / run * 10));
      s += seaLabel(14, 28, `Waves passed: ${n}`, { anchor: 'start', size: P ? 17 : 19, display: true });
    }
    if (step === S_CIRCLE) {
      for (const [z, tone] of [[0, sc('sunCore')], [52, sc('crate1')], [112, sc('crate4')]]) {
        const r = amp * Math.exp(-z / L), x0 = cx, y0 = seaY + z;
        // The circle is the trace the drop leaves: it closes after one wave.
        s += `<circle cx="${x0}" cy="${y0}" r="${r}" pathLength="1" transform="rotate(-90 ${x0} ${y0})" ${stroke(sc('cloud'), 3.5, `stroke-dasharray:${Math.min(1, (u + 0.05) / PERIOD).toFixed(3)} 1;fill:none`)}/>`;
        const [x, y] = at(x0, z);
        s += dot(x, y, 10, tone);
      }
      s += seaWhite(cx - 42, seaY + 6, 'Near the surface', { anchor: 'end', size: 15 });
      s += seaWhite(cx, seaY + 150, 'Smaller deeper down', { size: 15 });
    }
    if (step === S_ENERGY) {
      const n = P ? 6 : 9;
      for (let i = 0; i < n; i++) {
        const x0 = cx + (i - (n - 1) / 2) * W / n, r = amp * Math.exp(-46 / L), y0 = seaY + 46;
        s += `<circle cx="${x0}" cy="${y0}" r="${r}" ${stroke(sc('cloud'), 2.4, 'stroke-dasharray:5 6;fill:none;opacity:0.6')}/>`;
        const [x, y] = at(x0, 46);
        s += dot(x, y, 8, sc('sunCore'));
      }
      const y = H * 0.78, ax = W * 0.1 + W * 0.68 * (u / run);
      s += `<path d="M${W * 0.08} ${y}H${ax}" ${stroke(sc('sunCore'), 7)}/><path d="M${ax} ${y - 13}l20 13l-20 13Z" ${fill(sc('sunCore'))}/>`;
      s += seaWhite(W * 0.46, y + 34, 'Energy moves on', { size: P ? 17 : 19, display: true });
      s += seaWhite(W * 0.46, y - 18, 'Each drop stays near its place', { size: 16 });
    }
    anim(this, 'sea', s);
  }
}
