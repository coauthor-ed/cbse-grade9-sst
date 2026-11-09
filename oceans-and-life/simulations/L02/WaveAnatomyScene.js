// WaveAnatomyScene - the parts of a wave on one true figure: crest 1.5 m above calm sea level, trough 1.5 m
// below, height 3 m; A and B one wavelength apart; period 4 s; one crest in 4 s is 0.25 a second. Water is drawn
// as water under a sine line. Names light their part. Beat 0: crest, trough, height. Beat 1: wavelength, period,
// frequency, and a button that runs the crest from A to B on a clock. The run rests with the clock at 4 s.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { dur } from 'simulations/base/kit/SimAnim.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { frame, words, seaLabel, seaWhite, ctlBar, anim, INK } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];
const CH0 = [{ id: 'crest', label: 'Crest', targets: ['crest'], tone: 1 }, { id: 'trough', label: 'Trough', targets: ['trough'], tone: 5 }, { id: 'height', label: 'Wave height', targets: ['height', 'calm'], tone: 2 }];
const CH1 = [{ id: 'length', label: 'Wavelength', targets: ['length'], tone: 3 }, { id: 'period', label: 'Wave period', targets: ['period'], tone: 2 }, { id: 'freq', label: 'Wave frequency', targets: ['freq'], tone: 6 }];

export class WaveAnatomyScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1)];
  static WIDTH = 680;
  static HEIGHT = 520;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 530;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'One wave drawn in the water. The crest is 1.5 metres above calm sea level, the trough 1.5 metres below, so the wave height is 3 metres. Points A and B are one wavelength apart, and a crest takes 4 seconds from A to B.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Parts of a wave', chips: CH0, onChange: () => this.repaint() });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.ctl = ctlBar(this, [{ kind: 'btn', id: 'go', label: 'Start the clock', go: true }], () => { this._ran = true; this.play(4); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() { return '.svs { padding: 6px; }'; }

  enter(step) {
    this._ran = false;
    if (!this.tl?.set) return;
    this.tl.set({ chips: step === 0 ? CH0 : CH1, lit: null });
    this.ctl?.show('go', step === 1);
    this.relayout?.();
  }

  stageHeight(st) { return st.portrait ? 320 : 360; }

  paint(st) {
    const W = st.W, H = st.H;
    let body = `<defs>${svgSkyGradient('wa-sky', 0, 10)}</defs><rect width="${W}" height="${H}" style="fill:url(#wa-sky)"/>`;
    body += '<g data-anim="w"></g>';
    return { svg: frame(st, 'wa', body) };
  }

  animate(st, t) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex;
    const calm = H * 0.5, amp = P ? 50 : 58, lam = P ? 196 : 300, aX = (W - lam) / 2, bX = aX + lam;
    const T = dur(4) || 4, run = this._ran ? Math.min(1, t / T) : (step === 1 ? 0 : 0);
    const shift = run * lam;     // the crest travels from A to B
    const y = (x) => calm - amp * Math.cos((x - aX - shift) / lam * Math.PI * 2);
    const pts = []; for (let x = -10; x <= W + 10; x += 6) pts.push([x, y(x)]);
    const on = (id) => !this.tl.off(id);
    let s = `<clipPath id="wa-w"><path d="${line(pts)}L${W + 10} ${H}L-10 ${H}Z"/></clipPath><g clip-path="url(#wa-w)">${svgSeaColumn(-10, calm - amp - 4, 1, { w: W + 20, h: H - calm + amp + 8, bands: 4, wave: 0 })}</g>`;
    s += `<path d="${line(pts)}" ${stroke(sc('foam'), 5)}/>`;
    const dimOf = (id) => (on(id) ? '' : 'opacity:0.24');
    const tagFs = P ? 16 : 18;
    if (step === 0) {
      const crestX = aX, tx = aX + lam / 2;
      s += `<path d="M0 ${calm}H${W}" ${stroke(INK, 3, `stroke-dasharray:9 8;${dimOf('calm')}`)}/>`;
      s += `<g style="${dimOf('calm')}">${seaLabel(P ? W - 8 : W - 12, calm + 22, 'Calm sea level', { anchor: 'end', size: 15 })}</g>`;
      s += `<g style="${dimOf('crest')}"><circle cx="${crestX}" cy="${calm - amp}" r="10" ${fill(sc('crate1'), `stroke:${INK};stroke-width:3`)}/>${seaLabel(crestX, calm - amp - 20, 'Crest', { size: tagFs, display: true })}</g>`;
      s += `<g style="${dimOf('trough')}"><circle cx="${tx}" cy="${calm + amp}" r="10" ${fill(sc('crate2'), `stroke:${INK};stroke-width:3`)}/>${seaWhite(tx, calm + amp + 30, 'Trough', { size: tagFs, display: true })}</g>`;
      const hx = tx + (P ? 52 : 92);
      s += `<g style="${dimOf('height')}"><path d="M${crestX + 14} ${calm - amp}H${hx + 8}" ${stroke(INK, 2.5, 'stroke-dasharray:5 6')}/><path d="M${tx + 14} ${calm + amp}H${hx + 8}" ${stroke(INK, 2.5, 'stroke-dasharray:5 6')}/>`;
      s += `<path d="M${hx} ${calm - amp}V${calm + amp}M${hx - 8} ${calm - amp}h16M${hx - 8} ${calm + amp}h16" ${stroke(sc('sunCore'), 5)}/>`;
      s += seaLabel(Math.min(W - 44, hx + 10), calm - amp - 12, 'Height 3 m', { anchor: P ? 'end' : 'start', size: tagFs, display: true }) + seaWhite(hx - 8, calm - amp / 2 + 5, '1.5 m', { anchor: 'end', size: 15 }) + seaWhite(hx - 8, calm + amp / 2 + 5, '1.5 m', { anchor: 'end', size: 15 }) + '</g>';
    } else {
      const top = calm - amp - 42;
      s += `<g style="${dimOf('length')}"><path d="M${aX} ${top}H${bX}" ${stroke(INK, 4)}/>${seaLabel((aX + bX) / 2, top - 12, 'Wavelength', { size: tagFs, display: true })}</g>`;
      for (const [x, n] of [[aX, 'A'], [bX, 'B']]) {
        s += `<path d="M${x} ${top + 9}V${H - 80}" ${stroke(INK, 2.5, 'stroke-dasharray:6 7')}/><circle cx="${x}" cy="${top}" r="17" ${fill(sc('cloud'), `stroke:${INK};stroke-width:3`)}/>${words(x, top + 6, n, { size: 18, ink: INK, display: true })}`;
      }
      const sec = this._ran ? run * 4 : 0;
      s += `<g style="${dimOf('period')}">${seaWhite(W / 2, H - 58, `Clock: ${sec.toFixed(1)} s`, { size: P ? 19 : 22, display: true })}</g>`;
      s += `<g style="${dimOf('freq')}">${seaWhite(W / 2, H - 28, '1 crest in 4 s = 0.25 each second', { size: P ? 15 : 17 })}</g>`;
      const dy = calm + amp + 22;
      s += `<path d="M14 ${dy}H44" ${stroke(sc('cloud'), 5)}/><path d="M44 ${dy - 9}l13 9l-13 9Z" ${fill(sc('cloud'))}/>` + seaWhite(62, dy + 5, 'Direction of travel', { anchor: 'start', size: 15 });
    }
    s += seaLabel(14, 24, 'An example wave', { anchor: 'start', size: 15 });
    anim(this, 'w', s);
  }
}
