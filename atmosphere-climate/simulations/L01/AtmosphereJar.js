// AtmosphereJar.js - the jar of ordinary air, and every part of it that four scenes share.
//
// Written by the L08 GasSampleScene-doubling unit, because the L01 GasSampleScene unit did not
// run. Four scenes import this module; none of them may change another's drawing by changing it.
//
//   L01 GasSampleScene.js            s02/s03  the count-up and the loupe opening
//   L01 GasSampleScene-altitude.js   s06      the same jar with an altitude axis beside it
//   L01 AltitudeStripScene.js        s09      drawJar() only, at 84 px, no grid
//   L08 GasSampleScene-doubling.js   s02      the grid already filled, the loupe already open
//
// THE NUMBERS (blk-l01-s03, and the Fig. 3.2 entry in this bundle's FIGURES.md). They sum to
// exactly 100:
//
//   nitrogen 78   oxygen 21   argon 0.93   carbon dioxide 0.04   others 0.03
//
// One hundred cells is one per cent, so the grid is 78 nitrogen cells, then 21 oxygen cells, then
// ONE more cell holding the rarest per cent: 93% argon, 4% carbon dioxide, 3% others. Those three
// add to exactly 1.00, so the hundredth cell is genuinely full - it is just made of the three
// smallest sectors instead of one. At grid scale that cell is 93% argon with a dark cap of about a
// pixel above it: the two slivers have no room of their own, which is the whole reason the loupe
// exists. Pointing the loupe at that one cell and moving within it reads out argon, carbon dioxide
// or others - the three gases the grid cannot separate.
//
// EXPORTED SIGNATURE (additive: a later scene passes options, it never changes a default)
//
//   GASES          [{ key, label, share, token, shareLabel }] in the jar's rim order
//   GRID_CELLS     100 - the grid size, and the "one square is one per cent" device
//   RARE_CELL      99  - the hundredth cell: argon 0.93 + carbon dioxide 0.04 + others 0.03
//   RARE_BANDS     [{ gas, from, to }] inside RARE_CELL, as fractions of the cell from its foot
//   MAG            the loupe's nominal magnification (the lens square is sized from r)
//   gasColor(c,i)  c[token] for gas i - the jar's own five colours, s1..s5 in rim order
//   cellGasAt(i)   which gas fills cell i, reading order; RARE_CELL reports 2 (argon)
//   cellFill(i)    how much of cell i that gas fills: 1, except 0.93 at RARE_CELL
//   cellGasIn(i,f) the gas a pointer f of the way UP a cell reads (0 at the foot, 1 at the head)
//   rareBands()    the hundredth cell's drawn bands { argon, rare: [{ gas, frac }] }, head down
//   shareLabel(i)  "78 of 100", "just under 1 of 100", "0.04 of 100"
//   readoutLabel(i) "nitrogen - 78 of 100": the loupe's readout, name then share
//   jarFrame(x,y,w,h) -> { x, y, w, h, cx, cy, grid }  everything needed to place chips and test
//   jarGridBox(x,y,w,h) -> { x, y, size, cell, gap, wall }  the grid inside a jar box of that size
//   cellAtPoint(grid,px,py) -> { cell, frac } under a pointer, or null off the grid
//   drawJar(ctx,c,x,y,w,h,o={})   the glass; o = { lit: 0..100, dark } adds the hundred cells
//   drawRimLabels(ctx,c,frame,o)  the five names on leaders, in rim order; o = { cells, size }
//   drawLoupe(ctx,c,cx,cy,r,o)    ring + magnified cell; o = { cell, frac, grabbed, handleAngle }
//   loupeCellAt(frame,px,py,r) -> { cell, frac } under a pointer, or null
//
// Two contracts a later scene must know before it builds on this:
//
// 1. drawJar(ctx, c, x, y, w, h, {}) - the one signature already in a shipped caller - means a
//    plain glass jar: NO grid, NO loupe, NO labels. AltitudeStripScene draws it at 84 px tall,
//    where a hundred cells would be mud. Pass o = { lit: 100 } for the filled grid, and layer
//    drawRimLabels / drawLoupe on top of it.
//
// 2. `frac` always means "0 at the cell's foot, 1 at its head", everywhere, including
//    cellAtPoint. Bands are measured from the foot for the same reason, and mixing the two
//    directions silently inverts which gas a pointer reads - that bug shipped and was caught here.
//
// The rare cell's bands are drawn taller than 0.93 / 0.04 / 0.03 so that carbon dioxide and others
// are actually reachable and visible; see the note above rareBands(). The readout always quotes
// the true share. A scene that wants true scale on the grid can pass o = { lit: 100, dark: true }
// and draw its own bands, but it should not then hit-test against them.
//
// drawJar's contract is fixed by the one caller already written: drawJar(ctx, c, x, y, w, h, {})
// means a plain glass jar with NO grid, NO loupe and NO labels. AltitudeStripScene draws it at
// 84 px tall, where a hundred cells would be mud. Pass o = { lit: 100 } for the filled grid.
//
// Rules this file follows: colours only from `c` and mix/alpha/lighten/darken of them - no hex and
// no new token. Labels and shares on the frame, never a sentence. No control here, and nothing in
// this module can change a share.
import {
  alpha, mix, lighten, darken, pill, leader, rr,
} from 'simulations/base/kit/SimLook.js';

