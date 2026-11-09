// WaveBreakScene - why a wave breaks. A side section: the sea bed rises to a beach on the right. A wave runs in.
// In deep water it is a low smooth hump; over the shallows its bottom slows, its height grows, its top shears
// ahead and topples. Then the water runs up the beach and back. Each beat rests on its own true frame:
//   beat 0 rests with the crest leaning over (short arrow at the bottom, long arrow at the top)
//   beat 1 rests with the water at the top of its run up the beach
// The button sends the wave again from the start and ends on the same frame.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { dur } from 'simulations/base/kit/SimAnim.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgCloud, svgFoam, svgPalm, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { frame, seaLabel, seaWhite, ctlBar, anim } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];
const END = [0.58, 1];        // where each beat rests, on the wave's life 0..1
const RUN = 4.2;

export class WaveBreakScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1)];
  static WIDTH = 660;
  static HEIGHT = 430;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 450;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A wave comes towards a beach. In shallow water the bottom of the wave drags and slows, the top runs ahead, leans over and topples. Then the water rushes up the beach and slides back.';
  static CONTROLS = [];

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'btn', id: 'go', label: 'Send a wave', go: true }], () => this.play(RUN * END[this.stepIndex]));
    this.repaint();
    this.play(RUN * END[this.stepIndex]);
  }

  css() { return '.svs { padding: 6px; }'; }

  enter() { if (this.ctl) this.after(0, () => this.play(RUN * END[this.stepIndex])); }

  stageHeight(st) { return st.portrait ? 320 : 350; }

  paint(st) {
    const W = st.W, H = st.H, seaY = H * 0.48;
    let body = `<defs>${svgSkyGradient('wb-sky', 0, 10)}</defs><rect width="${W}" height="${seaY + 60}" style="fill:url(#wb-sky)"/>`;
    body += svgCloud(W * 0.24, H * 0.16, 0.6, { seed: 2 });
    body += '<g data-anim="sea"></g>';
    return { svg: frame(st, 'wb', body) };
  }

  animate(st, t) {
    const W = st.W, H = st.H, P = st.portrait, seaY = H * 0.48, step = this.stepIndex;
    const end = END[step], total = dur(RUN * end) || RUN * end, life = Math.min(end, end * (t / total));
    const bedAt = (x) => { const u = x / W; return Math.max(seaY - 34, u < 0.24 ? H * 0.94 : H * 0.94 - (H * 0.94 - seaY + 2) * ((u - 0.24) / 0.54) ** 1.15); };
    const shore = W * 0.78;         // where the bed meets calm water
    const p = Math.min(1, life / 0.74), xc = -W * 0.12 + (W * 0.72 + W * 0.12) * p;
    const grow = 18 + 66 * Math.max(0, (p - 0.25) / 0.75) ** 1.2, wid = W * 0.13 - W * 0.05 * p, shear = 1.3 * Math.max(0, (p - 0.4) / 0.6) ** 1.5;
    const broke = life > 0.74, after = broke ? (life - 0.74) / 0.26 : 0;
    const top = [];
    for (let i = 0; i <= 90; i++) {
      const x = -20 + i * (W + 40) / 90, d = x - xc, g = Math.exp(-((d / (d > 0 ? wid * (1 - 0.5 * p) : wid * 1.3)) ** 2)), h = (broke ? 0 : grow) * g;
      top.push([x + shear * h * (h / Math.max(1, grow)) ** 2, seaY - h]);
    }
    const bedPts = []; for (let x = -20; x <= W + 20; x += 12) bedPts.push([x, bedAt(x)]);
    const clipId = 'wb-w';
    let s = `<clipPath id="${clipId}"><path d="${line(top)}L${W + 20} ${H + 10}L-20 ${H + 10}Z"/></clipPath>`;
    s += `<g clip-path="url(#${clipId})">${svgSeaColumn(-10, seaY - 110, 1, { w: W + 20, h: H - seaY + 120, bands: 3, wave: 0 })}</g>`;
    // Sand over the water's foot.
    s += `<path d="${line(bedPts)}L${W + 20} ${H + 10}L-20 ${H + 10}Z" ${fill(sc('sand'))}/><path d="${line(bedPts.map(([x, y]) => [x, y + 16]))}L${W + 20} ${H + 10}L-20 ${H + 10}Z" ${fill(sc('sandDark'))}/>`;
    s += svgPalm(W * 0.94, bedAt(W * 0.94) + 3, P ? 0.72 : 0.88, { lean: -10 });
    if (broke) {
      // The broken water: foam, and a sheet that rises up the sand.
      const reach = shore + (W * 0.16) * Math.sin(after * Math.PI / 2), sheet = [];
      for (let x = xc - W * 0.04; x <= reach; x += 6) sheet.push([x, Math.min(bedAt(x), seaY) - 7]);
      const under = sheet.slice().reverse().map(([x, y]) => [x, y + 14]);
      s += `<path d="${line(sheet)}L${under.map((q) => q.join(' ')).join('L')}Z" ${fill(sc('band2'))}/>`;
      for (let i = 0; i < 4; i++) s += svgFoam(xc + (reach - xc) * (i / 3) - 10, seaY - 4 - (3 - i), 0.7 + (i % 2) * 0.3, { seed: i + 2 });
    } else if (shear > 0.5) {
      const tx = xc + shear * grow;
      s += svgFoam(tx - 4, seaY - grow + 2, 0.5, { seed: 4 });
    }
    s += `<path d="${line(top)}" ${stroke(sc('foam'), 3.6)}/>`;
    if (step === 0 && life >= end - 0.001) {
      const by = seaY + 30, ty = seaY - grow * 0.72;
      s += `<path d="M${xc - 86} ${ty}H${xc - 14}" ${stroke(sc('cloud'), 6)}/><path d="M${xc - 14} ${ty - 11}l17 11l-17 11Z" ${fill(sc('cloud'))}/>`;
      s += `<path d="M${xc - 44} ${by}H${xc - 22}" ${stroke(sc('sunCore'), 6)}/><path d="M${xc - 22} ${by - 11}l17 11l-17 11Z" ${fill(sc('sunCore'))}/>`;
      s += seaLabel(Math.max(62, xc - 100), ty - 18, 'Top keeps going', { size: P ? 15 : 17 });
      s += seaWhite(Math.max(66, xc - 100), by + 6, 'Bottom slows', { size: P ? 15 : 17 });
    }
    if (step === 1 && life >= end - 0.001) {
      s += `<path d="M${W * 0.62} ${seaY - 58}H${W * 0.84}" ${stroke(sc('ink'), 6)}/><path d="M${W * 0.84} ${seaY - 69}l17 11l-17 11Z" ${fill(sc('ink'))}/>`;
      s += seaLabel(W * 0.54, seaY - 78, 'Water rushes up the beach', { size: P ? 15 : 17 });
    }
    anim(this, 'sea', s);
  }
}
