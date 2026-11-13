/**
 * ScarcityTreeScene - L05 s01 "From Scarcity to Three Questions" (3 beats). Book Fig 8.5, read top to bottom:
 * unlimited wants + limited resources -> SCARCITY -> CHOICES -> what / how / for whom.
 *   b0 meet:     a pile of wants that keeps growing (want icons drop in; "+1 want" adds one more, for ever) beside
 *                a fixed tray of 4 resources (land, water, workers, machines) that never grows. Both lead down
 *                into one big SCARCITY box: "not enough for every want".
 *   b1 choices:  the chain so far shrinks to a row at the top; SCARCITY leads to CHOICES and two families (a big
 *                house, a small house). Each family's fork has two options; one is chosen, the other is dashed
 *                and "given up". The rich family's options are bigger, but it gives one up too. Tap an option
 *                to choose it instead.
 *   b2 branch:   the chain row ends in CHOICES; three cards hang from it: What / How / For whom to produce, each
 *                with one picture. Tap a card to light the book's example under it. At rest: What is lit.
 * SvgScene; landscape and portrait have their own layouts. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { farmSpec, farmSvg } from 'simulations/base/kit/SimFarm.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const WANTS = ['phone', 'book', 'ticket', 'plane', 'house', 'speaker', 'cup', 'lamp', 'pen', 'globe', 'glass', 'flower'];
const WANT_TONES = [1, 5, 6, 7, 2, 4, 8, 3];
const START_WANTS = 7;
const DROP_S = 0.45;
const RES = [{ ic: 'field', tone: 3 }, { ic: 'river', tone: 1 }, { ic: 'crowd', tone: 6 }, { ic: 'factory', tone: 7 }];
const FAMILIES = [
  { tag: 'rich family', house: 1.0, r: 1.0, opts: [{ ic: 'house', tone: 5, name: 'a bigger house' }, { ic: 'plane', tone: 1, name: 'a holiday abroad' }] },
  { tag: 'poor family', house: 0.62, r: 0.74, opts: [{ ic: 'book', tone: 6, name: 'school books' }, { ic: 'phone', tone: 7, name: 'a phone' }] },
];
const CARDS = [
  { head: 'What', sub: 'to produce?', ex: ['sugarcane', 'or millets'] },
  { head: 'How', sub: 'to produce?', ex: ['more workers or', 'more machines'] },
  { head: 'For whom', sub: 'to produce?', ex: ['school shoes or', 'office shoes'] },
];
const f1 = (v) => (+v).toFixed(1);

const CSS = `
.tr-btn { position: absolute; transform: translate(-50%, -50%); min-height: 44px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.tr-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.tr-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.tr-btn.tr-pulse { animation: tr-pulse 1.3s ease-in-out infinite; }
@keyframes tr-pulse { 50% { box-shadow: 0 0 0 6px color-mix(in oklab, var(--sim-accent) 40%, transparent); } }
.tr-hit { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 16px; }
.tr-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
svg .tr-pop { transform-box: fill-box; transform-origin: center bottom; animation: tr-pop 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes tr-pop { 0% { transform: translateY(-26px) scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .tr-in { animation: tr-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes tr-in { from { opacity: 0; } to { opacity: 1; } }
`;

/** A 48-grid SimIcons icon centred on (cx, cy), size px across. */
function icon(name, tone, cx, cy, size, extra = '') {
  const body = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g${extra}><g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tone})">${body}</g></g>`;
}

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" dominant-baseline="central"${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

const textW = (t, size) => t.length * size * 0.56;

/** A pill centred on (x, y): solid accent (on), plain surface, or dashed. */
function pillSvg(x, y, t, size, kind = 'plain') {
  const w = textW(t, size) + size * 1.4, h = size * 1.75;
  const on = kind === 'on';
  const st = on ? fill('var(--sim-accent)', 'stroke:color-mix(in srgb, var(--sim-accent) 70%, var(--sim-label));stroke-width:2.5')
    : kind === 'dash' ? fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-dasharray:7 5')
      : fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5');
  const lip = kind === 'dash' ? '' : `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 3)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(on ? 'color-mix(in srgb, var(--sim-accent) 60%, var(--sim-label))' : 'var(--sim-stroke)')}/>`;
  return lip + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${st}/>`
    + text(x, y + 1, t, size, on ? 'var(--sim-ink-on-accent, var(--sim-bg-deep))' : kind === 'dash' ? 'var(--sim-label-muted)' : 'var(--sim-label)');
}

/** An arrow from (x0, y0) to (x1, y1) with a head at the end. */
function arrow(x0, y0, x1, y1, col = 'var(--sim-label-muted)', w = 4, extra = '') {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 13;
  const p1 = `${f1(x1 - L * Math.cos(a - 0.45))} ${f1(y1 - L * Math.sin(a - 0.45))}`, p2 = `${f1(x1 - L * Math.cos(a + 0.45))} ${f1(y1 - L * Math.sin(a + 0.45))}`;
  return `<g${extra}><line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x1 - 8 * Math.cos(a))}" y2="${f1(y1 - 8 * Math.sin(a))}" style="stroke:${col};stroke-width:${w};stroke-linecap:round"/>`
    + `<path d="M${f1(x1)} ${f1(y1)}L${p1}L${p2}Z" ${fill(col)}/></g>`;
}

