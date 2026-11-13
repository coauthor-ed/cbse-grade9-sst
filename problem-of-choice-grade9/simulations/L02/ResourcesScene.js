/**
 * ResourcesScene - L02 s02 "Resources" (2 beats).
 *   b0 factors:     resources in two groups. "natural": water and coal. "made by people": machines and technology.
 *                   Four big pictures with one name each; the groups pop in one after the other. Nothing to tap.
 *   b1 alternative: the four factors of production as four cards: land, labour, capital, technology. Tap a card:
 *                   under the cards the same resource sits in the middle, with its two uses either side and "or"
 *                   between. Only one use is lit at a time (an arrow from the resource to it); the other is dimmed
 *                   and ringed: tap it to switch. Land: the same field (SimFarm) grows barley or wheat. Labour: the
 *                   same engineer designs a bridge or writes software. Capital: the same money buys a machine or a
 *                   shop. Technology: the same chip goes into a phone or a computer.
 *                   At rest (cold start): land, growing wheat; barley ringed.
 * Drawn in stage px (st.W wide). Colours are tokens only; pictures are flat shapes on a 48 grid (no faces).
 * ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { farmSpec, farmSvg } from 'simulations/base/kit/SimFarm.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);

const FACTORS = [
  { name: 'land', tone: 3, pic: 'field', hero: 'the same land', uses: [{ name: 'barley', pic: 'barley' }, { name: 'wheat', pic: 'wheat' }], rest: 1 },
  { name: 'labour', tone: 1, pic: 'person', hero: 'the same engineer', uses: [{ name: 'a bridge', pic: 'bridge' }, { name: 'software', pic: 'laptop' }], rest: 0 },
  { name: 'capital', tone: 8, pic: 'coin', hero: 'the same money', uses: [{ name: 'a machine', pic: 'gear' }, { name: 'a shop', pic: 'shop' }], rest: 0 },
  { name: 'technology', tone: 5, pic: 'chip', hero: 'the same chip', uses: [{ name: 'a phone', pic: 'phone' }, { name: 'a computer', pic: 'laptop' }], rest: 0 },
];
const GROUPS = [
  { name: 'natural', tone: 3, items: [{ name: 'water', pic: 'drop', tone: 'var(--sim-water)' }, { name: 'coal', pic: 'coal', tone: 'color-mix(in srgb, var(--sim-label) 72%, var(--sim-waste))' }] },
  { name: 'made by people', tone: 1, items: [{ name: 'machines', pic: 'gear', tone: 'var(--sim-series-8)' }, { name: 'technology', pic: 'chip', tone: 'var(--sim-series-5)' }] },
];

const CSS = `
.rs-card { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 4px; cursor: pointer;
  border-radius: calc(14px * var(--look-radius, 1)); background: var(--sim-bg-surface); color: var(--sim-label); font: 800 19px/1.1 var(--sim-font);
  border: calc(2.5px * var(--look-rim, 1)) solid color-mix(in oklab, var(--c) 70%, var(--sim-stroke)); box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--c) 60%, var(--sim-stroke)); }
.rs-card svg { width: 50px; height: 50px; }
.rs-card[aria-pressed="true"] { background: color-mix(in oklab, var(--c) 18%, var(--sim-bg-surface)); border-color: var(--c); border-width: calc(3.5px * var(--look-rim, 1)); transform: translateY(-3px); }
.rs-card:active { transform: translateY(3px); box-shadow: none; }
.rs-card:focus-visible, .rs-use:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.rs-p .rs-card { flex-direction: row; gap: 8px; font-size: 18px; }
.rs-p .rs-card svg { width: 40px; height: 40px; }
.rs-use { position: absolute; padding: 0; cursor: pointer; background: none; border-radius: 16px; border: 3px solid transparent; }
.rs-use--off { border: 3px dashed var(--sim-accent); }
.rs-use--off:hover { background: color-mix(in oklab, var(--sim-accent) 8%, transparent); }
.rs-hint { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; font: 800 17px/1.2 var(--sim-font); color: var(--sim-accent); pointer-events: none; }
svg .rs-pop { transform-box: fill-box; transform-origin: center; animation: rs-pop 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes rs-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .rs-in { animation: rs-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes rs-in { from { opacity: 0; } to { opacity: 1; } }
svg .rs-dim { opacity: 0.3; transition: opacity 0.4s; }
`;

/** A picture on a 48 grid, centred on (cx, cy), size px across, base colour col (a CSS colour). */
function picSvg(kind, cx, cy, size, col) {
  const s = size / 48, tf = `translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(+s).toFixed(3)})`;
  return `<g transform="${tf}" style="--i:${col}">${picBody(kind)}</g>`;
}

