// SeasonTiltScene - blk-l03-s03c. Beat 0: the Sun and the Earth's path; nearest around 3 January,
// farthest around 4 July; Delhi's temperatures from Table 3.3 say distance is not the cause.
// Beats 1, 2: tilted Earth in June, in December, beside Delhi's noon Sun. Noon height is the real
// figure for latitude 28.6: about 85 degrees in June, about 38 in December. Day lengths are about 14
// and 10 hours. Beyond the book; listed in the report.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { sunEdge, AIR_CSS, tx, skyTx, reading, skyRect, loadGeo, globe, sky, SKY_INK, svgSun, svgLand } from './AirDraw.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const TILT = 23.5;
const rad = (d) => d * Math.PI / 180;

export class SeasonTiltScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'The Earth moves round the Sun. It is nearest in January and farthest in July. The tilted Earth leans towards the Sun in June and away from it in December, so the noon Sun over Delhi stands high in June and low in December.';
  static CONTROLS = [];
  static PORTRAIT_HEIGHT = 580;
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? (this.stepIndex === 0 ? 440 : 540) : (this.stepIndex === 0 ? 452 : 430); }
  async setup() { await super.setup(); this._g = await loadGeo(); this.repaint(); }

  paint(st) { return this.stepIndex === 0 ? this._orbit(st) : this._tilt(st, this.stepIndex === 1); }

  _orbit(st) {
    const W = st.W, H = st.H, port = st.portrait;
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('seaDeep')}"/>`;
    const cy = port ? 150 : 172, rx = port ? 120 : 240, ry = port ? 92 : 124, cx = W / 2 + (port ? 8 : 12);
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" style="fill:none;stroke:${sky('cloud')};stroke-width:2.5;stroke-dasharray:9 8"/>`;
    const sx = cx - (port ? 22 : 40);     // the Sun off centre: the difference is drawn far larger than real
    s += `<circle cx="${sx}" cy="${cy}" r="56" style="fill:${sky('sun')};opacity:0.3"/>` + svgSun(sx, cy, 0.8, {});
    const er = port ? 25 : 32, jx = cx - rx, ix = cx + rx;
    s += globe(this._g, jx, cy, er, { rotate: [-78, -10, 0], india: false }).svg + globe(this._g, ix, cy, er, { rotate: [-78, -10, 0], india: false }).svg;
    const lab = (x, a, b, an) => tx(x, cy - er - 30, a, { size: 16, col: sky('cloud'), halo: sky('seaDeep'), anchor: an }) + tx(x, cy - er - 11, b, { size: 15, col: sky('cloud'), halo: sky('seaDeep'), weight: 700, anchor: an });
    s += lab(Math.max(10, jx - er), '3 January', 'nearest', 'start') + lab(Math.min(W - 10, ix + er), '4 July', 'farthest', 'end');
    const y0 = port ? 300 : 306, cw = port ? (W - 30) / 2 : 190;
    const gap = port ? 10 : 18, x0 = (W - 2 * cw - gap) / 2;
    s += reading(x0, y0, 'Delhi in January', '14.4 \u00b0C', { w: cw, h: 76, size: 28 }) + reading(x0 + cw + gap, y0, 'Delhi in June', '33.3 \u00b0C', { w: cw, h: 76, size: 28 });
    const yq = y0 + (port ? 104 : 100);
    s += tx(W / 2, yq, 'Nearest the Sun, and coldest.', { size: 17, col: sky('cloud') });
    s += tx(W / 2, H - 10, 'Path drawn much rounder than it is. Not to scale.', { size: 14, col: sky('cloud'), weight: 700 });
    return { svg: s };
  }

  _tilt(st, june) {
    const W = st.W, H = st.H, port = st.portrait, flag = june ? 1 : -1;
    const noon = june ? 85 : 38, day = june ? 'about 14 hours' : 'about 10 hours', month = june ? 'June' : 'December';
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('seaDeep')}"/>`;
    // left: tilted Earth lit from the left
    const R = port ? 92 : 112, gx = port ? W * 0.56 : W * 0.3, gy = port ? 118 : H / 2 - 8;
    s += sunEdge(gy, port ? 58 : 76, 20);
    for (const dy of [-0.6, -0.15, 0.3, 0.7]) s += `<path d="M${port ? 56 : 66} ${gy + dy * R}H${gx - R * Math.sqrt(1 - dy * dy) - 6}" style="stroke:${sky('sun')};stroke-width:5;stroke-linecap:round;opacity:0.85"/>`;
    const roll = flag * TILT;   // north pole leans towards the Sun (left) in June, away in December
    const g1 = globe(this._g, gx, gy, R, { rotate: [-78, 0, roll], india: true });
    // Which way a roll turns the pole depends on the projection: ask it, so the north end is true.
    const pole = g1.proj?.([0, 90]);
    const good = !pole || (pole[0] - gx) * flag <= 0;
    s += good ? g1.svg : globe(this._g, gx, gy, R, { rotate: [-78, 0, -roll], india: true }).svg;
    s += `<path d="M${gx} ${gy - R}A${R} ${R} 0 0 1 ${gx} ${gy + R}" style="fill:${SKY_INK};opacity:0.32"/>`;
    const a = rad(flag * -TILT), L = R + 16;
    const dx = Math.sin(a) * L, dy = -Math.cos(a) * L;
    s += `<path d="M${(gx - dx).toFixed(1)} ${(gy - dy).toFixed(1)}L${(gx + dx).toFixed(1)} ${(gy + dy).toFixed(1)}" style="stroke:${sky('cloud')};stroke-width:4;stroke-linecap:round"/>`;
    s += tx(gx + dx, gy + dy - 8 + (port && dy < 0 ? 16 : 0), 'N', { size: 16, col: sky('cloud') });
    s += tx(port ? gx : gx, port ? gy + R + 38 : gy + R + 44, june ? 'North leans towards the Sun' : 'North leans away from the Sun', { size: 15, col: sky('cloud') });
    // right: the noon Sun over Delhi
    const b = port ? { x: 10, y: 262, w: W - 20, h: H - 272 } : { x: W * 0.56, y: 16, w: W * 0.44 - 14, h: H - 32 };
    s += `<clipPath id="stPane"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="14"/></clipPath><g clip-path="url(#stPane)">` + skyRect('stSky', b.x, b.y, b.w, b.h, 0, 10);
    const gr = b.y + b.h - 52, px = b.x + b.w * 0.5;
    s += svgLand(b.x, gr, 1, { w: b.w, h: 60, kind: 'town', seed: 3 });
    const arcR = Math.min(b.w * 0.42, gr - b.y - 34);
    s += `<path d="M${px - arcR} ${gr}A${arcR} ${arcR} 0 0 1 ${px + arcR} ${gr}" style="fill:none;stroke:${sky('cloud')};stroke-width:2.5;stroke-dasharray:8 7"/>`;
    const sunX = px + arcR * Math.cos(rad(noon)) * -1, sunY = gr - arcR * Math.sin(rad(noon));
    s += svgSun(sunX, sunY, 0.5, {});
    s += `<path d="M${sunX} ${sunY}L${px + 14} ${gr}" style="stroke:${sky('sunRay')};stroke-width:4;stroke-dasharray:3 9;stroke-linecap:round"/>`;
    s += '</g>' + `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="14" style="fill:none;stroke:var(--sim-stroke);stroke-width:2.5"/>`;
    s += skyTx(b.x + 12, b.y + 26, `Delhi, noon in ${month}`, { size: 16, anchor: 'start' });
    const cw = Math.min(142, (b.w - 28) / 2);
    s += reading(b.x + 8, gr - 18, 'Sun height', `about ${noon}\u00b0`, { w: cw + 6, h: 64, size: 21 }) + reading(b.x + b.w - cw - 14, gr - 18, 'Daylight', day.replace('about ', ''), { w: cw + 6, h: 64, size: 21 });
    s += tx(10, H - 8, '', { size: 13 });
    return { svg: s };
  }
}
