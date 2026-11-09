// SeaGame.js - bits for GameBoard games on a sea stage: portrait test, a shared stylesheet. Not a scene.
export const isPortrait = (scene) => !!scene.root?.classList?.contains('sim-dom-root--portrait');
// The frame penguin sits at the top right of the card; at landscape the board starts below its feet.
export const SEA_MASCOT_CSS = `
.sim-dom-root:not(.sim-dom-root--portrait) .gm .gm-head { margin-bottom: 16px; }
`;
export const SEA_GAME_CSS = SEA_MASCOT_CSS + `
.gm { background: var(--sim-bg-deep); border-radius: 14px; }
.gm .sea-pic { display: block; width: 100%; height: auto; border-radius: var(--sim-radius-lg); overflow: hidden; }
.gm .sg-row { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; }
.gm .sg-row .btn { flex: 1 1 auto; min-height: 48px; min-width: 48px; }
.gm .btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 30%, var(--sim-bg-surface)); border-color: var(--sim-accent); }
.gm .btn[disabled], .gm .btn[aria-disabled="true"] { opacity: 0.5; cursor: default; }
.gm .btn--go { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: var(--sim-accent); }
.gm .sg-msg { font-size: 15px; font-weight: 700; line-height: 1.3; min-height: 2.6em; margin: 0; color: var(--sim-label); }
.gm .sg-msg[data-tone="bad"] { color: var(--sim-bad); }
.gm .sg-msg[data-tone="good"] { color: var(--sim-good); }
.gm .sg-board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 14px; align-items: start; }
.gm .sg-side { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .gm .sg-board { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .gm .sg-side { width: 100%; }
`;