// -- the mixture ---------------------------------------------------------------------------------

export const GASES = [
  { key: 'nitrogen', label: 'nitrogen', share: 78, token: 's1', shareLabel: '78 of 100' },
  { key: 'oxygen', label: 'oxygen', share: 21, token: 's2', shareLabel: '21 of 100' },
  { key: 'argon', label: 'argon', share: 0.93, token: 's3', shareLabel: 'just under 1 of 100' },
  { key: 'carbon dioxide', label: 'carbon dioxide', share: 0.04, token: 's4', shareLabel: '0.04 of 100' },
  { key: 'others', label: 'others', share: 0.03, token: 's5', shareLabel: '0.03 of 100' },
];

export const GRID_CELLS = 100;         // one square is one per cent
export const RARE_CELL = 99;           // 0.93 + 0.04 + 0.03 = 1.00 exactly
const SIDE = 10;                       // the grid is 10 x 10

// Inside RARE_CELL, bottom to top: 93% of the cell is argon, then 4% carbon dioxide, then 3%
// others. from/to are fractions of the cell's height measured from its foot.
export const RARE_BANDS = (() => {
  const out = [];
  let y = 0;
  for (let g = 2; g < GASES.length; g++) { const to = y + GASES[g].share; out.push({ gas: g, from: y, to }); y = to; }
  return out;
})();

export const MAG = 2.9;                // one cell drawn 2.9x life size inside the loupe

const GAP = 0.14;                      // the gutter between cells, as a fraction of a cell
const WALL = 0.055;                    // the glass, as a fraction of the jar's width
const TOP = 0.17;                      // the mouth and shoulders, as a fraction of the jar's height
const FOOT = 0.05;                     // the thick glass foot at the jar's base

export const gasColor = (c, i) => c[GASES[i].token];

// Reading order: nitrogen first, then oxygen, then the one rarest cell. 78 + 21 = 99, so the
// hundredth cell is the rare one - there is no cell left for argon alone, and that is the point.
export function cellGasAt(i) { return i < 78 ? 0 : i < 99 ? 1 : 2; }

// How much of cell i its gas fills. Only RARE_CELL is short of a whole cell, by 7%.
export function cellFill(i) { return i === RARE_CELL ? GASES[2].share : 1; }

// -- the rare cell's band layout -------------------------------------------------------------------
//
// Carbon dioxide is 0.04 of a cell and `others` is 0.03. At true scale, on a 24 px cell, those two
// bands are 0.9 px and 0.7 px tall: no pointer and no eye can separate them. That is the whole
// reason the loupe exists, so the hundredth cell's three bands are laid out to a legible minimum
// height instead of to true scale.
//
// What changes is only the drawn heights. The hundredth cell is still ONE cell, the grid is still
// 78 + 21 + 1 = a hundred cells, and the readout still quotes the true shares - "0.04 of 100" is
// what the chip says whatever the band is drawn at. The lens and the hit test are a magnified
// device, not a chart, and the scene's note line says the grid is the scene's own device.
//
// This layout is the only one: `cellGasIn` is tested against exactly what `drawLoupe` paints, so
// what the learner points at is always the band they get back.
const BAND_MIN = 0.11;                // carbon dioxide and others are never thinner than this

