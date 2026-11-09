// ElectionPetalScene - L01 s03, Fig 7.1. A wheel of six petals round the word Elections.
// b0 the hub with the right and the responsibility. b1 Accountability and Representation. b2 Equality and
// Legitimacy. b3 the two empty petals: the learner taps reasons; two reasons do not belong and say why.
import { SvgScene, mountEl } from 'simulations/base/kit/SimSvg.js';
import { esc } from 'simulations/base/SimUi.js';

const m = (idx) => [{ idx, dwellMs: null }];
const NAMED = [
  { id: 'rep', name: 'Representation', tone: 2, at: -90, beat: 1, line: 'Those elected speak and decide for the people who chose them.' },
  { id: 'equ', name: 'Equality', tone: 3, at: -30, beat: 2, line: 'Every citizen has one equal vote.' },
  { id: 'leg', name: 'Legitimacy', tone: 5, at: 150, beat: 2, line: 'People accept a government’s right to decide because they chose it.' },
  { id: 'acc', name: 'Accountability', tone: 1, at: 210, beat: 1, line: 'Those elected must answer to the people.' },
];
const SLOTS = [{ at: 30 }, { at: 90 }];
const REASONS = [
  { id: 'par', name: 'Participation', how: 'Every adult citizen can vote and take part.', ok: true },
  { id: 'cho', name: 'Choice', how: 'Voters can choose between candidates.', ok: true },
  { id: 'pea', name: 'Peaceful change', how: 'Power changes hands by votes, without violence.', ok: true },
  { id: 'deb', name: 'Public debate', how: 'Candidates must explain their plans to the people.', ok: true },
  { id: 'life', name: 'A ruler for life', how: 'Does not fit: elections end a term, and a ruler for life never faces a vote.' },
  { id: 'rich', name: 'A prize for the richest', how: 'Does not fit: every vote is equal, so money cannot decide who wins.' },
];
const rad = (d) => (d * Math.PI) / 180;
const pt = (cx, cy, r, d) => `${(cx + Math.cos(rad(d)) * r).toFixed(1)} ${(cy + Math.sin(rad(d)) * r).toFixed(1)}`;
function petal(cx, cy, r0, r1, a) {
  const p = 5, a0 = a + p, a1 = a + 60 - p;
  return `M${pt(cx, cy, r0, a0)} A${r0} ${r0} 0 0 1 ${pt(cx, cy, r0, a1)} L${pt(cx, cy, r1, a1)} A${r1} ${r1} 0 0 0 ${pt(cx, cy, r1, a0)} Z`;
}
const words = (s) => (s.length > 11 && s.includes(' ') ? s.split(' ') : [s]);

