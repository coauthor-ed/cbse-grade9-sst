/**
 * EvidenceCardKit - the one drawing helper shared by L01's two card-based
 * scenes: EvidenceLimitsScene (blk-l01-s04) and DeciphermentRequirementsScene
 * (blk-l01-s06). The student meets them two slides apart in the same lesson,
 * so their cards and their tick/cross glyphs must look like one set. That is
 * all this module is for.
 *
 * Pure and stateless by contract (EvidenceCardKit.helper.md): exported
 * functions and constant strings only, no module-level mutable anything. Each
 * scene mounts fresh and independently (docs/simulation-authoring.md S0's
 * cross-mount rule), so a module-level cache or counter would leak between
 * mounts and between the two scenes.
 *
 * Factories return DETACHED elements - the calling scene appends them into
 * its own this.root. No text is decided here; every string is passed in. No
 * colour is decided here either: glyph strokes are `currentColor`, so the
 * scene sets --sim-success / --sim-error / --sim-label-muted on the slot.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Second stroke of a cross follows this far behind the first, so the glyph
 *  reads as being written rather than stamped. */
const CROSS_STAGGER_MS = 120;

/**
 * Path lengths, in the 20x20 viewBox's own user units, used as the
 * stroke-dasharray/stroke-dashoffset the draw-in animates to zero. Computed
 * from the path data below, rounded up - a dasharray shorter than its path
 * leaves a stub of stroke visible in the "not yet drawn" state.
 *   tick:  (4,10.5)->(8.5,15) = 6.4 plus (8.5,15)->(16,5.5) = 12.1  -> 19
 *   cross: (5,5)->(15,15) = 14.2, twice                             -> 15
 */
const TICK_LEN = 19;
const CROSS_LEN = 15;

export const CARD_CSS = `
  /* ---- EvidenceCardKit: shared card + glyph vocabulary (.ek-*) ---------- */

  .ek-card {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 1px solid var(--sim-stroke);
    border-radius: 6px;
    background: var(--sim-bg-surface);
    color: var(--sim-label);
    font-size: 12.5px;
    font-weight: 600;
    line-height: 1.25;
    box-shadow: 0 1px 2px color-mix(in oklab, var(--sim-bg-deep) 60%, transparent);
    transition: opacity 280ms ease, box-shadow 280ms ease,
                border-color 280ms ease, transform 280ms ease;
  }

  .ek-card-text { flex: 1 1 auto; }

  /* Undecided / not-yet-in-play. */
  .ek-card[data-tone="muted"] {
    opacity: 0.55;
    border-style: dashed;
  }

  /* The resolved, plain state. */
  .ek-card[data-tone="solid"] { opacity: 1; border-style: solid; }

  /* The harder / negative case: dashed edge plus a faint diagonal hatch, so
     it stays distinguishable from a solid card with colour removed. */
  .ek-card[data-tone="hard"] {
    border-style: dashed;
    color: color-mix(in oklab, var(--sim-label) 78%, var(--sim-bg-surface));
  }
  .ek-card[data-tone="hard"]::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0.5;
    transition: opacity 320ms ease;
    background-image: repeating-linear-gradient(
      135deg,
      color-mix(in oklab, var(--sim-label) 22%, transparent) 0 1px,
      transparent 1px 7px
    );
  }

  /* Raised while a card is in transit between pile and column. */
  .ek-card.ek-flying {
    box-shadow: 0 4px 12px color-mix(in oklab, var(--sim-bg-deep) 78%, transparent);
  }

  /* The slot a verdict glyph lands in. Grid so a dot placeholder and the
     glyph that replaces it can stack in one cell and cross-fade. */
  .ek-glyph-slot {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
  }
  .ek-glyph-slot > .ek-glyph { grid-area: 1 / 1; }

  .ek-glyph { display: block; overflow: visible; color: inherit; }
  .ek-glyph .ek-stroke {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  /* The undecided placeholder: a dashed ring, never drawn in. */
  .ek-glyph[data-kind="dot"] .ek-dot {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-dasharray: 2 3;
  }

  /* Static final state lives OUTSIDE the media query, so reduced motion
     lands on the drawn glyph with no transition at all. */
  @media (prefers-reduced-motion: no-preference) {
    .ek-glyph .ek-stroke {
      transition: stroke-dashoffset 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
    }
  }
`;