// The rare cell's bands from its head down, as fractions of the cell: argon, then carbon dioxide,
// then others. Argon takes whatever is left, so the three always sum to exactly one cell.
export function rareBands() {
  const rare = RARE_BANDS.slice(1).map((b) => ({ gas: b.gas, frac: Math.max(BAND_MIN, b.to - b.from) }));
  return { argon: Math.max(0, 1 - rare.reduce((a, b) => a + b.frac, 0)), rare };
}

// The gas a pointer is over, f of the way up a cell: 0 at the cell's foot, 1 at its head. An
// ordinary cell has one gas in it; the hundredth has three, and which one is read from where in
// the cell the pointer sits. This is what makes the loupe a reading and not a label.
export function cellGasIn(i, f) {
  if (i !== RARE_CELL) return cellGasAt(i);
  const L = rareBands();
  const t = Math.min(0.9999, Math.max(0, 1 - f));    // from the head, which is how rareBands reads
  if (t < L.argon) return 2;
  let y = L.argon;
  for (const b of L.rare) { y += b.frac; if (t < y) return b.gas; }
  return L.rare[L.rare.length - 1].gas;
}

export const shareLabel = (i) => GASES[i].shareLabel;
export const readoutLabel = (i) => `${GASES[i].label} - ${GASES[i].shareLabel}`;

// -- geometry ------------------------------------------------------------------------------------

// The hundred-cell grid inside a jar drawn in the box (x, y, w, h). The mouth and the shoulders
// take the top fifth and the thick glass foot takes the bottom; the grid is the largest square
// that fits what is left, and the glass keeps it clear of every edge.
export function jarGridBox(x, y, w, h) {
  const wall = w * WALL;
  const pad = w * 0.035;
  const foot = h * FOOT;
  const innerTop = h * TOP + wall;
  const innerLeft = x + wall + pad;
  const innerW = w - 2 * (wall + pad);
  const innerH = h - innerTop - wall - foot;
  const size = Math.max(1, Math.min(innerW, innerH));
  const cell = size / SIDE;
  return {
    x: innerLeft + (innerW - size) / 2,
    y: y + innerTop + (innerH - size) / 2,
    size, cell, gap: cell * GAP, wall,
  };
}

// Everything a scene needs to place chips, labels and a hit test around one jar.
export function jarFrame(x, y, w, h) {
  return { x, y, w, h, grid: jarGridBox(x, y, w, h), cx: x + w / 2, cy: y + h / 2 };
}

const cellCentre = (g, i) => ({
  x: g.x + (i % SIDE) * g.cell + g.cell / 2,
  y: g.y + ((i / SIDE) | 0) * g.cell + g.cell / 2,
});

// Which cell a pointer is over, and how far up it: { cell, frac }, or null off the grid.
// frac is measured from the cell's FOOT, 0 at the bottom edge and 1 at the top, because that is
// the direction the rare bands are defined in and the one every band test in this file uses.
export function cellAtPoint(grid, px, py) {
  const col = Math.floor((px - grid.x) / grid.cell);
  const row = Math.floor((py - grid.y) / grid.cell);
  if (col < 0 || col >= SIDE || row < 0 || row >= SIDE) return null;
  const top = grid.y + row * grid.cell;
  return { cell: row * SIDE + col, frac: Math.min(1, Math.max(0, 1 - (py - top) / grid.cell)) };
}

// -- the jar -------------------------------------------------------------------------------------

