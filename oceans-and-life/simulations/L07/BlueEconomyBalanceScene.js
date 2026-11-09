// BlueEconomyBalanceScene - beat 0: the three parts of the Blue Economy as a cycle round one hub. Beats 1 and 2: two
// made-up policy cards move three meters, this year and years later, labelled made up. Beat 3: a lighthouse of the seven
// aims of SDG 14, own art. The meters are a sketch, not data, and say so.
// Controls: data-act="now", data-act="later".
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, seaTx, tag, panel, sea, svgLighthouse, svgSeaColumn, svgWaveLine, svgCountryBoat, svgTrawler, skyRect, controlRow, rowBtn, bindActs, num, SEA_INK, WHITE } from '../L08/SeaDraw.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const PARTS = ['Economic growth', 'Ecosystem health', 'Livelihoods and jobs'];
const CARDS = {
  1: { head: 'Made-up policy: close the season', sub: 'No fishing for three months', now: [-1, 2, -1], later: [1, 2, 1] },
  2: { head: 'Made-up policy: more boats', sub: 'Twice as many boats go out', now: [2, -2, 1], later: [-1, -2, -2] },
};
const AIMS = ['Reduce marine pollution', 'Protect marine ecosystems', 'Address ocean acidification', 'Regulate fishing', 'Conserve marine areas', 'Eliminate harmful subsidies', 'Increase economic benefits'];
const WORD = { '-2': 'falls a lot', '-1': 'falls', 0: 'same', 1: 'rises', 2: 'rises a lot' };

