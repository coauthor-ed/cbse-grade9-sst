// HighSeasScene - the sea beyond every EEZ. Beat 0: 64 per cent of the world's oceans, no single country's. Beat 1: the
// six equal rights, each one drawn doing its thing in one section of open sea. Beat 2: what goes wrong, and that rules
// exist but are harder to enforce. Nothing here says the sea is lawless.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, deepTx, tag, panel, sea, svgCargoShip, svgTrawler, svgAeroplane, svgOilRig, svgSeaColumn, svgWaveLine, svgStrata, svgFish, svgCloud, skyRect, num, SEA_INK, MUTED } from './SeaDraw.js';
import { HIGH_SEAS_SHARE_PCT } from './MaritimeZones.js';

const one = (i) => [{ idx: i, dwellMs: null }];

export class HighSeasScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 560;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'The high seas: about 64 per cent of the world oceans, belonging to no single country, with six equal rights for all countries and problems that are harder to control.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 520 : 440; }
  _base(st, id) {
    const W = st.W, H = st.H, sy = H * 0.36, fy = H - (st.portrait ? 92 : 78);
    let s = skyRect(id, 0, 0, W, sy + 4, 0, 6);
    s += svgCloud(W * 0.2, 44, st.portrait ? 0.46 : 0.6, { seed: 2 }) + svgCloud(W * 0.8, 60, st.portrait ? 0.4 : 0.5, { seed: 6 });
    s += svgSeaColumn(0, sy, 1, { w: W, h: H - sy, bands: 4, wave: 3 });
    const pts = []; for (let x = -8; x <= W + 8; x += 24) pts.push(`${x} ${num(fy + Math.sin(x / 70) * 7)}`);
    const d = `M${pts.join('L')}L${W + 8} ${H + 8}L-8 ${H + 8}Z`;
    s += `<defs><clipPath id="${id}c"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}c)">${svgStrata(0, fy - 12, 1, { w: W + 8, h: H - fy + 24, bands: 3, seed: 8 })}</g>`;
    s += svgWaveLine(0, sy, 1, { w: W, amp: 3 });
    return { s, sy, fy, W, H, P: st.portrait };
  }
  paint(st) {
    const step = this.stepIndex;
    const { s: base, sy, fy, W, H, P } = this._base(st, `hs${step}`);
    let s = base;
    if (step === 0) {
      s += svgCargoShip(W * 0.5, sy + 3, P ? 0.72 : 1, {});
      s += svgFish(W * 0.24, sy + 90, 0.8, { kind: 1 }) + svgFish(W * 0.76, sy + 120, 0.7, { kind: 2, flip: true });
      const cw = Math.min(W - 24, 420), cx = (W - cw) / 2, cy = sy + 150, bh = 22;
      s += panel(cx, cy, cw, 104);
      s += tx(cx + cw / 2, cy + 30, 'High seas, or international waters', { size: P ? 16 : 18, display: true, weight: 700 });
      s += `<rect x="${cx + 16}" y="${cy + 44}" width="${cw - 32}" height="${bh}" rx="10" style="fill:var(--sim-track)"/><rect x="${cx + 16}" y="${cy + 44}" width="${num((cw - 32) * HIGH_SEAS_SHARE_PCT / 100)}" height="${bh}" rx="10" style="fill:${sea('seaDeep')}"/>`;
      s += tx(cx + 16 + (cw - 32) * 0.32, cy + 60, `about ${HIGH_SEAS_SHARE_PCT}%`, { size: 15, col: sea('cloud') });
      s += tx(cx + cw / 2, cy + 90, "of the world's oceans; no single country's", { size: 15, weight: 700 });
    } else if (step === 1) {
      const lab = (x, y, t, o = {}) => tag(x, y, t, { size: 15, ...o });
      s += svgAeroplane(W * 0.26, 58, P ? 0.5 : 0.66, {}) + lab(W * 0.26 + (P ? 100 : 150), 58, 'flying over');
      s += svgCargoShip(W * 0.22, sy + 3, P ? 0.46 : 0.6, {}) + lab(W * 0.22, sy + 34, 'navigation');
      s += svgTrawler(W * 0.72, sy + 2, P ? 0.5 : 0.62, {});
      s += `<path d="M${W * 0.72 - 40} ${sy + 4}L${W * 0.72 - 90} ${sy + 66}H${W * 0.72 - 14}Z" style="fill:${sea('cloud')};opacity:0.45;stroke:${SEA_INK};stroke-width:2;stroke-dasharray:5 4"/>`;
      s += lab(W * 0.7, sy + 86, 'fishing');
      s += svgOilRig(W * 0.46, sy + 2, P ? 0.5 : 0.62, { legs: 60 }) + lab(W * 0.46, sy + 124, 'lawful structures');
      s += `<path d="M-6 ${fy - 8}Q${W * 0.3} ${fy + 8} ${W * 0.55} ${fy - 4}T${W + 6} ${fy - 2}" style="fill:none;stroke:${SEA_INK};stroke-width:6"/><path d="M-6 ${fy - 8}Q${W * 0.3} ${fy + 8} ${W * 0.55} ${fy - 4}T${W + 6} ${fy - 2}" style="fill:none;stroke:var(--sim-series-2);stroke-width:3"/>`;
      s += lab(8, fy - 34, 'undersea cables', { anchor: 'start' });
      for (let i = 0; i < 7; i++) s += `<ellipse cx="${num(W * 0.66 + i * 17)}" cy="${num(fy + 10 + (i % 3) * 5)}" rx="9" ry="6" style="fill:${sea('rockDeep')};stroke:${SEA_INK};stroke-width:2"/>`;
      s += lab(W - 8, fy - 26, 'exploring for minerals', { anchor: 'end' });
      s += deepTx(W / 2, H - 12, 'Six equal rights for all countries', { size: 17, display: true, weight: 700 });
    } else {
      const x1 = W * 0.26, x2 = W * 0.72;
      s += svgTrawler(x1, sy + 2, P ? 0.52 : 0.66, {}) + svgTrawler(x2, sy + 2, P ? 0.52 : 0.66, { flip: true });
      for (const x of [x1, x2]) s += `<path d="M${num(x - 20)} ${sy + 4}L${num(x - 74)} ${sy + 92}H${num(x + 34)}Z" style="fill:${sea('cloud')};opacity:0.4;stroke:${SEA_INK};stroke-width:2;stroke-dasharray:5 4"/>`;
      s += svgFish(x1 - 20, sy + 70, 0.5, { kind: 0 }) + svgFish(x2, sy + 76, 0.5, { kind: 1, flip: true });
      s += tag(W / 2, 40, 'no single country controls this water', { size: P ? 15 : 16 });
      const rows = ['overfishing', 'illegal fishing', 'conflicts over resources'];
      const cw = Math.min(W - 24, 430), cx = (W - cw) / 2, ch = 148, cy = H - ch - 12;
      s += panel(cx, cy, cw, ch);
      s += tx(cx + cw / 2, cy + 28, 'Problems that often arise', { size: 18, display: true, weight: 700 });
      rows.forEach((r, i) => { s += tx(cx + cw / 2, cy + 54 + i * 24, r, { size: 17, weight: 700 }); });
      s += tx(cx + cw / 2, cy + ch - 16, 'Rules exist, but enforcing them is harder', { size: P ? 15 : 16, col: MUTED, weight: 700 });
    }
    return { svg: frame(st, s) };
  }
}