export class ElectionPetalScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static ARIA_LABEL = 'A wheel of six petals round the word Elections. The petals named are Accountability, Representation, Equality and Legitimacy. Two petals are empty. On the last step you tap reasons to fill them; two reasons do not fit and say why.';
  static HEIGHT = 530;
  static PORTRAIT_HEIGHT = 620;
  placed = [];
  msg = '';

  async setup() {
    await super.setup();
    this._foot = mountEl(this.root, 'ep-foot');
    this._foot.addEventListener('click', (e) => { const b = e.target.closest('[data-reason]'); if (b) this._tap(b.dataset.reason); });
    this._paintFoot();
  }

  css() { return `.ep-foot { display: none; }
.sim-dom-root[data-step="3"] .ep-foot { display: block; }
.ep-chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; padding-top: 6px; }
.sim-dom-root--portrait .ep-chips { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ep-chip { min-height: 50px; padding: 4px 8px; font: 800 15px/1.15 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); cursor: pointer;
  border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--look-pill); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.ep-chip[data-on="1"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 24%, var(--sim-bg-surface)); }
.ep-chip[data-no="1"] { border-color: var(--sim-bad); text-decoration: line-through; }
.ep-msg { margin: 6px 0 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label); text-align: center; }
.ep-n { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 700; fill: var(--sim-label); }
.ep-r { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 700; fill: var(--sim-label); }
.ep-l { font-family: var(--sim-font); font-weight: 700; fill: var(--sim-label); }`; }

  stageHeight(st) { return this.stepIndex === 3 ? (st.portrait ? 366 : 340) : (st.portrait ? 540 : 430); }

  enter() { this.placed = []; this.msg = ''; this._no = new Set(); this._paintFoot(); }

  _tap(id) {
    const r = REASONS.find((x) => x.id === id);
    if (!r) return;
    if (!r.ok) { this._no.add(id); this.msg = r.how; this._paintFoot(); return; }
    if (this.placed.includes(id)) this.placed = this.placed.filter((x) => x !== id);
    else if (this.placed.length < 2) this.placed.push(id);
    else { this.msg = 'Both petals are full. Tap a reason again to take it off.'; this._paintFoot(); return; }
    this.msg = r.how;
    const done = this.placed.length === 2;
    if (done) this.msg = `${REASONS.find((x) => x.id === this.placed[0]).how} ${REASONS.find((x) => x.id === this.placed[1]).how}`;
    this.repaint(); this._paintFoot();
    if (done && !this._found) { this._found = true; this.celebrate(); }
  }

  _paintFoot() {
    if (!this._foot) return;
    this._foot.innerHTML = `<div class="ep-chips">${REASONS.map((r) => `<button type="button" class="ep-chip" data-reason="${r.id}" data-on="${this.placed.includes(r.id) ? 1 : 0}" data-no="${this._no?.has(r.id) ? 1 : 0}">${esc(r.name)}</button>`).join('')}</div><p class="ep-msg" aria-live="polite">${esc(this.msg)}</p>`;
    this.relayout?.();
  }

  paint(st) {
    const P = st.portrait, W = st.W, b = this.stepIndex, tall = b !== 3;
    const R = Math.min(tall && P ? W / 2 - 6 : (st.H || 300) / 2 - 6, P ? W / 2 - 6 : 205), cx = tall && !P ? R + 8 : W / 2, cy = R + 6, r0 = R * 0.36;
    const fs = R > 170 ? 16 : 14;
    let s = '';
    const lit = (n) => n.beat === b;
    const sector = (at, fill, rim) => `<path d="${petal(cx, cy + 4, r0 + 4, R - 4, at)}" style="fill:${rim};stroke:${rim};stroke-width:8;stroke-linejoin:round"/><path d="${petal(cx, cy, r0 + 4, R - 4, at)}" style="fill:${fill};stroke:${rim};stroke-width:8;stroke-linejoin:round"/>`;
    const label = (text, at, cls) => {
      const mid = rad(at + 30), rr = (r0 + R) / 2 + 9, x = cx + Math.cos(mid) * rr, y = cy + Math.sin(mid) * rr, ws = words(text);
      return ws.map((w, i) => `<text class="${cls}" x="${x.toFixed(1)}" y="${(y + 5 + (i - (ws.length - 1) / 2) * (fs + 3)).toFixed(1)}" font-size="${fs}" text-anchor="middle">${esc(w)}</text>`).join('');
    };
    NAMED.forEach((n) => {
      const shown = b >= n.beat;
      const tone = `var(--sim-series-${n.tone})`;
      s += `<g opacity="${shown ? (lit(n) || b === 3 ? 1 : 0.62) : 1}">`;
      s += shown ? sector(n.at, `color-mix(in srgb,${tone} ${lit(n) ? 34 : 22}%,var(--sim-bg-surface))`, tone) : sector(n.at, 'var(--sim-bg-cell)', 'var(--sim-track)');
      if (shown) s += label(n.name, n.at, 'ep-n');
      s += '</g>';
    });
    SLOTS.forEach((sl, i) => {
      const id = this.placed[i], r = REASONS.find((x) => x.id === id);
      const showDash = b === 3 && !r;
      s += r ? sector(sl.at, 'color-mix(in srgb,var(--sim-good) 26%,var(--sim-bg-surface))', 'var(--sim-good)') : sector(sl.at, showDash ? 'color-mix(in srgb,var(--sim-gold) 16%,var(--sim-bg-surface))' : 'var(--sim-bg-surface)', showDash ? 'var(--sim-gold)' : 'var(--sim-track)');
      if (r) s += label(r.name, sl.at, 'ep-r');
    });
    s += `<circle cx="${cx}" cy="${cy + 4}" r="${r0}" style="fill:var(--sim-stroke)"/><circle cx="${cx}" cy="${cy}" r="${r0}" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:3"/>`;
    s += `<text class="ep-n" x="${cx}" y="${cy + 6}" font-size="${R > 170 ? 21 : 17}" text-anchor="middle">Elections</text>`;
    // what this beat says, beside the wheel in landscape and under it in portrait
    const cards = b === 0
      ? [{ name: 'A right', line: 'to elect our representatives and hold them accountable', tone: 'gold' }, { name: 'A responsibility', line: 'that we fulfil as citizens', tone: 'gold' }]
      : b === 3 ? [] : NAMED.filter(lit).sort((x, y) => (x.id === 'acc' || x.id === 'equ' ? -1 : 1));
    const col = (t) => (t === 'gold' ? 'var(--sim-gold)' : `var(--sim-series-${t})`);
    cards.forEach((n, i) => {
      const x = P ? 0 : cx + R + 16, w = P ? W : W - x, y = P ? cy + R + 16 + i * 92 : cy - 112 + i * 124, h = P ? 84 : 112;
      s += `<rect x="${x}" y="${y + 4}" width="${w}" height="${h}" rx="14" style="fill:${col(n.tone)}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" style="fill:var(--sim-bg-surface);stroke:${col(n.tone)};stroke-width:3"/>`;
      s += `<text class="ep-n" x="${x + 12}" y="${y + 25}" font-size="18">${esc(n.name)}</text>`;
      const lines = []; let l = ''; const max = Math.floor((w - 24) / 8.2);
      for (const wd of n.line.split(' ')) { if ((l + ' ' + wd).trim().length > max) { lines.push(l); l = wd; } else l = (l + ' ' + wd).trim(); } if (l) lines.push(l);
      lines.forEach((t, k) => { s += `<text class="ep-l" x="${x + 12}" y="${y + 47 + k * 19}" font-size="15">${esc(t)}</text>`; });
    });
    return { svg: s };
  }
}