// The glass, and - only when asked for - the hundred cells inside it.
//
//   o.lit   0..100: how many cells are lit, in reading order. Omitted or 0 means an empty grid of
//          outlines, which is what L01's own setup mount needs. o.lit = 100 means every cell is
//          filled; the hundredth is the rare cell (argon 0.93, the two slivers as a dark cap).
//   o.dark  true lets RARE_CELL take colour too, for a fill that stops past argon.
export function drawJar(ctx, c, x, y, w, h, o = {}) {
  const lit = o.lit || 0;
  const bodyTop = y + h * TOP;
  const mouthW = w * 0.46;
  const mouthH = h * 0.13;
  const neckW = w * 0.64;
  const r = w * 0.09;
  const bodyH = h - bodyTop;

  // The glass: a wide mouth on a short neck over rounded shoulders. The neck is deliberately narrow
  // and the shoulder curve deliberately deep, so the same path still reads as a jar at 84 px - the
  // size AltitudeStripScene draws it at - where a shallower one would be a plain rounded slab.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + (w - mouthW) / 2, y);
  ctx.lineTo(x + (w + mouthW) / 2, y);
  ctx.lineTo(x + (w + neckW) / 2, y + mouthH);
  ctx.quadraticCurveTo(x + w - r * 0.2, bodyTop - bodyH * 0.06, x + w - r * 0.2, bodyTop + bodyH * 0.14);
  ctx.lineTo(x + w - r * 0.25, y + h - r);
  ctx.quadraticCurveTo(x + w - r * 0.25, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x + r * 0.25, y + h - r);
  ctx.lineTo(x + r * 0.2, bodyTop + bodyH * 0.14);
  ctx.quadraticCurveTo(x + r * 0.2, bodyTop - bodyH * 0.06, x + (w - neckW) / 2, y + mouthH);
  ctx.closePath();

  // The glass, kept well behind the cells: the grid is the evidence and the jar is the frame
  // around it, so the glass is a muted tint of the surface rather than a bright panel.
  const glass = mix(c.bgSurface, c.glass, 0.40);
  ctx.fillStyle = alpha(darken(glass, 0.10), 0.95);
  ctx.fill();

  // Two soft highlights down the left of the glass: the one thing that says "this is glass".
  ctx.save();
  ctx.clip();
  ctx.fillStyle = alpha(c.label, 0.10);
  ctx.fillRect(x + w * 0.15, bodyTop + bodyH * 0.14, w * 0.05, bodyH * 0.68);
  ctx.fillStyle = alpha(c.label, 0.06);
  ctx.fillRect(x + w * 0.24, bodyTop + bodyH * 0.20, w * 0.028, bodyH * 0.54);
  ctx.restore();

  ctx.strokeStyle = alpha(c.label, 0.42);
  ctx.lineWidth = Math.max(1.5, w * 0.013);
  ctx.stroke();
  ctx.restore();

  // The mouth's rim as its own band, so the top edge reads as an opening.
  ctx.strokeStyle = alpha(c.label, 0.36);
  ctx.lineWidth = Math.max(1.5, w * 0.011);
  ctx.beginPath();
  ctx.moveTo(x + (w - mouthW) / 2, y);
  ctx.lineTo(x + (w + mouthW) / 2, y);
  ctx.stroke();

  if (lit > 0) drawCells(ctx, c, jarGridBox(x, y, w, h), lit, o.dark === true);
}

// The hundred cells, lit in reading order. The hundredth is the rare cell and carries all three of
// the small sectors; at grid scale that is 93% argon with a dark cap about a pixel deep, which is
// why nothing else on the frame can show the two slivers.
function drawCells(ctx, c, grid, lit, showRare) {
  const { x, y, cell, gap } = grid;
  const n = Math.round(lit);
  for (let i = 0; i < GRID_CELLS; i++) {
    const cx = x + (i % SIDE) * cell + gap / 2;
    const cy = y + ((i / SIDE) | 0) * cell + gap / 2;
    const cw = cell - gap, ch = cell - gap;
    const rare = i === RARE_CELL;
    const g = rare ? 2 : cellGasAt(i);

    if (i < n && (!rare || showRare)) {
      if (rare) {
        // The hundredth cell is the only one drawn in bands, and it uses the lens's own layout so
        // the square under the lens and the square inside the lens are the same square.
        const L = rareBands();
        const fromHead = [{ gas: 2, f: L.argon }];
        let y = L.argon;
        for (const b of L.rare) { fromHead.push({ gas: b.gas, f: y + b.frac }); y += b.frac; }
        fromHead.forEach((b, k) => {
          const top = k === 0 ? 0 : fromHead[k - 1].f;
          ctx.fillStyle = gasColor(c, b.gas);
          ctx.fillRect(cx, cy + ch * top, cw, ch * (b.f - top));
        });
      } else {
        const base = gasColor(c, g);
        ctx.fillStyle = base;
        rr(ctx, cx, cy, cw, ch, Math.min(2.5, cw * 0.16));
        ctx.fill();
        // A sliver of light along the top of a lit cell, so a hundred flat squares read as glass.
        ctx.fillStyle = alpha(lighten(base, 0.32), 0.32);
        rr(ctx, cx, cy, cw, Math.max(1, ch * 0.16), Math.min(2, cw * 0.14));
        ctx.fill();
      }
    } else {
      // An unfilled cell: a dark outline on the jar's own glass. The two slivers have no other
      // colour anywhere on this grid, which is the fact the loupe is here to act on.
      ctx.strokeStyle = alpha(c.label, rare ? 0.60 : 0.26);
      ctx.lineWidth = rare ? Math.max(1.4, cell * 0.08) : 1;
      rr(ctx, cx, cy, cw, ch, Math.min(2.5, cw * 0.16));
      ctx.stroke();
    }
  }
}

