/**
 * SupplyCompareScene-mapped - blk-l03-s08, the L03 closing hook, "Both Sides Are Mapped".
 * Base class SvgScene, the same plane as the s05 scene: the supply side, drawn complete and cold,
 * and then the ground it does not claim. The curve vocabulary is IMPORTED from the sibling the stub
 * names (`./SupplyCompareScene.js`), so this scene cannot drift from s05's six points, its two
 * slopes or its axis ranges - the stub's first Must-get-right holds by construction.
 *
 *   beat 0  the plane is finished: both curves, all six points lit and lettered, axes as on s05.
 *           The learner's job here is READING it - tap a point, its guide drops to both axes and
 *           a kg chip names it. Nothing is plotted; the map is already complete.
 *   beat 1  the farmer's unmapped world greys in as three muted labels in the plot's open ground
 *           (wheat beside chickpeas, traders in the district, new irrigation). Tap one and it
 *           lifts to its own tone. Labels only: no number, no third curve, nothing the lesson has
 *           not taught about what each one does.
 *   beat 2  the closing ask, raised over the plane.
 *
 * Labels only - the prose is in the slide. No run anywhere: no `after`, no loop, no auto-play.
 */
import { SvgScene, chip } from 'simulations/base/kit/SimSvg.js';
import { axesSvg } from 'simulations/base/kit/SimChart.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';
import { SUPPLY_CURVES, supplyPlane, supplyCurveSvg, supplyGuides } from './SupplyCompareScene.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);

const RUPEE = '\u20b9';
// The open factors, in the unmapped ground above the market curve: a ladder climbing up, one at a
// time. Only the label - the slide's own words, no sub-caption, no number. `tone` is its own
// series colour once the learner has raised it; `p` is the price the label sits at on the plane.
const FACTORS = [
  { id: 'water', tone: 5, text: 'new irrigation', p: 150 },
  { id: 'traders', tone: 2, text: 'traders in the district', p: 126 },
  { id: 'crop', tone: 8, text: 'wheat or chickpeas', p: 102 },
];
// [derived] Measured off the kit's own `sm` chip in a real browser: 26px tall for one line, ~8.8px
// per character, 18px of padding, and `white-space: nowrap` - so nothing here wraps by itself, and a
// label has to be fitted to the ground it has rather than laid out by hand.
const CHIP_HALF = 13;
const CHIP_LINE = 20;
const CHIP_CH = 8.8;
const CHIP_PAD = 9;
const CH_RATIO = CHIP_CH / 14;                  // a character's width scales with its font
const KEEP_CLEAR = 4;                          // px a label keeps off a curve, over its own height
// [derived] The helper's point letters as ink boxes: `supplyCurveSvg` writes each id at (x+14, y+21)
// in an 18px font, so its cap runs from y+8 up to y+21 and is ~12px wide. Nothing here sits on one.
const LETTER_DX = 14;
const LETTER_DW = 12;
const LETTER_UP = 8;
const LETTER_DY = 21;
const ASK = 'what else moves supply?';
const ASK_SUB = 'besides the mango\u2019s own price';
const ASK_SIZES = [19, 17, 16, 15];            // the largest of these that fits the ask's own band
const ASK_SUB_PX = 14;
const ASK_LINE = 1.25;
const ASK_PAD_X = 10;
const ASK_PAD_Y = 15;
const ASK_BORDER = 3;
const TAP_R = 30;

/** A label's own width, from its longest line. */
function labelW(lines) {
  return Math.max(...lines.map((l) => l.length)) * CHIP_CH + 2 * CHIP_PAD;
}

/** Break a label into the fewest lines that each fit `maxW`, split as evenly as the words allow:
 *  one line in landscape, two in portrait, where the wedge between the two curves is a third as
 *  wide. The caller draws the breaks itself, so the card or chip is exactly as tall as planned. */
function wrapTo(text, maxW, chW = CHIP_CH) {
  const room = Math.max(4, Math.floor(maxW / chW));
  const words = text.split(' ');
  for (let n = Math.max(1, Math.ceil(text.length / room)); n < words.length + 1; n++) {
    const out = split(words, n, room);
    if (out) return out;
  }
  return [text];
}

