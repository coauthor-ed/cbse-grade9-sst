/**
 * FinPeople - the personal-finances cast (a copy of price-puzzle's MangoPeople.js; only CAST changed).
 * Kit candidate: second module to copy MangoPeople.
 * Keys: meera (14, Class 9, series 1), mother, brother (about 10), uncle, teacher, shopkeeper, landlord (older
 * man), depositor (woman), shareholder (young man). Same API as below.
 *
 * MangoPeople - the price-puzzle cast as SimFigure people inside an SvgScene (kit candidate: an SVG bridge for
 * SimFigure people, figure slots in an SvgScene overlay). SimFigure paints on a canvas, so each person is a small
 * canvas in a sized div in the scene's overlay html; the scene paints every slot after render, from repaint().
 * Same look every time a person appears (fixed figureFor i + look overrides). The series colour on the top is
 * what ties a person to their curve, so a buyer's top is --sim-series-N, the same N as their curve.
 *
 *   CAST                                     who -> { name, series, role, i, look }. Keys: see the FinPeople note
 *                                            above. Any other key 'buyerN' (N = 1, 2, ...) is a
 *                                            generic crowd buyer (varied groupLook, no series top).
 *   castOf(who)                              the CAST entry (or the generic buyer entry).
 *   personSlot(who, { x, y, h, pose, facing, mood, hands, dim, cls, style })   overlay html for one person (the
 *                                            slot box is tight round the body, so keep the hands in range):
 *                                            (x, y) the feet in design units, h feet-to-head (>= 90 for a face),
 *                                            pose a SimFigure pose name ('stand' default), facing 1 / -1 / 0 (0
 *                                            default), mood smile happy sad oops think squint effort, hands
 *                                            [near, far] world grips in design units ({x, y} or null), e.g. a
 *                                            basket handle. dim: opacity 0.35. cls / style go on the slot div.
 *   paintPeople(scene)                       paints every slot in scene.sv.wrap. Call it from repaint(), after
 *                                            super.repaint():  repaint() { super.repaint(); paintPeople(this); }
 *   nameTag(x, y, who, size)                 an SVG chip with the name, in the person's series colour (a
 *                                            neutral chip for generic buyers); (x, y) = top centre of the chip.
 *   frontSvg(DW, DH, svg)                    overlay html: an SVG layer over the people (for a thing held in
 *                                            front of a body, e.g. a basket); same design units as the stage.
 *   PEOPLE_CSS                               add once to the scene's css() (slot box, pop-in).
 *   registerCast(key, entry)                 add a course-local person (role child / elder / worker ...); see below.
 * The host forces every canvas to width 100%, so each canvas sits in a sized div and fills it.
 * ASCII only. Colours: tokens only (skin and cloth come from the kit; tops are --sim-series-N).
 */
import { loadColors } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';

const f1 = (v) => (+v).toFixed(1);

