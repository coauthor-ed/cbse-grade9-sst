// ShipTop - a ship seen from above, with its side lights, and the four meetings at sea. General: any rules-of-the-road
// figure. Bow points up at rot 0. Port (left) red, starboard (right) green, by tokens.
//   svgShipTop(x, y, rot, k, { hull, lights, label }) -> svg      MEETINGS: head, right, left, behind
import { sea, SEA_INK, WHITE, num } from '../L08/SeaDraw.js';

export const RED = 'var(--sim-series-6)', GREEN = 'var(--sim-series-3)';
export function svgShipTop(x, y, rot, k, o = {}) {
  const hull = o.hull ?? WHITE;
  return `<g transform="translate(${num(x)} ${num(y)}) rotate(${rot}) scale(${k})"><path d="M0 -60C20 -36 22 -10 22 34Q22 46 10 46H-10Q-22 46 -22 34C-22 -10 -20 -36 0 -60Z" style="fill:${hull};stroke:${SEA_INK};stroke-width:3.5"/><rect x="-13" y="18" width="26" height="18" rx="4" style="fill:${SEA_INK}"/><path d="M0 -44V10" style="stroke:${SEA_INK};stroke-width:2;opacity:0.4"/>`
    + (o.lights === false ? '' : `<circle cx="-22" cy="-8" r="7" style="fill:${RED};stroke:${WHITE};stroke-width:2"/><circle cx="22" cy="-8" r="7" style="fill:${GREEN};stroke:${WHITE};stroke-width:2"/>`) + '</g>';
}
/** at: other ship from own, as parts of the free space. rot: its heading. see: lights you see. */
export const MEETINGS = {
  head: { label: 'Head-on', at: [0, -1], rot: 180, see: ['red', 'green', 'white'], read: 'Red and green together: it is coming straight at you', you: 'Both ships turn right', role: 'both act', mine: 'right', other: 'right' },
  right: { label: 'On your right', at: [1, -0.25], rot: -90, see: ['red', 'white'], read: 'Red: it is crossing from your right', you: 'You give way', role: 'give-way vessel', mine: 'right', other: 'hold' },
  left: { label: 'On your left', at: [-1, -0.25], rot: 90, see: ['green', 'white'], read: 'Green: it is crossing from your left', you: 'You stand on', role: 'stand-on vessel', mine: 'hold', other: 'right' },
  behind: { label: 'Overtaking', at: [0, -1], rot: 0, see: ['white'], read: 'White only: you are coming up behind it', you: 'You keep clear', role: 'overtaking ship', mine: 'right', other: 'hold' },
};
export const seaNight = (W, H, id) => `<rect x="0" y="0" width="${W}" height="${H}" rx="14" style="fill:color-mix(in oklab, ${sea('seaDeep')} 34%, ${SEA_INK})"/>`;