// -- the five names around the rim ---------------------------------------------------------------

// The five labels, in the jar's rim order, each on a short dashed leader to the place its gas
// actually is. Nothing is bolded and nothing is bigger than anything else: no name is more
// important than another, and that has to be true of the drawing too.
//
// Nitrogen and oxygen are pointed at the near edge of their own blocks, so no leader has to cross
// the grid. Argon, carbon dioxide and others all live inside the hundredth cell, so their three
// leaders end on that one square at its three own heights - 93%, 95% and 99% of the way up it.
// That is the honest shape of this mixture: two gases you can point at from across the room, and
// three you have to be inside the same square to separate.
//
// o = { cells } overrides which cell the first two point at, for a scene whose fill has not
// reached them yet.
export function drawRimLabels(ctx, c, frame, o = {}) {
  const g = frame.grid;
  const cells = o.cells || [4, 80, RARE_CELL, RARE_CELL, RARE_CELL];
  const size = o.size || 13;
  // Two names on the left of the jar, pointing into their own blocks from the near edge, and the
  // three that share the hundredth cell on the right, converging on it from the near side. No
  // leader crosses the grid and no two leaders cross each other.
  const where = [
    { x: frame.x - 8, y: g.y + g.size * 0.08, align: 'right' },
    { x: frame.x - 8, y: g.y + g.size * 0.86, align: 'right' },
    { x: frame.x + frame.w + 8, y: g.y + g.size * 0.66, align: 'left' },
    { x: frame.x + frame.w + 8, y: g.y + g.size * 0.86, align: 'left' },
    { x: frame.x + frame.w + 8, y: g.y + g.size * 1.02, align: 'left' },
  ];
  // Where each leader lands inside the hundredth cell: the foot of the argon band, the carbon
  // dioxide band, and the very top of the square where the last 3% sits.
  const rareAt = [0.45, 0.95, 0.985];
  for (let i = 0; i < GASES.length; i++) {
    const g2 = g;
    const at = i < 2 ? cellCentre(g2, cells[i]) : {
      x: g2.x + 9.5 * g2.cell,
      y: g2.y + 9 * g2.cell + g2.cell * rareAt[i - 2],
    };
    const a = where[i];
    const col = gasColor(c, i);
    leader(ctx, a.x, a.y, at.x, at.y, col, 0.5);
    // The chip is the gas's own colour taken most of the way to the deep background: the five have
    // to read as five, and the ink has to clear 4.5:1 on the two lightest of them.
    pill(ctx, c, GASES[i].label, a.x, a.y, {
      align: a.align, bg: mix(col, c.bgDeep, 0.52), size,
    });
  }
}

// -- the loupe -----------------------------------------------------------------------------------