export const CAST = {
  meera: { name: 'Meera', series: 1, role: 'student', i: 1,
    look: { outfit: 'kurti', hairStyle: 'braid', top: 's1', bottom: 'cream', dupatta: false, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 1 } },
  mother: { name: 'Mother', series: 6, role: 'adult', i: 3,
    look: { outfit: 'drape', hairStyle: 'bun', top: 's6', bottom: 's6', bottomStyle: 'long-skirt', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1.04 } },
  brother: { name: 'Brother', series: 2, role: 'child', i: 4,
    look: { outfit: 'tee', hairStyle: 'short', top: 's2', bottom: 'khaki', bottomStyle: 'shorts', shoeStyle: 'sneaker', shoe: 'white', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1 } },
  uncle: { name: 'Uncle', series: 7, role: 'adult', i: 2,
    look: { outfit: 'kurta', hairStyle: 'sidepart', top: 's7', bottom: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: false, girth: 1.1 } },
  teacher: { name: 'Teacher', series: 3, role: 'teacher', i: 5,
    look: { outfit: 'kurti', hairStyle: 'bun', top: 's3', bottom: 'cream', dupatta: true, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: true, girth: 1 } },
  shopkeeper: { name: 'Shopkeeper', series: 4, role: 'shopkeeper', i: 6,
    look: { outfit: 'kurta', hairStyle: 'short', top: 's4', bottom: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: false, girth: 1.12 } },
  landlord: { name: 'Landlord', series: 8, role: 'elder', i: 7,
    look: { outfit: 'kurta', hairStyle: 'crop', top: 's8', bottom: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: true, girth: 1.1 } },
  depositor: { name: 'Depositor', series: 5, role: 'adult', i: 8,
    look: { outfit: 'kurti', hairStyle: 'long', top: 's5', bottom: 'stone', dupatta: true, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 1 } },
  shareholder: { name: 'Shareholder', series: 2, role: 'adult', i: 9,
    look: { outfit: 'shirt', hairStyle: 'short', top: 's2', bottom: 'denim', shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', sleeves: 'rolled', moustache: false, dupatta: false, glasses: false, girth: 1 } },
};

export function castOf(who) {
  if (CAST[who]) return CAST[who];
  const n = parseInt(String(who).replace(/\D/g, ''), 10) || 1;
  return { name: `buyer ${n}`, series: 0, role: 'adult', i: 10 + n, look: {} };
}

export const PEOPLE_CSS = `
.mpp-fig { position: absolute; pointer-events: none; }
.mpp-fig canvas { display: block; width: 100%; height: 100%; }
.mpp-pop { animation: mpp-pop 0.45s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); transform-origin: 50% 100%; }
@keyframes mpp-pop { 0% { transform: scale(0.6) translateY(20px); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .mpp-pop { animation: none; } }
`;

/** Overlay html for one person; the spec rides along in data-mpp, in the slot's own coordinates. */
export function personSlot(who, o = {}) {
  const h = o.h ?? 180, x = o.x ?? 0, y = o.y ?? 0;
  const hands = o.hands ?? null;
  // Slot box: tight round the body so a figure near the frame edge is not clipped (front view stand / relax
  // keeps the arms in about 0.3 h; a side view reaches forward further than back).
  const f = o.facing ?? 0, pn = typeof o.pose === 'string' ? o.pose : o.pose?.name ?? 'stand';
  const fw = ['stand', 'relax'].includes(pn) ? 0.3 : 0.42;
  let x0 = x - h * (f < 0 ? 0.45 : f > 0 ? 0.26 : fw), x1 = x + h * (f > 0 ? 0.45 : f < 0 ? 0.26 : fw), y0 = y - h - h * 0.06;
  const y1 = y + h * 0.06;
  for (const p of hands ?? []) if (p) { x0 = Math.min(x0, p.x - h * 0.08); x1 = Math.max(x1, p.x + h * 0.08); y0 = Math.min(y0, p.y - h * 0.08); }
  const w = x1 - x0, hh = y1 - y0;
  const loc = (p) => (p ? { x: +(p.x - x0).toFixed(1), y: +(p.y - y0).toFixed(1) } : null);
  const spec = { who, h, fx: +(x - x0).toFixed(1), fy: +(y - y0).toFixed(1), pose: o.pose ?? 'stand', facing: o.facing ?? 0, mood: o.mood ?? 'smile',
    hands: hands ? hands.map(loc) : null };
  const data = encodeURIComponent(JSON.stringify(spec));
  return `<div class="mpp-fig${o.cls ? ` ${o.cls}` : ''}" style="left:${f1(x0)}px;top:${f1(y0)}px;width:${f1(w)}px;height:${f1(hh)}px;${o.dim ? 'opacity:0.35;' : ''}${o.style ?? ''}">`
    + `<canvas data-mpp="${data}" data-w="${f1(w)}" data-h="${f1(hh)}" width="${Math.round(w)}" height="${Math.round(hh)}"></canvas></div>`;
}

/** Paint every person slot of the scene (after super.repaint()). */
export function paintPeople(scene) {
  const wrap = scene?.sv?.wrap;
  if (!wrap) return;
  let c;
  try { c = loadColors(scene.root); } catch (_) { return; }
  const dpr = Math.min(3, ((typeof window !== 'undefined' && window.devicePixelRatio) || 1) * 1.5);
  for (const el of wrap.querySelectorAll('canvas[data-mpp]')) {
    let s;
    try { s = JSON.parse(decodeURIComponent(el.dataset.mpp)); } catch (_) { continue; }
    const w = parseFloat(el.dataset.w), h = parseFloat(el.dataset.h);
    el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
    const ctx = el.getContext('2d');
    if (!ctx) continue;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const who = castOf(s.who);
    const o = { role: who.role, pose: s.pose, x: s.fx, y: s.fy, height: s.h, facing: s.facing, i: who.i, mood: s.mood, look: { ...who.look, mood: s.mood } };
    if (s.hands) { o.hands = s.hands; o.autoReach = false; }
    try {
      const spec = figureFor(c, o);
      drawFigure(ctx, c, spec, spec.look);
    } catch (_) { /* a bad spec draws nothing rather than breaking the scene */ }
  }
}

export function nameTag(x, y, who, size = 18) {
  const p = castOf(who), fs = size, tw = p.name.length * fs * 0.58 + fs * 1.1, th = fs * 1.45;
  const bg = p.series ? `var(--sim-series-${p.series})` : 'var(--sim-bg-surface)';
  const ink = p.series ? `var(--sim-ink-on-${p.series}, var(--sim-bg-deep))` : 'var(--sim-label)';
  const edge = p.series ? `color-mix(in oklab, var(--sim-series-${p.series}) 70%, var(--sim-label))` : 'var(--sim-stroke)';
  return `<rect x="${f1(x - tw / 2)}" y="${f1(y)}" width="${f1(tw)}" height="${f1(th)}" rx="${f1(th / 2)}" style="fill:${bg};stroke:${edge};stroke-width:2"/>`
    + `<text x="${f1(x)}" y="${f1(y + th * 0.5 + fs * 0.35)}" text-anchor="middle" style="fill:${ink};font:800 ${fs}px var(--sim-font)">${p.name}</text>`;
}

export function frontSvg(DW, DH, svg) {
  return `<svg viewBox="0 0 ${DW} ${DH}" width="${DW}" height="${DH}" style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none">${svg}</svg>`;
}

/**
 * registerCast(key, entry) - add a course-local person to CAST (added by w1b for L02): entry = { name, series,
 * role (any SimFigure ROLE_NAMES role: child elder worker ...), i, look }. Existing keys are kept (returns false).
 */
export function registerCast(key, entry) {
  if (CAST[key]) return false;
  CAST[key] = { name: entry.name ?? key, series: entry.series ?? 0, role: entry.role ?? 'adult', i: entry.i ?? 0, look: entry.look ?? {} };
  return true;
}
