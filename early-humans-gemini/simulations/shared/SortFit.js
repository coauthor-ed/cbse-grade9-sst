// SortFit - lets a SortBoard fit above the action bar at 1280x720, so no scroll is needed to play or to Check.
// The host gives a game about 355 px under its objective line. Add SORT_FIT_CSS to static CSS and set static HEIGHT = SORT_FIT_H.
export const SORT_FIT_H = 335;
export const SORT_FIT_CSS = `
.gm.sb { background: var(--sim-bg-surface); border-radius: 14px; padding: 8px 16px 10px; gap: 6px; }
.sb .kicker { display: none; }
.sb .gm-head h2 { font-size: 22px; }
.sb .board { grid-template-columns: minmax(0, 1fr) 470px; gap: 12px; min-height: 0; }
.sb .bins { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; max-height: 248px; margin-top: 18px; overflow-y: auto; align-content: start; }
.sb .bin { min-height: 54px; padding: 5px 10px; }
.sb .gm-check--corner { right: 16px; bottom: 8px; }
.sim-dom-root--portrait .sb .bins { display: flex; flex-direction: column; max-height: none; margin-top: 0; overflow: visible; }
.sim-dom-root--portrait .gm.sb { padding: 4px 4px 8px; }
`;