/**
 * A labelled card.
 * @param {object}  opts
 * @param {string}  opts.text   the label. Callers pass fragments, never
 *                              sentences (AGENTS.md rule 11 - the scene
 *                              labels, the slide's markdown explains).
 * @param {'muted'|'solid'|'hard'} [opts.tone='solid']
 * @param {string}  [opts.id]   set as data-card-id so a scene can find it
 * @returns {HTMLElement} detached <div class="ek-card">
 */
export function makeCard({ text, tone = 'solid', id } = {}) {
  const card = document.createElement('div');
  card.className = 'ek-card';
  card.setAttribute('data-tone', tone);
  if (id) card.setAttribute('data-card-id', id);

  const label = document.createElement('span');
  label.className = 'ek-card-text';
  label.textContent = text ?? '';
  card.appendChild(label);

  const slot = document.createElement('span');
  slot.className = 'ek-glyph-slot';
  card.appendChild(slot);

  return card;
}

function svg(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/**
 * A tick, a cross, or the dotted "undecided" placeholder.
 *
 * Tick and cross come back with their strokes already parked at
 * stroke-dashoffset = full length, i.e. invisible, waiting for drawGlyph().
 * A dot has nothing to draw in and is visible immediately.
 *
 * @param {object} opts
 * @param {'tick'|'cross'|'dot'} opts.kind
 * @param {number} [opts.size=18] design px
 * @returns {SVGElement} detached <svg class="ek-glyph">
 */
export function makeGlyph({ kind, size = 18 } = {}) {
  const root = svg('svg', {
    class: 'ek-glyph',
    'data-kind': kind,
    'data-draw': 'pending',
    width: size,
    height: size,
    viewBox: '0 0 20 20',
    'aria-hidden': 'true',
    focusable: 'false',
  });

  const strokes = [];
  const addStroke = (d, len) => {
    const path = svg('path', { class: 'ek-stroke', d });
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    root.appendChild(path);
    strokes.push(path);
  };

  if (kind === 'tick') {
    addStroke('M4 10.5 L8.5 15 L16 5.5', TICK_LEN);
  } else if (kind === 'cross') {
    // Two paths, so drawGlyph can offset the second and the cross reads as
    // two separate strokes of a pen.
    addStroke('M5 5 L15 15', CROSS_LEN);
    addStroke('M15 5 L5 15', CROSS_LEN);
  } else {
    root.appendChild(svg('circle', { class: 'ek-dot', cx: 10, cy: 10, r: 6.2 }));
    root.setAttribute('data-draw', 'drawn');
  }

  // Read back by drawGlyph. An expando on the returned element, not module
  // state - it lives and dies with this one glyph.
  root._ekStrokes = strokes;
  return root;
}

/**
 * Kicks the draw-in on a glyph from makeGlyph(): its strokes run to
 * stroke-dashoffset 0. Under reduced motion CARD_CSS defines no transition,
 * so this lands on the final state immediately. No-op on a dot.
 *
 * @param {SVGElement} el
 * @param {object} [opts]
 * @param {number} [opts.delayMs=0] delay before the first stroke starts
 */
export function drawGlyph(el, { delayMs = 0 } = {}) {
  if (!el) return;
  const strokes = el._ekStrokes ?? [];
  // A glyph appended and animated in the same frame has no computed start
  // value to transition FROM; forcing layout here is what makes the draw-in
  // actually run instead of snapping. (No-op headlessly - the fake DOM has
  // no such method.)
  el.getBoundingClientRect?.();
  strokes.forEach((path, i) => {
    path.style.transitionDelay = `${delayMs + i * CROSS_STAGGER_MS}ms`;
    path.style.strokeDashoffset = '0';
  });
  el.setAttribute('data-draw', 'drawn');
}