export class BlueEconomyBalanceScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2), one(3)];
  static WIDTH = 680;
  static HEIGHT = 480;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 590;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'The Blue Economy joins economic growth, ecosystem health, and improved livelihoods and jobs. Two made-up policies move these three. A lighthouse lists the seven aims of Sustainable Development Goal 14.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? (this.stepIndex === 3 ? 530 : 440) : 410; }
  async setup() {
    this.when = 'now';
    await super.setup();
    this.row = controlRow(this);
    this._off = bindActs(this, (a) => { this.when = a; this._row(); });
    this.enter(this.stepIndex);
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  _row() { if (this.row) this.row.innerHTML = CARDS[this.stepIndex] ? rowBtn('This year', 'now', { pressed: this.when === 'now' }) + rowBtn('Years later', 'later', { pressed: this.when === 'later' }) : ''; }
  enter() { this.when = 'now'; this._row(); this.relayout?.(); }
  _cycle(st) {
    const W = st.W, H = st.H, P = st.portrait, cx = W / 2, cy = H * 0.52, hub = P ? 60 : 72;
    let s = skyRect('beS', 0, 0, W, 90, 0, 4, { r: 14 }) + svgSeaColumn(0, 84, 1, { w: W, h: H - 84, bands: 3, wave: 3 }) + svgWaveLine(0, 84, 1, { w: W, amp: 3 });
    const pos = P ? [[W * 0.25, cy - 126], [W * 0.75, cy - 78], [cx, cy + 126]] : [[W * 0.2, cy - 74], [W * 0.8, cy - 74], [cx, cy + 124]];
    pos.forEach((p, i) => {
      const q = pos[(i + 1) % 3], from = i === 0 && P ? 0.46 : i === 0 ? 0.3 : 0.2, to = i === 0 ? 0.72 : 0.8, a = [p[0] + (q[0] - p[0]) * from, p[1] + (q[1] - p[1]) * from], b = [p[0] + (q[0] - p[0]) * to, p[1] + (q[1] - p[1]) * to];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = mx - cx, ny = my - cy, len = Math.hypot(nx, ny) || 1, c = [mx + nx / len * (i === 0 ? 0 : 48), my + ny / len * (i === 0 ? 0 : 48)];
      const an = Math.atan2(b[1] - c[1], b[0] - c[0]), h = 18;
      s += `<path d="M${num(a[0])} ${num(a[1])}Q${num(c[0])} ${num(c[1])} ${num(b[0])} ${num(b[1])}" style="fill:none;stroke:${WHITE};stroke-width:7;stroke-linecap:round"/>`;
      s += `<path d="M${num(b[0] + Math.cos(an) * 4)} ${num(b[1] + Math.sin(an) * 4)}L${num(b[0] - Math.cos(an - 0.5) * h)} ${num(b[1] - Math.sin(an - 0.5) * h)}L${num(b[0] - Math.cos(an + 0.5) * h)} ${num(b[1] - Math.sin(an + 0.5) * h)}Z" style="fill:${WHITE}"/>`;
    });
    s += `<circle cx="${cx}" cy="${num(cy)}" r="${hub + 4}" style="fill:${SEA_INK}"/><circle cx="${cx}" cy="${num(cy)}" r="${hub}" style="fill:${sea('seaDeep')};stroke:${WHITE};stroke-width:4"/>`;
    s += tx(cx, cy - 2, 'Blue', { size: P ? 20 : 22, display: true, weight: 700, col: WHITE }) + tx(cx, cy + 24, 'Economy', { size: P ? 20 : 22, display: true, weight: 700, col: WHITE });
    PARTS.forEach((t, i) => { s += tag(pos[i][0], pos[i][1], t, { size: P ? 15 : 17, h: 42 }); });
    return s;
  }
  _card(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, c = CARDS[step], v = c[this.when], sy = 64;
    let s = skyRect('beC', 0, 0, W, sy + 4, 0, 4) + svgSeaColumn(0, sy, 1, { w: W, h: 86, bands: 2, wave: 3 }) + svgWaveLine(0, sy, 1, { w: W, amp: 3 });
    if (step === 1) s += svgCountryBoat(W * 0.5, sy + 2, 0.7, {}) + seaTx(W * 0.5, sy + 56, 'boats stay in harbour', { size: 15 });
    else s += svgTrawler(W * 0.3, sy + 2, 0.46, {}) + svgTrawler(W * 0.54, sy + 2, 0.46, {}) + svgTrawler(W * 0.78, sy + 2, 0.46, {});
    const y0 = sy + 92, cw = Math.min(W - 12, 520), cx = (W - cw) / 2, ch = H - y0 - 8;
    s += panel(cx, y0, cw, ch);
    s += tx(W / 2, y0 + 26, c.head, { size: P ? 17 : 19, display: true, weight: 700 }) + tx(W / 2, y0 + 49, c.sub, { size: 16, weight: 700, col: 'var(--sim-label-muted)' });
    PARTS.forEach((t, i) => {
      const ry = y0 + 66 + i * ((ch - 80) / 3), mid = cx + cw / 2, full = cw * 0.2, val = v[i], bar = (val / 2) * full, col = val >= 0 ? 'var(--sim-good)' : 'var(--sim-error)';
      s += tx(cx + 14, ry + 15, t, { size: 15, anchor: 'start' }) + tx(cx + cw - 14, ry + 15, WORD[val], { size: 15, anchor: 'end', col });
      s += `<rect x="${num(cx + 14)}" y="${num(ry + 22)}" width="${num(cw - 28)}" height="14" rx="7" style="fill:var(--sim-track)"/>`;
      s += `<rect x="${num(Math.min(mid, mid + bar))}" y="${num(ry + 22)}" width="${num(Math.abs(bar))}" height="14" style="fill:${col}"/><rect x="${num(mid - 1.5)}" y="${num(ry + 18)}" width="3" height="22" style="fill:var(--sim-label)"/>`;
    });
    return s;
  }
  _tower(st) {
    const W = st.W, H = st.H, P = st.portrait, sea0 = H - 44, tx0 = P ? 62 : 150, k = (sea0 - 44) / 150;
    let s = skyRect('beT', 0, 0, W, sea0 + 4, 0, 6) + svgSeaColumn(0, sea0, 1, { w: W, h: 44, bands: 2, wave: 3 }) + svgWaveLine(0, sea0, 1, { w: W, amp: 3 });
    s += `<path d="M${tx0 - 60} ${sea0 + 8}Q${tx0} ${sea0 - 30} ${tx0 + 60} ${sea0 + 8}Z" style="fill:${sea('rockMid')};stroke:${sea('rockDark')};stroke-width:3"/>`;
    s += svgLighthouse(tx0, sea0 - 10, k * 0.92, { lit: true });
    const top = 34, gap = (sea0 - 40 - top) / AIMS.length, lx = tx0 + (P ? 38 : 60), by = top + 8;
    s += `<path d="M${tx0 + 8} ${by + 8}L${W - 8} ${by - 18}V${by + 26}Z" style="fill:${sea('gold')};opacity:0.4"/>`;
    AIMS.forEach((a, i) => {
      const y = top + i * gap + 8;
      s += `<path d="M${tx0 + 12} ${num(y)}H${lx}" style="stroke:${SEA_INK};stroke-width:2.5"/>`;
      s += `<g class="sd-in" style="--d:${(i * 0.05).toFixed(2)}s">${tag(lx, y, a, { anchor: 'start', size: P ? 15 : 17, rim: i === 0 ? 'var(--sim-series-2)' : SEA_INK })}</g>`;
    });
    s += tag(W - 8, sea0 + 22, 'SDG 14: Life Below Water', { anchor: 'end', size: 15 });
    return s;
  }
  paint(st) {
    const step = this.stepIndex;
    return { svg: frame(st, step === 0 ? this._cycle(st) : step === 3 ? this._tower(st) : this._card(st)) };
  }
}