// The magnifier: a ring, a glass, and one cell of the hundred drawn MAG times life size. What is
// under the pointer inside that cell decides the readout, so the loupe is a reading instrument and
// not a label - and on the hundredth cell it separates the three gases the grid cannot.
//
// The lens square is the size the cell actually is on the grid, times MAG, capped at the ring's
// own inner diameter. Pass o.cellPx for the true cell size and the lens is honest about how much
// it is magnifying; pass o.size to force the square (a scene that wants a bigger readable lens
// than true magnification allows has to say so).
//
// o = { cell, frac, cellPx, size, grabbed, handleAngle }.
export function drawLoupe(ctx, c, cx, cy, r, o = {}) {
  const i = o.cell === undefined ? RARE_CELL : o.cell;
  const g = cellGasIn(i, o.frac === undefined ? 0.96 : o.frac);

  // The glass, with a soft edge so it sits over the cells rather than on them.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = alpha(c.bgDeep, 0.82);
  ctx.fill();
  ctx.clip();

  // The magnified cell, drawn as that cell's own bands: one for an ordinary cell, three for the
  // hundredth, laid out by the same `rareBands()` the hit test uses. This is a rendered
  // magnification, never a redrawn chart.
  const s = Math.min(r * 2 * 0.82, o.size || (o.cellPx ? o.cellPx * MAG : Infinity));
  const x0 = cx - s / 2, y0 = cy - s / 2;
  const L = rareBands();
  const fromHead = [];
  if (i === RARE_CELL) {
    fromHead.push({ gas: 2, f: L.argon });
    let y = L.argon;
    for (const b of L.rare) { fromHead.push({ gas: b.gas, f: y + b.frac }); y += b.frac; }
  } else fromHead.push({ gas: g, f: 1 });

  // A hairline around the band the pointer is on, so the lens says which of the three you are on.
  const mine = fromHead.find((b) => b.gas === g);
  fromHead.forEach((b, k) => {
    const top = k === 0 ? 0 : fromHead[k - 1].f;
    const y1 = y0 + s * top, y2 = y0 + s * b.f;
    ctx.fillStyle = gasColor(c, b.gas);
    ctx.fillRect(x0, y1, s, y2 - y1);
    if (mine && b.gas === g) {
      ctx.strokeStyle = c.label;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x0 - 1.5, y1 + 0.75, s + 3, Math.max(2, y2 - y1 - 1.5));
    }
  });

  // A band of shade across the top of the lens, and one glint: this is glass, not a swatch.
  ctx.fillStyle = alpha(c.bgDeep, 0.13);
  ctx.fillRect(x0, y0 + s * 0.02, s, s * 0.26);
  ctx.fillStyle = alpha(c.label, 0.14);
  ctx.beginPath();
  ctx.moveTo(x0 + s * 0.08, y0 + s * 0.44);
  ctx.lineTo(x0 + s * 0.40, y0 + s * 0.03);
  ctx.lineTo(x0 + s * 0.58, y0 + s * 0.03);
  ctx.lineTo(x0 + s * 0.22, y0 + s * 0.44);
  ctx.closePath();
  ctx.fill();
  // The cell's own edges, so the magnified square still reads as ONE cell of a hundred.
  ctx.strokeStyle = alpha(c.label, 0.32);
  ctx.lineWidth = 1;
  ctx.strokeRect(x0 + 0.5, y0 + 0.5, s - 1, s - 1);
  ctx.restore();

  // The ring, in the gas's own colour, so the readout's name is on the lens the learner is holding.
  const ring = mix(gasColor(c, g), c.bgDeep, o.grabbed ? 0 : 0.26);
  const lw = Math.max(4, r * 0.20);
  ctx.strokeStyle = ring;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(cx, cy, r - lw / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = alpha(c.label, 0.28);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r + lw * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  // The handle, pointing away from the lens centre and away from the frame edge.
  const ha = o.handleAngle === undefined ? -Math.PI * 0.30 : o.handleAngle;
  const ux = Math.cos(ha), uy = Math.sin(ha);
  ctx.strokeStyle = ring;
  ctx.lineWidth = Math.max(5, r * 0.24);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + ux * r * 1.1, cy + uy * r * 1.1);
  ctx.lineTo(cx + ux * r * 1.85, cy + uy * r * 1.85);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

// Where a pointer lands: the cell under it and how far down, or the nearest cell within the ring's
// reach when the pointer is on the rim, or null when it misses the jar altogether.
export function loupeCellAt(frame, px, py, r) {
  const hit = cellAtPoint(frame.grid, px, py);
  if (hit) return hit;
  let best = null, bd = r;
  for (let i = 0; i < GRID_CELLS; i++) {
    const p = cellCentre(frame.grid, i);
    const d = Math.hypot(p.x - px, p.y - py);
    if (d < bd) { bd = d; best = i; }
  }
  return best === null ? null : { cell: best, frac: 0.5 };
}