/** Split `words` into exactly `n` lines, longest head first, or null when they will not fit. */
function split(words, n, room) {
  if (!words.length) return [];
  if (n === 1) return words.join(' ').length <= room ? [words.join(' ')] : null;
  for (let take = words.length - 1; take >= 1; take--) {
    const head = words.slice(0, take).join(' ');
    const tail = split(words.slice(take), n - 1, room);
    if (head.length <= room && tail) return [head, ...tail];
  }
  return null;
}

/** Every point's letter as an ink box, so a label or the ask card is never drawn over one. */
function letterBoxes(f) {
  const out = [];
  for (const c of SUPPLY_CURVES) {
    for (const pt of c.pts) {
      const x = f.px(pt.q), y = f.py(pt.p);
      out.push({ x0: x + LETTER_DX, x1: x + LETTER_DX + LETTER_DW, y0: y + LETTER_UP, y1: y + LETTER_DY });
    }
  }
  return out;
}

const NOTES = [
  'the supply side is mapped and closed; tap any point to read it',
  'everything else on a seller\u2019s mind sits off this plane',
  'the plane answers the price question only',
];

export class SupplyCompareSceneMapped extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  // From sim-layout: the tallest interaction state is 552px landscape, 700px portrait.
  static HEIGHT = 556;
  static PORTRAIT_HEIGHT = 706;
  static ARIA_LABEL =
    'The supply side of the mango market, mapped and closed. One price-quantity plane: the vertical '
    + 'axis is the price of a kilo in rupees from 0 to 170, the horizontal axis is the quantity '
    + 'supplied in kilos from 0 to 20. Two upward sloping lines stand on it. The steep one, in '
    + 'blue, is Seller A: point A at 1 kilo and 50 rupees, B at 2 kilos and 100 rupees, C at 3 kilos '
    + 'and 150 rupees. The flatter and much wider one, in green, is every seller at that market: E '
    + 'at 6 kilos and 50 rupees, F at 12 kilos and 100 rupees, G at 18 kilos and 150 rupees. Tapping '
    + 'any point drops dashed guides to both axes and names the kilos. On the next beat three muted '
    + 'labels appear in the open ground above the green curve - new irrigation, traders in the '
    + 'district, wheat or chickpeas - and tapping each one lifts it; they carry no numbers. On the '
    + 'last beat the closing question is raised: what else moves supply?';
  // One control, for the stub's own "toggling the chip raises the closing ask"; the stub's Dials
  // line says none, so the plane's taps are the rest of the interface. Hidden until beat 2.
  static CONTROLS = [{ type: 'toggle', id: 'ask', label: ASK, value: false }];

  // ---- state ------------------------------------------------------------------------------------

  enter(step) {
    this.stepIndex = Math.max(0, Math.min(2, step | 0));
    this.read = null;        // the point being read right now, { key, i }
    this.seen = { a: false, mkt: false };  // the learner has read a point on that curve
    this.lifted = {};        // factor id -> true, once the learner has raised it
    this.pop = {};           // factor id -> true, one-shot pop on the next paint
    this.ask = false;
    this._won = {};
  }

  isControlHidden(id) { return id === 'ask' && this.stepIndex < 2; }
  getControlValue(id) { return id === 'ask' ? !!this.ask : undefined; }
  onControlChange(id, v) {
    if (id !== 'ask' || this.isControlHidden(id)) return;
    this._setAsk(!!v);
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `<div class="scm-note">${noteLineHtml([{ text: NOTES[0] }])}</div>`);
    this._note = this.root.querySelector('.scm-note');
    this._syncNote();
    // The overlay carries `pointer-events: none` except on `.sv-hit`, so the liftable labels and the
    // ask are marked as hits and handled here as well as by pointerDown. Both paths are idempotent,
    // so a real tap (pointerdown + click) lifts a label once.
    this.root.addEventListener('click', (e) => {
      const el = e.target?.closest?.('.sv-hit');
      if (!el || !this.root.contains(el)) return;
      if (el.dataset.ask != null) { this._setAsk(!this.ask); return; }
      const fx = FACTORS.find((o) => o.text === el.textContent.trim());
      if (fx) this._lift(fx);
    });
  }

  onBeatChange(beatIndex) {
    super.onBeatChange(beatIndex);
    this._syncNote();
  }

  /** One muted line along the foot, one text per beat. Never the modal card. */
  _syncNote() {
    if (!this._note) return;
    this._note.innerHTML = noteLineHtml([{ text: NOTES[Math.max(0, Math.min(2, this.stepIndex | 0))] }]);
  }

  css() {
    return `
.scm-note { display: block; }
`;
  }

  // ---- layout -----------------------------------------------------------------------------------

  stageHeight(st) { return st.portrait ? 520 : 450; }

  frame(st) { return supplyPlane({ x: 0, y: 0, w: st.W, h: st.H }); }

  /** Where one open label sits, and how big it may be: the middle of the window that is clear of
   *  BOTH curves at its own height - right of Seller A's steep line, left of the market's wide one -
   *  so the same three data prices place it correctly in landscape and in portrait. The band's
   *  half-height is the label's OWN height, so a label that wraps to two lines keeps the same
   *  clearance from the two lines it must never cross; and a label that would land on a point's
   *  letter steps up (or down) by the smallest move that clears it. */
  _factorAt(st, fx) {
    const f = this.frame(st);
    const perPx = 170 / f.plot.h;             // price units in one px
    // Both directions convert px -> price by *multiplying*: a px of height is `perPx` rupees, and
    // y grows upward in price (`py` subtracts), so a point `d` px above the x-axis is `d * perPx`.
    const winAt = (y, halfPx) => {            // the ground clear of both curves at that height
      const p = (f.py(0) - y) * perPx, band = (halfPx + KEEP_CLEAR) * perPx;
      return [f.px((p + band) / 50), f.px((p - band) / (100 / 12))];
    };
    const letters = letterBoxes(f);
    let y = f.py(fx.p), half = CHIP_HALF, win = winAt(y, half), lines = [fx.text];
    for (let pass = 0; pass < 3; pass++) {
      lines = wrapTo(fx.text, win[1] - win[0] - 10);
      half = CHIP_HALF + ((lines.length - 1) * CHIP_LINE) / 2;
      const w = labelW(lines), x = (win[0] + win[1]) / 2;
      const clash = letters.find((b) => y + half > b.y0 - 3 && y - half < b.y1 + 3
        && x + w / 2 > b.x0 - 3 && x - w / 2 < b.x1 + 3);
      if (!clash) break;
      const up = clash.y0 - 3 - half;          // up first: the wedge only widens that way
      const down = clash.y1 + 3 + half;
      const next = up - half > f.plot.y + 4 ? up : (down + half < f.py(0) - 4 ? down : y);
      if (next === y) break;                   // nowhere to go inside the plot: leave it, and log it
      y = next;
      win = winAt(y, half);
    }
    return { x: (win[0] + win[1]) / 2, y, w: labelW(lines), h: half * 2, lines };
  }

  // ---- the beats' own state ---------------------------------------------------------------------

  _read(c, i) {
    this.read = { key: c.key, i };
    this.seen[c.key] = true;
    this.repaint();
    if (this.seen.a && this.seen.mkt) this._win(0);
  }

  _lift(fx) {
    const first = !this.lifted[fx.id];
    this.lifted[fx.id] = true;
    this.pop[fx.id] = true;
    this.repaint();
    if (first && FACTORS.every((o) => this.lifted[o.id])) this._win(1);
  }

  _setAsk(on) {
    this.ask = !!on;
    this.repaint();
    this.requestUiUpdate?.();
  }

  /** The concept is the learner's own: the map read on both curves, then the unmapped ground
   *  raised by hand. Never on a press of something else, because nothing here runs. */
  _win(stage) {
    if (this._won[stage]) return;
    this._won[stage] = true;
    this.celebrate();
  }

  // ---- input ------------------------------------------------------------------------------------

  /** A tap on a point reads it; from beat 1, a tap on a factor chip lifts it. */
  pointerDown(p) {
    const hit = this._hit(p);
    if (!hit) return false;
    if (hit.kind === 'pt') this._read(SUPPLY_CURVES[hit.ci], hit.pi);
    else if (hit.kind === 'factor') this._lift(FACTORS[hit.fi]);
    return true;
  }

  _hit(p) {
    const st = this.sv;
    if (this.stepIndex >= 1) {
      // A label is a box, not a dot: the same rect it is painted in, so a wrapped portrait label is
      // tappable all the way to its own edge (and no further).
      for (let fi = 0; fi < FACTORS.length; fi++) {
        const at = this._factorAt(st, FACTORS[fi]);
        if (Math.abs(p.x - at.x) <= at.w / 2 + 6 && Math.abs(p.y - at.y) <= at.h / 2 + 6) {
          return { kind: 'factor', fi };
        }
      }
    }
    const f = this.frame(st);
    for (let ci = 0; ci < SUPPLY_CURVES.length; ci++) {
      const c = SUPPLY_CURVES[ci];
      for (let pi = 0; pi < c.pts.length; pi++) {
        const pt = c.pts[pi];
        if (Math.hypot(p.x - f.px(pt.q), p.y - f.py(pt.p)) <= TAP_R) return { kind: 'pt', ci, pi };
      }
    }
    return null;
  }

  // ---- painting ---------------------------------------------------------------------------------

  paint(st) {
    const f = this.frame(st);
    const out = axesSvg(f);

    // The guide L for the point being read, under both curves so the lines stay readable.
    if (this.read) {
      const c = SUPPLY_CURVES.find((o) => o.key === this.read.key);
      const pt = c && c.pts[this.read.i];
      if (pt) out.svg += supplyGuides(f, pt, c.tone, 0.9);
    }

    // Both curves, complete from the first paint: `draw` is false, so the line is simply there.
    for (const c of SUPPLY_CURVES) {
      out.svg += supplyCurveSvg(f, c, { draw: false, lit: 3, dotAlpha: 0.28 }).svg;
    }

    // Curve names ride the head row's legend chips (the same tone pairing as s05), which leaves the
    // plane's unmapped ground free for the open factors on beat 1.

    // The read point's kilos, beside the point and never across a line.
    if (this.read) {
      const c = SUPPLY_CURVES.find((o) => o.key === this.read.key);
      const pt = c && c.pts[this.read.i];
      if (pt) {
        const x = f.px(pt.q), y = f.py(pt.p);
        const right = x < f.plot.x + f.plot.w - 70;
        out.over += chip(`${pt.q} kg at ${RUPEE}${pt.p}`, x + (right ? 46 : -46), y - 32,
          { tone: c.tone, size: 'sm' });
      }
    }

    // The open factors: muted labels in the ground the curves do not claim, lifted by a tap. The
    // label is broken to fit that ground by `_factorAt`, so in portrait it wraps to two lines
    // instead of running across a curve.
    if (this.stepIndex >= 1) {
      for (const fx of FACTORS) {
        const at = this._factorAt(st, fx);
        const up = this.lifted[fx.id];
        const body = at.lines.length > 1
          ? `<span style="display:block;text-align:center">${at.lines.join('<br>')}</span>`
          : at.lines[0];
        out.over += chip(body, at.x, at.y, {
          tone: up ? fx.tone : 'plain', size: 'sm', math: true,
          cls: `sv-hit${this.pop[fx.id] ? ' sv-pop' : ''}`,
        });
      }
    }

    // The closing ask, over the plane in the ground below the market curve - which no curve claims
    // and no factor label uses. Inline styles because a single class selector loses to the kit's
    // overlay rules, and a hit chip so it is a real target for a learner and for tooling.
    if (this.stepIndex === 2) out.over += this._askHtml(st);

    this.pop = {};
    return { svg: out.svg, over: out.over, head: this._headHtml() };
  }

  /** Where the ask sits on the plane: under the market curve, in the ground between that curve and
   *  the x-axis - which no curve claims and no factor label uses. Its ceiling clears E's letter (the
   *  helper writes that letter just under the market line at 6 kg) and its floor stops short of the
   *  x-axis tick numbers, so the card covers neither, in either orientation. */
  _askAt(st) {
    const f = this.frame(st);
    const x0 = f.px(6), x1 = f.px(19.6);
    const top = f.py(50) + LETTER_DY + 4;
    const bot = f.py(0) - 6;
    const w = Math.max(120, x1 - x0);
    return {
      x: (x0 + x1) / 2, y: (top + bot) / 2, w, band: bot - top,
      inner: w - 2 * ASK_PAD_X - ASK_BORDER - 6,
    };
  }

  _askHtml(st) {
    const a = this._askAt(st);
    const tone = this.ask ? 'var(--sim-accent)' : 'var(--sim-warning)';
    // The question is broken by hand too, at the largest size that fits its band, so the card is
    // exactly as tall as the ground under the market curve and never spills onto the axis.
    let fs = ASK_SIZES[ASK_SIZES.length - 1];
    let title = [ASK];
    let sub = [ASK_SUB];
    for (const size of ASK_SIZES) {
      const t = wrapTo(ASK, a.inner, size * CH_RATIO);
      const s = wrapTo(ASK_SUB, a.inner, ASK_SUB_PX * CH_RATIO);
      fs = size;
      title = t;
      sub = s;
      const h = t.length * size * ASK_LINE + s.length * ASK_SUB_PX * ASK_LINE + ASK_PAD_Y + 2 * ASK_BORDER;
      if (h <= a.band) break;
    }
    const style = [
      'position:absolute', 'box-sizing:border-box', 'display:inline-block',
      'transform:translate(-50%,-50%)', 'text-align:center',
      `padding:${(ASK_PAD_Y - 1) / 2}px ${ASK_PAD_X}px ${(ASK_PAD_Y + 1) / 2}px`,
      'border-radius:16px', `width:${a.w.toFixed(0)}px`,
      `left:${a.x.toFixed(1)}px`, `top:${a.y.toFixed(1)}px`,
      `border:${ASK_BORDER}px solid ${tone}`,
      `background:color-mix(in srgb, ${tone} 16%, var(--sim-bg-surface))`,
      'color:var(--sim-label)', 'font-weight:900', `font-size:${fs}px`, `line-height:${ASK_LINE}`,
      'cursor:pointer', 'overflow-wrap:anywhere',
    ].join(';');
    const subHtml = `<span style="display:block;font-weight:700;font-size:${ASK_SUB_PX}px;`
      + `line-height:${ASK_LINE};opacity:.85">${sub.join('<br>')}</span>`;
    return `<span class="sv-hit" data-ask="1" style="${style}">${title.join('<br>')}${subHtml}</span>`;
  }

  /** The head row: which curve is which, then what to do, then the beat's own takeaway. */
  _headHtml() {
    let out = SUPPLY_CURVES
      .map((c) => chip(c.name, 0, 0, { tone: c.tone, size: 'sm', static: true })).join('');
    const mapped = this.seen.a && this.seen.mkt;
    if (this.stepIndex === 0) {
      out += chip(mapped ? 'mapped for price' : 'tap a point to read the kilos', 0, 0,
        { tone: mapped ? 'good' : 'plain', size: 'sm', static: true });
    } else if (this.stepIndex === 1) {
      const left = FACTORS.filter((fx) => !this.lifted[fx.id]).length;
      out += chip(left ? `tap what the curve does not hold (${left})` : 'off this plane', 0, 0,
        { tone: left ? 'plain' : 'good', size: 'sm', static: true });
    } else {
      // The ask itself is the hit chip over the plane; the head row only says whether it is raised,
      // so the closing question is never printed twice in the same panel.
      out += chip(this.ask ? 'the ask is open' : 'tap the ask on the plane', 0, 0,
        { tone: this.ask ? 'accent' : 'plain', size: 'sm', static: true });
    }
    return out;
  }
}