/** The same picture as a standalone <svg> (for the HTML cards). */
const picTag = (kind, col) => `<svg viewBox="0 0 48 48" aria-hidden="true" style="--i:${col}">${picBody(kind)}</svg>`;

function picBody(kind) {
  const B = 'var(--i)', D = 'color-mix(in oklab, var(--i) 64%, black)', L = 'color-mix(in oklab, var(--i) 45%, white)', I = 'var(--sim-bg-deep)';
  if (['person', 'phone', 'shop', 'coin', 'field'].includes(kind)) return (iconSvg(kind, 'var(--i)').match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  if (kind === 'drop') return `<path d="M24 3C24 3 9 21 9 31a15 15 0 0 0 30 0C39 21 24 3 24 3z" fill="${B}"/><path d="M24 46a15 15 0 0 0 15 -15c0 -2 -0.5 -4 -1.3 -6c-1 9 -7 16 -16 17z" fill="${D}"/>`
    + `<path d="M16 30a8 8 0 0 0 5 8" fill="none" stroke="${L}" stroke-width="3.5" stroke-linecap="round"/>`;
  if (kind === 'coal') return `<path d="M4 42L8 29L18 25L25 33L23 43z" fill="${B}"/><path d="M21 43L25 30L36 25L45 34L42 43z" fill="${D}"/>`
    + `<path d="M12 29L18 13L30 10L35 21L26 31z" fill="${B}"/><path d="M18 13L30 10L27 17z" fill="${L}"/><path d="M8 29L18 25L13 31z" fill="${L}"/>`;
  if (kind === 'gear') {
    let d = '';
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, p = (r, da) => `${f1(24 + r * Math.cos(a + da))} ${f1(24 + r * Math.sin(a + da))}`;
      d += `${k ? 'L' : 'M'}${p(15, -0.39)}L${p(21.5, -0.2)}L${p(21.5, 0.2)}L${p(15, 0.39)}`;
    }
    return `<path d="${d}z" fill="${B}"/><circle cx="24" cy="24" r="10" fill="${D}"/><circle cx="24" cy="24" r="5" fill="${I}"/><circle cx="19" cy="13" r="2.2" fill="${L}"/>`;
  }
  if (kind === 'chip') {
    let pins = '';
    for (let k = 0; k < 4; k++) {
      const o = 15 + k * 6;
      pins += `<rect x="${o}" y="4" width="3" height="8" rx="1.2" fill="${D}"/><rect x="${o}" y="36" width="3" height="8" rx="1.2" fill="${D}"/>`
        + `<rect x="4" y="${o}" width="8" height="3" rx="1.2" fill="${D}"/><rect x="36" y="${o}" width="8" height="3" rx="1.2" fill="${D}"/>`;
    }
    return `${pins}<rect x="11" y="11" width="26" height="26" rx="4" fill="${B}"/><rect x="17" y="17" width="14" height="14" rx="2" fill="${D}"/><rect x="14" y="14" width="5" height="2.5" rx="1.2" fill="${L}"/>`;
  }
  if (kind === 'bridge') {
    let h = '';
    for (const x of [12, 18, 24, 30, 36]) { const y = 29 - 22 * (1 - ((x - 24) / 18) ** 2) + 2; h += `<rect x="${x - 0.9}" y="${f1(y)}" width="1.8" height="${f1(27 - y)}" fill="${D}"/>`; }
    return `<path d="M6 29Q24 -10 42 29" fill="none" stroke="${B}" stroke-width="4" stroke-linecap="round"/>${h}`
      + `<rect x="2" y="26" width="44" height="5" rx="1.5" fill="${B}"/><rect x="4" y="31" width="5" height="13" rx="1" fill="${D}"/><rect x="39" y="31" width="5" height="13" rx="1" fill="${D}"/>`
      + `<rect x="0" y="42" width="48" height="4" rx="2" fill="${L}"/>`;
  }
  if (kind === 'laptop') return `<rect x="8" y="7" width="32" height="23" rx="3" fill="${B}"/><rect x="11" y="10" width="26" height="17" rx="1.5" fill="${I}"/>`
    + `<rect x="14" y="13" width="9" height="2.5" rx="1.2" fill="${D}"/><rect x="17" y="18" width="14" height="2.5" rx="1.2" fill="${B}"/><rect x="14" y="23" width="11" height="2.5" rx="1.2" fill="${D}"/>`
    + `<path d="M3 32H45L41 39H7z" fill="${D}"/><rect x="20" y="33" width="8" height="2" rx="1" fill="${L}"/>`;
  return '';
}

