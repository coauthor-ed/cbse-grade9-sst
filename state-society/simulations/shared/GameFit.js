// GameFit - a sort board that fits above the action bar at 1280x720, so no scroll is needed to play or to Check.
// The host gives a game about 355 px between its objective line and the action bar. Height 335 at the
// usual 1.06 scale fills that. Four bins in two columns, Check under the tray, a panel in both themes.
// A helper, not a scene. Add FIT_CSS to the end of a SortBoard's static CSS and set static HEIGHT = FIT_H.
export const FIT_H = 335;

// Phone: bins two by two, so tray, bins and Check fit one view (626 px) while chips land.
// The count goes: at 153 px wide the label needs the room, and the chips show what is held.
export const phoneBins = (key) => `
.sim-dom-root--portrait .${key} .bins { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px; }
.sim-dom-root--portrait .${key} .bin { min-height: 62px; padding: 6px 8px; }
.sim-dom-root--portrait .${key} .count { display: none; }
`;

export const FIT_CSS = `
.gm.sb { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 16px 10px; gap: 6px; }
.sb .kicker { display: none; }
.sb .gm-head h2 { font-size: 22px; }
.sb .board { grid-template-columns: minmax(0, 1fr) 470px; gap: 12px; min-height: 0; }
.sb .bins { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; max-height: 248px; margin-top: 16px;
            overflow-y: auto; align-content: start; }
.sb .bin { min-height: 56px; padding: 6px 10px; }
.sb .gm-check--corner { left: 16px; right: auto; bottom: 10px; }
.sim-dom-root--portrait .sb .bins { display: flex; flex-direction: column; max-height: none; margin-top: 0; overflow: visible; }
.sim-dom-root--portrait .gm.sb { padding: 4px 4px 8px; }
.sim-dom-root--portrait .sb .kicker { display: none; }
`;
