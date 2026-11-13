/**
 * DryDistrictScene - L05 s04 "What to Produce" (2 beats). The book's dry district: sugarcane or millets and pulses.
 *   b0 tradeoff: two fields (landscape side by side, portrait stacked): sugarcane | millets and pulses, each with a
 *                well cut away under it (SimFarm wellSvg; the water line is a picture, no numbers). Tags: sugarcane
 *                "high profit" + "much water"; millets "little water" + "healthy soil". The years run 1..5 by
 *                themselves (0.7 s a year; Skip, then Replay): the water line under sugarcane sinks each year, the
 *                one under millets holds. At rest: year 5.
 *   b1 oc:       the same board at year 5, and a choice: "grow sugarcane" / "grow millets". The field not chosen
 *                is dashed and dim with a "given up" card naming what that field would have given: sugarcane
 *                chosen -> "saved water, healthier soil"; millets chosen -> "high profit, sugar mill supply". At rest: sugarcane chosen.
 * SvgScene; colours are tokens only; ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { farmSpec, farmSvg, wellSvg, tagSvg } from 'simulations/base/kit/SimFarm.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const YEARS = 5;
const YEAR_S = 0.7;
const FRAME_S = 0.1;
const FIELDS = [
  { name: 'sugarcane', strips: [{ crop: 'sugarcane', soil: 'dry' }], tags: ['high profit', 'much water'], tone: 'sugarcane',
    lost: ['high profit,', 'sugar mill supply'], choose: 'grow sugarcane' },
  { name: 'millets and pulses', strips: [{ crop: 'millet', soil: 'dry' }, { crop: 'pulse', soil: 'dry' }], tags: ['little water', 'healthy soil'], tone: 'millet',
    lost: ['saved water,', 'healthier soil'], choose: 'grow millets' },
];
const level = (k, yr) => (k === 0 ? 0.82 - 0.14 * yr : 0.82 - 0.008 * yr);
const f1 = (v) => (+v).toFixed(1);

const CSS = `
.dd-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; align-items: center; gap: 12px; }
.dd-btn { min-height: 44px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.dd-btn:active { transform: translateY(3px); box-shadow: none; }
.dd-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.dd-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.dd-year { font: 800 20px/1 var(--sim-font); color: var(--sim-label); padding: 8px 14px; border-radius: 999px; background: var(--sim-bg-surface); border: 2.5px solid var(--sim-label-muted); }
.dd-tick { animation: dd-tick 0.7s ease-in-out both; }
@keyframes dd-tick { 50% { border-color: var(--sim-accent); } }
.dd-p .dd-btn { font-size: 18px; padding: 4px 12px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" dominant-baseline="central"${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

export class DryDistrictScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 496;
  static PORTRAIT_HEIGHT = 606;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A dry district. Two fields: sugarcane (high profit, much water) and millets and pulses (little water, healthy soil), each with a well under it. Over five years the water in the well under sugarcane sinks each year; the water under millets stays up. Then choose what to grow: the field not chosen is given up. Choosing sugarcane gives up saved water and healthier soil; choosing millets gives up high profit and sugar mill supply.';

  async setup() {
    this.yr = 0;
    this.pick = 0;
    this.running = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      this.act(b.dataset.act, Number(b.dataset.val));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter(step) {
    this.pick = 0;
    this.stopRun();
    if (step === 0) { this.yr = 0; this.startRun(0.4); } else this.yr = YEARS;
  }

  stopRun() {
    for (const t of this._runT ?? []) t();
    this._runT = [];
    this.running = false;
  }

  /** Years 0..5 in FRAME_S frames; each frame a repaint (the SvgScene does not tween). */
  startRun(delay) {
    this.stopRun();
    this.yr = 0;
    this.running = true;
    const frames = Math.round((YEARS * YEAR_S) / FRAME_S);
    for (let k = 1; k <= frames; k++) {
      this._runT.push(this.after(delay + k * FRAME_S, () => {
        this.yr = Math.min(YEARS, (k * FRAME_S) / YEAR_S);
        if (k === frames) { this.yr = YEARS; this.running = false; }
        this.repaint();
      }));
    }
  }

  act(a, v) {
    if (this.stepIndex === 0) {
      if (a === 'skip') { this.stopRun(); this.yr = YEARS; } else if (a === 'replay') this.startRun(0.2); else return;
    } else if (a === 'pick' && (v === 0 || v === 1)) this.pick = v;
    else return;
    this.repaint();
  }

  stageHeight(st) { return st.portrait ? 580 : 470; }

  /** One field block: name, tags, field, well. Box = { x, y, w } for the block; P = portrait (well beside field). */
  block(k, b, P, oc) {
    const F = FIELDS[k], given = oc && this.pick !== k, chosen = oc && this.pick === k;
    const cx = b.x + b.w / 2;
    let s = `<g style="opacity:${given ? 0.32 : 1}">`;
    s += text(cx, b.y + 14, F.name, P ? 22 : 23);
    // The two tags: in a row in portrait, stacked in landscape.
    if (P) {
      s += tagSvg(F.tags[0], cx - 82, b.y + 50, { size: 18, tone: F.tone }) + tagSvg(F.tags[1], cx + 82, b.y + 50, { size: 18, tone: F.tone });
    } else {
      s += tagSvg(F.tags[0], cx, b.y + 52, { size: 19, tone: F.tone }) + tagSvg(F.tags[1], cx, b.y + 88, { size: 19, tone: F.tone });
    }
    const fw = P ? 186 : b.w - 34, fh = P ? 92 : 112, fx = P ? b.x + 14 : cx - fw / 2, fy = b.y + (P ? 82 : 118);
    const spec = farmSpec({ strips: F.strips, orient: 'cols', w: fw, h: fh, gap: 8 });
    s += farmSvg(spec, { x: fx, y: fy, tags: false, lit: chosen ? () => true : undefined });
    const lv = Math.max(0.05, level(k, this.yr));
    if (P) {
      const wx = b.x + b.w - 70, gy = fy + fh + 4;
      s += `<line x1="${f1(fx + fw + 14)}" y1="${f1(gy)}" x2="${f1(b.x + b.w - 6)}" y2="${f1(gy)}" style="stroke:var(--sim-waste);stroke-width:3;stroke-linecap:round"/>`;
      s += wellSvg({ x: wx, y: gy, w: 62, depth: 86, level: lv, soil: 'dry' });
      s += `<path d="M${f1(fx + fw + 4)} ${f1(fy + fh / 2)}L${f1(wx - 40)} ${f1(gy - 30)}" style="stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:4 6;stroke-linecap:round"/>`;
    } else {
      const gy = fy + fh + 34;
      s += wellSvg({ x: cx, y: gy, w: 66, depth: 124, level: lv, soil: 'dry' });
    }
    s += '</g>';
    if (given) {
      const h = P ? 250 : 400;
      s += `<rect x="${f1(b.x + 2)}" y="${f1(b.y - 6)}" width="${f1(b.w - 4)}" height="${f1(h)}" rx="18" ${fill('none', 'stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:10 7')}/>`;
      const cy = b.y + (P ? 128 : 200), cw = P ? 230 : Math.min(b.w - 20, 240);
      s += `<rect x="${f1(cx - cw / 2)}" y="${f1(cy - 58 + 4)}" width="${f1(cw)}" height="116" rx="16" ${fill('var(--sim-stroke)')}/>`;
      s += `<rect x="${f1(cx - cw / 2)}" y="${f1(cy - 58)}" width="${f1(cw)}" height="116" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:8 5')}/>`;
      s += text(cx, cy - 32, 'given up', 22, 'var(--sim-bad)');
      s += text(cx, cy + 4, F.lost[0], 20) + text(cx, cy + 32, F.lost[1], 20);
    } else if (chosen) {
      s += `<rect x="${f1(b.x + 2)}" y="${f1(b.y - 6)}" width="${f1(b.w - 4)}" height="${f1(P ? 250 : 400)}" rx="18" ${fill('none', 'stroke:var(--sim-accent);stroke-width:4')}/>`;
    }
    return s;
  }

  paint(st) {
    const P = st.portrait, W = st.W, oc = this.stepIndex === 1;
    let svg = '', over = '';
    const boxes = P ? [{ x: 4, y: 10, w: W - 8 }, { x: 4, y: 276, w: W - 8 }] : [{ x: 6, y: 10, w: W / 2 - 12 }, { x: W / 2 + 6, y: 10, w: W / 2 - 12 }];
    svg += this.block(0, boxes[0], P, oc) + this.block(1, boxes[1], P, oc);
    const rowY = P ? 556 : 446;
    let row;
    if (!oc) {
      const y = Math.min(YEARS, Math.max(this.yr > 0 ? 1 : 0, Math.ceil(this.yr - 1e-6)));
      const btn = this.running
        ? '<button type="button" class="sv-hit dd-btn tap btn" data-act="skip" data-val="0">Skip</button>'
        : '<button type="button" class="sv-hit dd-btn tap btn" data-act="replay" data-val="0">Replay 5 years</button>';
      row = `<span class="dd-year${this.running ? ' dd-tick' : ''}" role="status">${y === 0 ? 'year 0' : `year ${y} of ${YEARS}`}</span>${btn}`;
    } else {
      row = FIELDS.map((F, k) => `<button type="button" class="sv-hit dd-btn tap btn" data-act="pick" data-val="${k}" aria-pressed="${this.pick === k}">${F.choose}</button>`).join('');
    }
    over += `<div class="${P ? 'dd-p' : 'dd-l'}"><div class="dd-row" style="top:${rowY}px">${row}</div></div>`;
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, year: +this.yr.toFixed(2), pick: this.pick, running: this.running }; }
}
