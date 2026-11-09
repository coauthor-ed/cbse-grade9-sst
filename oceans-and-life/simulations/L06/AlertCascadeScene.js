// AlertCascadeScene - the book's route for an alert, and only that. 0 ITEWC, Government of India, state
// governments and emergency response teams. 1 the four channels that reach people. 2 training: people who
// know what a warning means. Tap Send to run the alert down the levels.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, btn, bindActs, tween, windArrow } from '../L04/SeaDraw.js';
import { svgSatellite, svgHut } from '../shared/SeaArt.js';
import { shelterSvg } from '../L05/CoastSection.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const CHANNELS = [['Satellite networks', 'sat'], ['SMS', 'sms'], ['Emails', 'mail'], ['Coastal boards', 'board']];

export class AlertCascadeScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'ITEWC sends alerts to the Government of India, which informs state governments and emergency response teams. Satellite networks, SMS, emails and coastal display boards carry the message. Trained people know how to respond.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 440 : 420; }
  async setup() {
    this._p = 1;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'send') { this._halt?.(); this._going = true; this._p = 0; this._halt = tween(1800, (p) => { this._p = p; this.repaint(); }, () => { this._going = false; this.repaint(); }); } });
    this.repaint();
  }
  destroy() { this._halt?.(); this._off?.(); super.destroy(); }
  enter() { this._halt?.(); this._going = false; this._p = 1; }
  _icon(kind, x, y) {
    if (kind === 'sat') return svgSatellite(x, y, 0.3, {});
    if (kind === 'sms') return `<rect x="${x - 13}" y="${y - 22}" width="26" height="44" rx="5" style="fill:${sky('white')};stroke:${sky('ink')};stroke-width:2.5"/><rect x="${x - 8}" y="${y - 14}" width="16" height="10" rx="3" style="fill:${sky('sun')}"/>`;
    if (kind === 'mail') return `<rect x="${x - 20}" y="${y - 14}" width="40" height="28" rx="3" style="fill:${sky('white')};stroke:${sky('ink')};stroke-width:2.5"/><path d="M${x - 20} ${y - 14}L${x} ${y + 3}L${x + 20} ${y - 14}" style="fill:none;stroke:${sky('ink')};stroke-width:2.5"/>`;
    return `<path d="M${x - 10} ${y + 22}v-16M${x + 10} ${y + 22}v-16" style="stroke:${sky('ink')};stroke-width:4"/><rect x="${x - 22}" y="${y - 22}" width="44" height="28" rx="3" style="fill:${sky('hullDark')};stroke:${sky('ink')};stroke-width:2.5"/><path d="M${x - 14} ${y - 13}h28M${x - 14} ${y - 4}h20" style="stroke:${sky('sun')};stroke-width:3"/>`;
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('sky')}"/><path d="M0 ${H - 70}Q${W * 0.4} ${H - 92} ${W} ${H - 74}V${H - 10}Q${W} ${H} ${W - 18} ${H}H18Q0 ${H} 0 ${H - 18}Z" style="fill:${sky('sand')};stroke:${sky('sandDark')};stroke-width:3"/>`;
    s += svgHut(W * 0.14, H - 72, 0.5, {}) + (step === 2 ? shelterSvg(W * 0.86, H - 74, 0.9) : svgHut(W * 0.86, H - 74, 0.46, {}));
    if (step === 0) {
      const bh = 64, bw = Math.min(W - 40, 340), x = (W - bw) / 2, t = 16, gap = (H - 110 - t - bh * 3) / 2;
      const box = (bx, y, w, lines, on) => panel(bx, y, w, bh, { r: 12, col: on ? 'var(--sim-bg-surface)' : 'var(--sim-bg-deep)' }) + lines.map((l, i) => tx(bx + w / 2, y + bh / 2 + 6 + (i - (lines.length - 1) / 2) * 21, l, { size: 17, display: true, weight: 700, op: on ? 1 : 0.5 })).join('');
      s += box(x, t, bw, ['ITEWC'], true) + windArrow([[W / 2, t + bh + 5], [W / 2, t + bh + gap - 1]], { w: 6, col: sky('sun'), rim: sky('ink') });
      const y2 = t + bh + gap, y3 = y2 + bh + gap, sw = (W - 34) / 2;
      s += box(x, y2, bw, ['Government of India'], this._p >= 0.33);
      s += windArrow([[W / 2 - 30, y2 + bh + 5], [12 + sw / 2, y3 - 1]], { w: 6, col: sky('sun'), rim: sky('ink') }) + windArrow([[W / 2 + 30, y2 + bh + 5], [W - 12 - sw / 2, y3 - 1]], { w: 6, col: sky('sun'), rim: sky('ink') });
      s += box(12, y3, sw, ['State', 'governments'], this._p >= 0.66) + box(W - 12 - sw, y3, sw, ['Emergency', 'response teams'], this._p >= 0.66);
    } else if (step === 1) {
      const cols = port ? 2 : 4, cw = (W - 20) / cols, ch = port ? 150 : 200;
      CHANNELS.forEach(([name, k], i) => {
        const x = 10 + cw * (i % cols), y = 14 + (ch + 8) * Math.floor(i / cols), on = this._p >= i / 4;
        s += panel(x + 4, y, cw - 8, ch, { r: 12, op: on ? 1 : 0.4 }) + this._icon(k, x + cw / 2, y + ch * 0.42) + tx(x + cw / 2, y + ch - 18, name, { size: 15 });
      });
    } else {
      const w = Math.min(W - 30, 340), x = (W - w) / 2;
      s += panel(x, 24, w, 170, { r: 14 });
      s += tx(W / 2, 62, 'Public awareness', { size: 20, display: true, weight: 700 }) + tx(W / 2, 92, 'and training', { size: 20, display: true, weight: 700 });
      s += tx(W / 2, 134, 'Officials and coastal people', { size: 16 }) + tx(W / 2, 158, 'learn to interpret warnings', { size: 16 });
      s += windArrow([[W * 0.28, H - 96], [W * 0.68, H - 106]], { w: 8, col: sky('grassLit'), rim: sky('ink'), curve: false });
      s += tx(W / 2, H - 128, 'they know how to respond', { size: 15, col: sky('ink'), halo: sky('cloud') });
    }
    const over = step < 2 ? btn(W / 2, H - 34, 'Send the alert', 'send', { disabled: this._going }) : '';
    return { svg: s, over };
  }
}