const useBoxY = (P, top) => (P ? top + 290 : top + 238);

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle"${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

/** A crop picture: one SimFarm strip. */
function cropPic(crop, cx, cy, w, h, animate = false) {
  const spec = farmSpec({ orient: 'rows', w, h, border: false, strips: [{ crop, soil: 'loam' }] });
  return farmSvg(spec, { x: cx - w / 2, y: cy - h / 2, tags: false, animate });
}

export class ResourcesScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 498;   // the host budgets the landscape panel from this (about 465 / HEIGHT at 1280x720)
  static PORTRAIT_HEIGHT = 616;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Resources. Natural: water and coal. Made by people: machines and technology. Then the four factors of production: land, labour, capital and technology. Tap a factor to see two of its uses; only one can be used at a time. The same land grows barley or wheat; the same engineer designs a bridge or writes software; the same money buys a machine or a shop; the same chip goes into a phone or a computer.';

  async setup() {
    this.sel = 0;
    this.use = FACTORS[0].rest;
    this.fresh = 'all';      // 'all' (the beat's entrance), 'use' (a switch), or null
    this.moved = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || b.disabled) return;
      this.act(b.dataset.act, Number(b.dataset.val));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  settle(s) { this.after(s, () => { this.fresh = null; }); }

  enter() {
    this.sel = 0;
    this.use = FACTORS[0].rest;
    this.moved = false;
    this.fresh = 'all';
    this.settle(1.6);
  }

  act(a, v) {
    if (this.stepIndex !== 1 || !(v >= 0)) return;
    if (a === 'factor' && v < 4) {
      if (v === this.sel) return;
      this.sel = v; this.use = FACTORS[v].rest; this.fresh = 'all';
    } else if (a === 'use' && v < 2) {
      if (v === this.use) return;
      this.use = v; this.fresh = 'use';
    } else return;
    this.moved = true;
    this.settle(1.0);
    this.repaint();
  }

  stageHeight(st) { return st.portrait ? 590 : 474; }

  paintGroups(st) {
    const P = st.portrait, W = st.W;
    let svg = '';
    GROUPS.forEach((g, gi) => {
      const tone = `var(--sim-series-${g.tone})`;
      // Landscape: two panels side by side. Portrait: stacked.
      const px = P ? 14 : (gi ? W / 2 + 7 : 14), pw = P ? W - 28 : W / 2 - 21;
      const py = P ? 18 + gi * 290 : 24, ph = P ? 270 : 400;
      const d = gi * 0.6;
      svg += `<g class="rs-in" style="--d:${f1(d)}s"><rect x="${f1(px)}" y="${f1(py)}" width="${f1(pw)}" height="${f1(ph)}" rx="18" ${fill(`color-mix(in srgb, ${tone} 10%, var(--sim-bg-surface))`, `stroke:${tone};stroke-width:3`)}/>`
        + text(px + pw / 2, py + 38, g.name, P ? 24 : 25, `color-mix(in srgb, ${tone} 75%, var(--sim-label))`) + '</g>';
      g.items.forEach((it, k) => {
        const cx = px + pw * (k ? 0.73 : 0.27), cy = P ? py + 140 : py + 190, size = P ? 104 : 116;
        svg += `<g class="rs-pop" style="--d:${f1(d + 0.25 + k * 0.2)}s">${picSvg(it.pic, cx, cy, size, it.tone)}</g>`;
        svg += text(cx, cy + size / 2 + (P ? 34 : 44), it.name, P ? 21 : 22, 'var(--sim-label)', ` class="rs-in" style="--d:${f1(d + 0.35 + k * 0.2)}s"`);
      });
    });
    return { svg, over: '' };
  }

  paintFactors(st) {
    const P = st.portrait, W = st.W, F = FACTORS[this.sel], tone = `var(--sim-series-${F.tone})`;
    let svg = '', over = `<div class="${P ? 'rs-p' : 'rs-l'}">`;
    // The four factor cards.
    FACTORS.forEach((f, i) => {
      const cw = P ? (W - 38) / 2 : (W - 26 - 30) / 4, ch = P ? 62 : 108;
      const x = P ? 14 + (i % 2) * (cw + 10) : 13 + i * (cw + 10), y = P ? 10 + Math.floor(i / 2) * (ch + 12) : 10;
      over += `<button type="button" class="sv-hit rs-card" data-act="factor" data-val="${i}" aria-pressed="${i === this.sel}" aria-label="${f.name}: show two of its uses"`
        + ` style="--c:var(--sim-series-${f.tone});left:${f1(x)}px;top:${f1(y)}px;width:${f1(cw)}px;height:${f1(ch)}px">${picTag(f.pic, `var(--sim-series-${f.tone})`)}<span>${f.name}</span></button>`;
    });
    // The panel: the resource on top, its two uses under it, left and right, with "or" between them.
    const top = P ? 168 : 136, heroY = P ? top + 100 : top + 80, heroW = P ? 170 : 190, heroH = P ? 100 : 88;
    const pop = this.fresh === 'all';
    svg += `<rect x="10" y="${f1(top)}" width="${f1(W - 20)}" height="${f1(P ? 408 : 330)}" rx="18" ${fill(`color-mix(in srgb, ${tone} 7%, var(--sim-bg-surface))`, `stroke:color-mix(in srgb, ${tone} 60%, var(--sim-stroke));stroke-width:2.5`)}/>`;
    svg += text(W / 2, top + 34, F.hero, P ? 22 : 23, `color-mix(in srgb, ${tone} 70%, var(--sim-label))`);
    if (this.sel === 0) svg += `<g>${cropPic(F.uses[this.use].pic, W / 2, heroY, heroW, heroH * 0.8, this.fresh !== null)}</g>`;
    else svg += `<g${pop ? ' class="rs-pop"' : ''}>${picSvg(this.sel === 1 ? 'person' : F.pic, W / 2, heroY, heroH, tone)}</g>`;
    const useBox = (k) => {
      const w = P ? 140 : 150, h = 150;
      const cx = W * (k ? 0.76 : 0.24);
      const cy = useBoxY(P, top);
      return { cx, cy, w, h };
    };
    for (let k = 0; k < 2; k++) {
      const u = F.uses[k], b = useBox(k), on = k === this.use;
      const picCy = b.cy - 18, ps = 84;
      const art = (u.pic === 'barley' || u.pic === 'wheat') ? cropPic(u.pic, b.cx, picCy, 110, 64) : picSvg(u.pic, b.cx, picCy, ps, tone);
      svg += `<g class="${on ? '' : 'rs-dim'}">${art}${text(b.cx, picCy + ps / 2 + 30, u.name, P ? 20 : 21)}</g>`;
      if (on) {
        // The arrow from the resource to the use it serves now.
        const sx = W / 2 + (k ? 1 : -1) * (this.sel === 0 ? heroW * 0.3 : heroH * 0.35), sy = heroY + (this.sel === 0 ? heroH * 0.4 : heroH * 0.5) + 6;
        const ex = b.cx + (k ? -1 : 1) * b.w * 0.18, ey = b.cy - b.h / 2 - 4;
        const ang = Math.atan2(ey - sy, ex - sx), hx = ex, hy = ey;
        const p1 = `${f1(hx - 14 * Math.cos(ang - 0.45))} ${f1(hy - 14 * Math.sin(ang - 0.45))}`, p2 = `${f1(hx - 14 * Math.cos(ang + 0.45))} ${f1(hy - 14 * Math.sin(ang + 0.45))}`;
        svg += `<g class="rs-in"><line x1="${f1(sx)}" y1="${f1(sy)}" x2="${f1(hx - 8 * Math.cos(ang))}" y2="${f1(hy - 8 * Math.sin(ang))}" style="stroke:${tone};stroke-width:5;stroke-linecap:round"/>`
          + `<path d="M${f1(hx)} ${f1(hy)}L${p1}L${p2}Z" ${fill(tone)}/></g>`;
      }
      over += `<button type="button" class="sv-hit rs-use${on ? '' : ' rs-use--off'}" data-act="use" data-val="${k}" aria-pressed="${on}" aria-label="${F.hero}: ${u.name}${on ? ', in use now' : ', tap to switch to it'}"`
        + ` style="left:${f1(b.cx - b.w / 2)}px;top:${f1(b.cy - b.h / 2 - 12)}px;width:${f1(b.w)}px;height:${f1(b.h + 22)}px"></button>`;
    }
    svg += text(W / 2, useBoxY(P, top) + 8, 'or', 24, 'var(--sim-label-muted)');
    if (!this.moved) {
      const b = useBox(1 - this.use);
      over += `<span class="rs-hint" style="left:${f1(b.cx)}px;top:${f1(b.cy - b.h / 2 + 12)}px">tap to switch</span>`;
    }
    over += '</div>';
    return { svg, over };
  }

  paint(st) {
    return this.stepIndex === 1 ? this.paintFactors(st) : this.paintGroups(st);
  }

  testState() { return { step: this.stepIndex, factor: FACTORS[this.sel].name, use: FACTORS[this.sel].uses[this.use].name }; }
}
