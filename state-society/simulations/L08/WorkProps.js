// WorkProps.js - small drawn things for the L08 scenes. A helper, not a scene.
import { darken, lighten } from 'simulations/base/kit/SimLook.js';
import { pal } from '../shared/SstArt.js';

/** A tied sack of grain. */
export function sack(ctx, c, x, y, s = 1) {
  const P = pal(c);
  ctx.fillStyle = P.sandDark; ctx.beginPath(); ctx.ellipse(x, y + 4 * s, 34 * s, 38 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lighten(P.sandDark, 0.3); ctx.beginPath(); ctx.ellipse(x - 8 * s, y - 2 * s, 18 * s, 24 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = darken(P.sandDark, 0.3); ctx.fillRect(x - 12 * s, y - 36 * s, 24 * s, 7 * s);
}
