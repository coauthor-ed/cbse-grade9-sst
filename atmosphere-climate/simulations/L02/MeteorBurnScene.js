// MeteorBurnScene - one meteor through the air. Button "Send a meteor". It enters at the top, the air ahead of it
// squeezes and glows, and it burns out between 80 and 50 km. Beat 1 adds a close view: cold rock, squeezed air.
// Heights true. No speed control. Beat 0 sends one meteor on arrival so the first screen is not still.
// Control names: .mb-go.
import { SvgScene, fill, stroke, mountEl } from 'simulations/base/kit/SimSvg.js';
import { SKY_COLOR_MAP, svgSkyColour as sc } from '../shared/SkyArt.js';
import { words, skyFrame, SKY_WHITE } from '../L01/AirBits.js';

const MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
const FLY = 1.6;
const KM_TOP = 110, KM_BOT = 30;

export class MeteorBurnScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'The sky from 30 to 110 kilometres, with the mesosphere between 50 and 80 kilometres. A meteor falls in from the top, the air ahead of it glows, and it burns out inside the mesosphere. A close view shows a cold rock with squeezed, hot air in front of it.';
  static CONTROLS = [];

  css() { return `.svs { padding: 6px; }
.mb-go { display: block; margin: 8px auto 2px; min-height: 48px; padding: 0 22px; border: var(--sim-border); border-color: var(--sim-accent); border-radius: var(--look-pill); background: var(--sim-bg-surface); color: var(--sim-label); font: 800 16px/1 var(--sim-font); cursor: pointer; box-shadow: 0 var(--sim-lift) 0 var(--sim-accent); }
.mb-go:active { transform: translateY(2px); box-shadow: none; }
.mb-go:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }`; }

  async setup() {
    this._sent = 0;
    await super.setup();
    const go = mountEl(this.root, 'mb-go', 'button');
    go.type = 'button'; go.textContent = 'Send a meteor';
    go.addEventListener('click', () => this._send());
    this.relayout();
    this._send(true);
  }

  enter() { this._flying = false; }

  _send(first) {
    if (first && this._sent) return;
    this._sent += 1;
    this._flying = true;
    this.clockReset();
    this.repaint();
    this.play(FLY + 0.5);
  }

  stageHeight(st) { return st.portrait ? 370 : 350; }

  _y(st, km) { return 8 + (KM_TOP - km) * (st.H - 16) / (KM_TOP - KM_BOT); }

  paint(st) {
    const W = st.W, H = st.H, y = (k) => this._y(st, k), P = st.portrait, step = this.stepIndex;
    let b = `<rect x="0" y="${y(80)}" width="${W}" height="${y(50) - y(80)}" ${fill(sc('seaDeep'), 'opacity:0.6')}/>`;
    for (const k of [80, 50]) b += `<path d="M0 ${y(k)}H${W}" ${stroke(SKY_WHITE, 2.5, 'stroke-dasharray:9 8')}/>${words(12, y(k) + (k === 80 ? -8 : 22), `${k} km`, { size: 17, display: true, ink: SKY_WHITE })}`;
    b += words(W - 14, y(54), 'Mesosphere', { anchor: 'end', size: 20, display: true, ink: SKY_WHITE });
    // old streaks stay: most end here
    if (step === 1) {
      const lx = P ? 104 : W * 0.22, ly = P ? y(48) : y(62), r = P ? 90 : 104;
      b += this._close(lx, ly, r);
    }
    return { svg: skyFrame(st, 'mb', 40, 120, b) };
  }

  _close(x, y, r) {
    // The rock falls down and to the left; the air in front of it is squeezed into a hot cap.
    const rx = x + r * 0.2, ry = y - r * 0.2, q = r * 0.46, cap = r * 0.58;
    const pt = (a, k) => [rx + Math.cos(a) * k, ry + Math.sin(a) * k];
    const [ax, ay] = pt(1.0, cap + 2), [bx, by] = pt(3.7, cap + 2);
    let dots = '';
    for (let i = 0; i < 15; i += 1) { const a = 1.05 + (3.65 - 1.05) * i / 14, [dx, dy] = pt(a, cap + 8 + (i % 2) * 8); dots += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="4" ${fill(sc('liquid'))}/>`; }
    return `<circle cx="${x}" cy="${y}" r="${r}" ${fill(sc('glass'))}/>`
      + `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}A${cap + 2} ${cap + 2} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}" ${stroke(sc('sunRay'), 30)}/>` + dots
      + `<path d="M${rx - q} ${ry + 4}q2 -${q * 0.9} ${q * 0.9} -${q * 0.95}q${q} 0 ${q * 1.05} ${q * 0.9}q0 ${q} -${q * 0.95} ${q * 1.02}q-${q} 0 -${q} -${q * 0.97}Z" ${fill(sc('rockDark'), `stroke:${sc('ink')};stroke-width:3`)}/>`
      + `<circle cx="${x}" cy="${y}" r="${r}" ${stroke(sc('brassDark'), 11)}/><circle cx="${x}" cy="${y}" r="${r}" ${stroke(sc('brass'), 7)}/>`
      + words(rx, ry - 6, 'cold', { size: 16, anchor: 'middle', ink: SKY_WHITE }) + words(rx, ry + 16, 'rock', { size: 16, anchor: 'middle', ink: SKY_WHITE })
      + words(x - r * 0.3, y + r * 0.72, 'hot air', { size: 16, anchor: 'middle', ink: sc('ink') });
  }

  animate(st, t) {
    if (!this._flying) return;
    const L = this.live, u = Math.min(1, t / FLY), W = st.W, y0 = this._y(st, 108), y1 = this._y(st, 58);
    const x0 = W * 0.94, x1 = W * (st.portrait ? 0.6 : 0.5);
    const hx = x0 + (x1 - x0) * u, hy = y0 + (y1 - y0) * u;
    const inAir = Math.max(0, (hy - this._y(st, 100)) / (y1 - this._y(st, 100)));   // brightens once in thicker air
    const size = Math.max(0, 9 * (1 - Math.max(0, (u - 0.55) / 0.45)));
    const dx = x0 - hx, dy = y0 - hy, tail = Math.min(1, 0.2 + inAir * 0.9);
    const tailX = hx + dx * tail * 0.7, tailY = hy + dy * tail * 0.7;
    const fade = 1;
    const html = `<path d="M${tailX.toFixed(1)} ${tailY.toFixed(1)}L${hx.toFixed(1)} ${hy.toFixed(1)}" ${stroke(sc('sunCore'), 3 + 7 * inAir)}/>`
      + `<path d="M${tailX.toFixed(1)} ${tailY.toFixed(1)}L${hx.toFixed(1)} ${hy.toFixed(1)}" ${stroke(sc('sunRay'), 2 + 3 * inAir)}/>`
      + (size > 0 ? `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${(size * (1 + inAir * 1.4)).toFixed(1)}" ${fill(sc('liquid'), 'opacity:0.8')}/><circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${size.toFixed(1)}" ${fill(sc('rockDark'))}/>` : '');
    const tag = t >= FLY && this.stepIndex === 0 ? words(hx - 12, hy + 8, 'burns up here', { anchor: 'end', size: 16, display: true, ink: SKY_WHITE }) : '';
    const g = L.shape('m', 'g', { html: html + (t >= FLY ? `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="8" ${fill(sc('sunCore'))}/>` : '') + tag });
    L.attrs(g, { opacity: fade.toFixed(2) });
  }
}