export class ScarcityTreeScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 496;
  static PORTRAIT_HEIGHT = 586;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Unlimited wants keep growing; limited resources (land, water, workers, machines) stay the same. They meet in one box: scarcity, not enough for every want. Scarcity leads to choices: a rich family and a poor family each choose one option and give the other up. Choices lead to three questions: what to produce (sugarcane or millets), how to produce (more workers or more machines), and for whom to produce (school shoes or office shoes).';

  async setup() {
    this.wants = 0;
    this.pick = [0, 0];
    this.card = 0;
    this.fresh = true;
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
    this.pick = [0, 0];
    this.card = 0;
    this.fresh = true;
    this.wants = step === 0 ? 0 : START_WANTS;
    if (step === 0) {
      // The wants drop in one after another, then the pile rests at START_WANTS (the button adds more).
      for (let k = 1; k <= START_WANTS; k++) this.after(0.3 + k * DROP_S, () => { this.wants = Math.max(this.wants, k); this.repaint(); });
    }
    this.after(1.4, () => { this.fresh = false; });
  }

  act(a, v) {
    this.fresh = false;
    if (a === 'want' && this.stepIndex === 0) this.wants += 1;
    else if (a === 'opt' && this.stepIndex === 1) this.pick[v >> 1] = v & 1;
    else if (a === 'card' && this.stepIndex === 2) this.card = v;
    else return;
    this.repaint();
  }

  stageHeight(st) { return st.portrait ? 560 : 470; }

  // ---------- b0 meet ----------
  paintMeet(st) {
    const P = st.portrait, W = st.W, half = W / 2;
    let svg = '', over = '';
    const hy = P ? 24 : 26, hs = P ? 20 : 23;
    svg += text(half / 2, hy, 'unlimited wants', hs);
    svg += text(half + half / 2, hy, 'limited resources', hs);
    // The wants pile: a grid filling from the bottom up; past the grid a "+N more" chip keeps counting.
    const cols = P ? 3 : 4, rows = 3, sz = P ? 42 : 48, gap = P ? 7 : 9;
    const gw = cols * sz + (cols - 1) * gap, gx = half / 2 - gw / 2, gBottom = P ? 214 : 218;
    const slots = cols * rows;
    svg += `<rect x="${f1(gx - 10)}" y="${f1(gBottom - rows * (sz + gap) - 6)}" width="${f1(gw + 20)}" height="${f1(rows * (sz + gap) + 12)}" rx="14" ${fill('color-mix(in srgb, var(--sim-series-5) 7%, transparent)', 'stroke:color-mix(in srgb, var(--sim-series-5) 55%, var(--sim-stroke));stroke-width:2.5;stroke-dasharray:8 6')}/>`;
    // Past the grid, the last slot becomes a "+N" badge that keeps counting: the pile never stops.
    const spill = this.wants > slots, shown = spill ? slots - 1 : this.wants;
    const at = (k) => ({ cx: gx + (k % cols) * (sz + gap) + sz / 2, cy: gBottom - Math.floor(k / cols) * (sz + gap) - sz / 2 });
    for (let k = 0; k < shown; k++) {
      const { cx, cy } = at(k);
      const isNew = !spill && k === this.wants - 1;
      svg += icon(WANTS[k % WANTS.length], WANT_TONES[k % WANT_TONES.length], cx, cy, sz, isNew ? ' class="tr-pop"' : '');
    }
    if (spill) {
      const { cx, cy } = at(slots - 1);
      svg += `<g class="tr-pop"><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(sz / 2 + 2)}" ${fill('var(--sim-accent)')}/>`
        + text(cx, cy + 1, `+${this.wants - slots + 1}`, P ? 18 : 20, 'var(--sim-ink-on-accent, var(--sim-bg-deep))') + '</g>';
    }
    // The resources tray: 4 fixed tiles; solid frame, it never grows.
    const rs = P ? 54 : 64, rg = P ? 12 : 16, tw = 2 * rs + rg, tx = half + half / 2 - tw / 2;
    const ty = gBottom - 2 * rs - rg;
    svg += `<rect x="${f1(tx - 12)}" y="${f1(ty - 12)}" width="${f1(tw + 24)}" height="${f1(2 * rs + rg + 24)}" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:3')}/>`;
    RES.forEach((r, k) => {
      const cx = tx + (k % 2) * (rs + rg) + rs / 2, cy = ty + Math.floor(k / 2) * (rs + rg) + rs / 2;
      svg += `<rect x="${f1(cx - rs / 2)}" y="${f1(cy - rs / 2)}" width="${f1(rs)}" height="${f1(rs)}" rx="12" ${fill(`color-mix(in srgb, var(--sim-series-${r.tone}) 12%, var(--sim-bg-surface))`)}/>`;
      svg += icon(r.ic, r.tone, cx, cy, rs * 0.8);
    });
    // The button under the pile; both inputs lead down into SCARCITY.
    const by = gBottom + (P ? 36 : 38);
    over += `<button type="button" class="sv-hit tr-btn tap btn${this.wants <= START_WANTS ? ' tr-pulse' : ''}" data-act="want" data-val="0" aria-label="add one more want" style="left:${f1(half / 2)}px;top:${f1(by)}px">+1 want</button>`;
    svg += text(half + half / 2, by, 'no more to add', P ? 16 : 18, 'var(--sim-label-muted)');
    const boxY = P ? 330 : 318, boxH = P ? 150 : 118, bx = W * (P ? 0.06 : 0.12), bw = W - 2 * bx;
    const ay0 = by + 26;
    svg += arrow(half / 2, ay0, W / 2 - bw * 0.2, boxY - 4, 'var(--sim-label-muted)', 4.5);
    svg += arrow(half + half / 2, ay0, W / 2 + bw * 0.2, boxY - 4, 'var(--sim-label-muted)', 4.5);
    svg += `<g class="tr-in" style="--d:${this.fresh ? 0.3 : 0}s">`
      + `<rect x="${f1(bx)}" y="${f1(boxY + 5)}" width="${f1(bw)}" height="${f1(boxH)}" rx="20" ${fill('color-mix(in srgb, var(--sim-accent) 60%, var(--sim-label))')}/>`
      + `<rect x="${f1(bx)}" y="${f1(boxY)}" width="${f1(bw)}" height="${f1(boxH)}" rx="20" ${fill('color-mix(in srgb, var(--sim-accent) 14%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:4')}/>`
      + text(W / 2, boxY + boxH * (P ? 0.32 : 0.38), 'SCARCITY', P ? 40 : 46, 'var(--sim-label)')
      + text(W / 2, boxY + boxH * (P ? 0.68 : 0.76), P ? 'not enough for' : 'not enough for every want', P ? 21 : 22, 'var(--sim-label-muted)')
      + (P ? text(W / 2, boxY + boxH * 0.87, 'every want', 21, 'var(--sim-label-muted)') : '')
      + '</g>';
    return { svg, over };
  }

  /** The chain so far, as a dimmed row of pills at the top; returns its markup and the last pill's centre. */
  chain(st, upto) {
    const P = st.portrait, W = st.W, size = P ? 15 : 17, y = P ? 22 : 24;
    const names = upto === 1 ? ['wants + resources', 'scarcity'] : ['wants + resources', 'scarcity', 'choices'];
    const ws = names.map((n) => textW(n, size) + size * 1.4), gapA = P ? 22 : 34;
    const total = ws.reduce((a, b) => a + b, 0) + gapA * (names.length - 1);
    let x = W / 2 - total / 2, svg = '<g style="opacity:0.55">';
    const cx = [];
    names.forEach((n, i) => {
      cx.push(x + ws[i] / 2);
      svg += pillSvg(x + ws[i] / 2, y, n, size, 'plain');
      if (i < names.length - 1) svg += arrow(x + ws[i] + 4, y, x + ws[i] + gapA - 3, y, 'var(--sim-label-muted)', 3);
      x += ws[i] + gapA;
    });
    return { svg: svg + '</g>', y, x: cx[cx.length - 1] };
  }

  // ---------- b1 choices ----------
  paintChoices(st) {
    const P = st.portrait, W = st.W;
    const ch = this.chain(st, 1);
    let svg = ch.svg, over = '';
    const ny = P ? 84 : 86;
    svg += arrow(ch.x, ch.y + 16, W / 2, ny - 22, 'var(--sim-label-muted)', 3.5);
    svg += pillSvg(W / 2, ny, 'CHOICES', P ? 26 : 28, 'on');
    const cxs = [W * 0.27, W * 0.73], ground = P ? 262 : 236, tagY = ground + (P ? 22 : 22);
    const forkY = tagY + 26, optY = P ? 400 : 348, dx = P ? 40 : 70;
    FAMILIES.forEach((fm, i) => {
      const x = cxs[i], hs = (P ? 112 : 124) * fm.house;
      svg += `<path d="M${f1(W / 2)} ${f1(ny + 22)}C${f1(W / 2)} ${f1(ny + 60)} ${f1(x)} ${f1(ny + 40)} ${f1(x)} ${f1(ground - hs - 6)}" style="fill:none;stroke:var(--sim-label-muted);stroke-width:4;stroke-dasharray:3 9;stroke-linecap:round"/>`;
      svg += `<g class="${this.fresh ? 'tr-pop' : ''}" style="--d:${f1(0.15 + i * 0.25)}s">${icon('house', i === 0 ? 5 : 8, x, ground - hs / 2, hs)}</g>`;
      svg += pillSvg(x, tagY, fm.tag, P ? 18 : 20, 'plain');
      const r = (P ? 40 : 50) * fm.r;
      fm.opts.forEach((o, k) => {
        const on = this.pick[i] === k, ox = x + (k ? dx : -dx);
        svg += `<path d="M${f1(x)} ${f1(forkY)}L${f1(x)} ${f1(forkY + 18)}L${f1(ox)} ${f1(optY - r - 6)}" style="fill:none;stroke:${on ? 'var(--sim-accent)' : 'var(--sim-label-muted)'};stroke-width:${on ? 5 : 3.5};stroke-linejoin:round;stroke-linecap:round${on ? '' : ';stroke-dasharray:7 7'}"/>`;
        svg += `<g style="opacity:${on ? 1 : 0.45}">`
          + `<circle cx="${f1(ox)}" cy="${f1(optY + 3)}" r="${f1(r)}" ${fill(on ? 'color-mix(in srgb, var(--sim-accent) 60%, var(--sim-label))' : 'transparent')}/>`
          + `<circle cx="${f1(ox)}" cy="${f1(optY)}" r="${f1(r)}" ${fill('var(--sim-bg-surface)', on ? 'stroke:var(--sim-accent);stroke-width:4' : 'stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:7 5')}/>`
          + icon(o.ic, o.tone, ox, optY, r * 1.3) + '</g>';
        if (!on) svg += pillSvg(ox, optY + r + (P ? 24 : 26), 'given up', P ? 15 : 18, 'dash');
        over += `<button type="button" class="sv-hit tr-hit tap btn" data-act="opt" data-val="${i * 2 + k}" aria-pressed="${on}" aria-label="${fm.tag}: choose ${o.name}" style="left:${f1(ox - Math.max(r, 24))}px;top:${f1(optY - Math.max(r, 24))}px;width:${f1(2 * Math.max(r, 24))}px;height:${f1(2 * Math.max(r, 24))}px"></button>`;
      });
    });
    if (P) svg += text(W / 2, 530, 'tap an option to choose it', 17, 'var(--sim-label-muted)');
    return { svg, over };
  }

  // ---------- b2 branch ----------
  cardPic(k, cx, cy, w) {
    if (k === 0) {
      const fw = w, fh = w * 0.58;
      const spec = farmSpec({ strips: [{ crop: 'sugarcane', soil: 'dry' }, { crop: 'millet', soil: 'dry' }], orient: 'cols', w: fw, h: fh, gap: 8 });
      return farmSvg(spec, { x: cx - fw / 2, y: cy - fh / 2, tags: false });
    }
    if (k === 1) {
      const s = w * 0.38;
      return icon('crowd', 6, cx - w * 0.31, cy, s) + text(cx, cy + 2, 'or', 16, 'var(--sim-label-muted)') + icon('factory', 7, cx + w * 0.31, cy, s);
    }
    const s = w * 0.5;
    return icon('family', 1, cx - w * 0.22, cy, s) + civicSvg('shoe', cx + w * 0.26, cy + s * 0.32, { w: w * 0.42 });
  }

  paintBranch(st) {
    const P = st.portrait, W = st.W;
    const ch = this.chain(st, 2);
    let svg = ch.svg, over = '';
    const tops = [];
    if (!P) {
      const gap = 12, cw = (W - 2 * 10 - 2 * gap) / 3, top = 104, ch2 = 340;
      CARDS.forEach((cd, k) => {
        const x = 10 + k * (cw + gap), cx = x + cw / 2, on = this.card === k;
        tops.push(cx);
        svg += `<path d="M${f1(ch.x)} ${f1(ch.y + 16)}C${f1(ch.x)} ${f1(ch.y + 50)} ${f1(cx)} ${f1(ch.y + 40)} ${f1(cx)} ${f1(top - 4)}" style="fill:none;stroke:${on ? 'var(--sim-accent)' : 'var(--sim-label-muted)'};stroke-width:${on ? 4.5 : 3.5};stroke-linecap:round"/>`;
        svg += this.cardSvg(k, x, top, cw, ch2, on, false);
        over += `<button type="button" class="sv-hit tr-hit tap btn" data-act="card" data-val="${k}" aria-pressed="${on}" aria-label="${cd.head} ${cd.sub} Example: ${cd.ex.join(' ')}" style="left:${f1(x)}px;top:${f1(top)}px;width:${f1(cw)}px;height:${f1(ch2)}px"></button>`;
      });
    } else {
      const x = 8, cw = W - 16, ch2 = 140, gap = 12, top0 = 70;
      const sx = 22;
      svg += `<line x1="${f1(sx)}" y1="${f1(ch.y + 18)}" x2="${f1(sx)}" y2="${f1(top0 + 2 * (ch2 + gap) + ch2 / 2)}" style="stroke:var(--sim-label-muted);stroke-width:3.5;stroke-linecap:round"/>`;
      svg += `<path d="M${f1(ch.x)} ${f1(ch.y + 16)}L${f1(ch.x)} ${f1(ch.y + 30)}L${f1(sx)} ${f1(ch.y + 30)}" style="fill:none;stroke:var(--sim-label-muted);stroke-width:3.5;stroke-linejoin:round"/>`;
      CARDS.forEach((cd, k) => {
        const y = top0 + k * (ch2 + gap), on = this.card === k;
        svg += this.cardSvg(k, x + 22, y, cw - 22, ch2, on, true);
        over += `<button type="button" class="sv-hit tr-hit tap btn" data-act="card" data-val="${k}" aria-pressed="${on}" aria-label="${cd.head} ${cd.sub} Example: ${cd.ex.join(' ')}" style="left:${f1(x + 22)}px;top:${f1(y)}px;width:${f1(cw - 22)}px;height:${f1(ch2)}px"></button>`;
      });
      svg += text(W / 2, top0 + 3 * (ch2 + gap) + 8, 'tap a question', 17, 'var(--sim-label-muted)');
    }
    if (!P) svg += text(W / 2, 462, 'tap a question to see the book example', 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  cardSvg(k, x, y, w, h, on, row) {
    const cd = CARDS[k];
    let s = `<g style="opacity:${on ? 1 : 0.5}">`;
    s += `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill(on ? 'color-mix(in srgb, var(--sim-accent) 60%, var(--sim-label))' : 'var(--sim-stroke)')}/>`;
    s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${on ? 4 : 2.5}`)}/>`;
    if (!row) {
      const cx = x + w / 2;
      s += text(cx, y + 30, cd.head, k === 2 ? 28 : 32, on ? 'var(--sim-accent)' : 'var(--sim-label)');
      s += text(cx, y + 70, cd.sub, 19);
      s += this.cardPic(k, cx, y + 148, Math.min(w - 26, 150));
      if (on) {
        s += `<rect x="${f1(x + 10)}" y="${f1(y + 222)}" width="${f1(w - 20)}" height="96" rx="12" ${fill('color-mix(in srgb, var(--sim-accent) 13%, var(--sim-bg-surface))')}/>`;
        s += text(cx, y + 252, cd.ex[0], 18) + text(cx, y + 284, cd.ex[1], 18);
      }
    } else {
      const px = x + 70, tx = x + 140 + (w - 140) / 2;
      s += this.cardPic(k, px, y + h / 2, 120);
      s += text(tx, y + 30, cd.head, 28, on ? 'var(--sim-accent)' : 'var(--sim-label)');
      s += text(tx, y + 60, cd.sub, 18);
      if (on) {
        s += `<rect x="${f1(x + 144)}" y="${f1(y + 78)}" width="${f1(w - 154)}" height="54" rx="10" ${fill('color-mix(in srgb, var(--sim-accent) 13%, var(--sim-bg-surface))')}/>`;
        s += text(tx, y + 93, cd.ex[0], 17) + text(tx, y + 117, cd.ex[1], 17);
      }
    }
    return s + '</g>';
  }

  paint(st) {
    if (this.stepIndex === 0) return this.paintMeet(st);
    if (this.stepIndex === 1) return this.paintChoices(st);
    return this.paintBranch(st);
  }

  testState() { return { step: this.stepIndex, wants: this.wants, pick: this.pick.join(','), card: this.card }; }
}
