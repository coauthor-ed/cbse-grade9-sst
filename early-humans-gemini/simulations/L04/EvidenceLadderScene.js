/**
 * EvidenceLadderScene - blk-l04-s06. A real ladder of three rungs: tool, bead, painting. Each rung says what the
 * find lets you claim and where it stops. The top is "what it meant: unknown", drawn as a gap, never filled in.
 * Beats: 0 beads and marks, 1 the painted scenes repeat, 2 hours of work, 3 the whole ladder.
 */
import { SvgScene, fill, stroke, shade, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { at, text, STONE, WOOD, BONE } from '../shared/StoneAgeArt.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const RED = 'color-mix(in srgb, var(--sim-series-6) 72%, var(--sim-strata-3))';

const RUNGS = [
  { id: 'tool', name: 'A stone tool', yes: 'they made this and used it', no: 'not who used it' },
  { id: 'bead', name: 'A bead', yes: 'they made ornaments', no: 'not what it meant to the wearer' },
  { id: 'paint', name: 'A painting', yes: 'they painted these scenes', no: 'not what the scenes meant' },
];
const LIT = [['bead'], ['paint'], ['paint'], ['tool', 'bead', 'paint']];
const READING = ['Signs need a shared meaning', 'The same scenes, again and again', 'Hours of work: time to spare?', 'Each rung stops somewhere'];

function toolPic() {
  return `<path d="M-30 26 Q-38 -10 0 -34 Q38 -10 30 26 Q0 38 -30 26 Z" ${fill(STONE, `stroke:${shade(STONE, 60)};stroke-width:3.5;stroke-linejoin:round`)}/>`
    + `<path d="M-14 -8 L0 -20 L8 -2 L-6 8 Z M10 6 L20 18 L4 22 Z" ${fill(shade(STONE, 82))}/>`;
}
function beadPic() {
  const b = [[-34, 6], [-17, 14], [0, 17], [17, 14], [34, 6]];
  return `<path d="M-40 -22 Q0 44 40 -22" ${stroke(WOOD, 3)}/>` + b.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" ${fill(BONE, `stroke:${shade(BONE, 60)};stroke-width:3`)}/><circle cx="${x}" cy="${y}" r="3" ${fill(shade(BONE, 45))}/>`).join('');
}
const stick = (x, y, s = 1) => at(x, y, s, `<g ${stroke(RED, 4)} ><circle cx="0" cy="-20" r="5" ${fill(RED)}/><path d="M0 -14 V4 M0 4 L-8 20 M0 4 L8 20 M0 -8 L-12 2 M0 -8 L14 -14"/><path d="M14 -24 L14 -2" /></g>`);
function panelPic(n = 1) {
  const rock = 'color-mix(in srgb, var(--sim-strata-3) 45%, var(--sim-bg-surface))';
  let s = '';
  for (let i = 0; i < n; i += 1) {
    const dx = (i - (n - 1) / 2) * 74;
    s += `<path d="M${dx - 34} 28 L${dx - 37} -24 Q${dx} -34 ${dx + 36} -25 L${dx + 34} 28 Q${dx} 34 ${dx - 34} 28 Z" ${fill(rock, `stroke:${shade(rock, 64)};stroke-width:3`)}/>`;
    s += stick(dx - 14, 8, 0.8) + stick(dx + 14, 8, 0.8);
  }
  return s;
}

export class EvidenceLadderScene extends SvgScene {
  static simId = 'evidence-ladder-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'A ladder with three rungs. Bottom rung, a stone tool: they made this and used it, but not who used it. Middle rung, a bead: they made ornaments, but not what it meant. Top rung, a painting: they painted these scenes, but not what the scenes meant. Above the ladder is a gap marked unknown.';

  constructor(container, config) { super(container, config); this._fresh = true; }

  css() {
    return `
.el-pop { animation: el-pop 0.5s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); transform-box: fill-box; transform-origin: center; }
@keyframes el-pop { from { opacity: 0; transform: translateY(14px) scale(0.92); } to { opacity: 1; transform: none; } }
`;
  }

  enter() { this._fresh = true; }

  stageHeight(st) { return st.portrait ? 520 : 440; }

  paint(st) {
    const P = st.portrait, step = this.stepIndex, lit = LIT[step];
    const railL = P ? 16 : 40, railR = P ? 62 : 118, top = 58, bot = st.H - 40;
    const rowH = (bot - top) / 3;
    const cardX = railR + (P ? 12 : 26), cardW = st.W - cardX - (P ? 6 : 14);
    let s = '';
    // the top: a gap, not a card
    s += `<rect x="${cardX}" y="6" width="${cardW}" height="40" rx="12" style="fill:none;stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:8 8"/>`;
    s += text(cardX + cardW / 2, 33, 'what it meant: unknown', { size: P ? 17 : 20, weight: 600, display: true, col: 'var(--sim-label-muted)' });
    // rails and rungs
    for (const x of [railL, railR]) s += `<rect x="${x}" y="${top - 46}" width="12" height="${bot - top + 46}" rx="6" ${fill(WOOD, `stroke:${shade(WOOD, 60)};stroke-width:3`)}/>`;
    RUNGS.forEach((r, i) => {
      const y = bot - rowH * (i + 1) + 8, h = rowH - 12, on = lit.includes(r.id), o = on ? 1 : 0.24;
      const yes = step === 2 && r.id === 'paint' ? 'hours of grinding and painting' : r.yes, no = step === 2 && r.id === 'paint' ? 'not who fed the painters' : r.no;
      const showNo = step >= 2 && on;
      const cy = y + h / 2;
      let g = `<rect x="${railL + 6}" y="${cy - 7}" width="${railR - railL}" height="14" rx="7" ${fill(WOOD, `stroke:${shade(WOOD, 60)};stroke-width:3`)}/>`;
      g += cushionRect(cardX, y, cardW, h, 14, 'var(--sim-panel)');
      g += `<rect x="${cardX}" y="${y}" width="${cardW}" height="${h}" rx="14" ${stroke(on ? 'var(--sim-accent)' : 'var(--sim-stroke)', on ? 3 : 2)}/>`;
      const picS = P ? 0.8 : 1, picX = cardX + (P ? 46 : 62);
      const pic = r.id === 'tool' ? toolPic() : r.id === 'bead' ? beadPic() : panelPic(step === 1 && !P ? 2 : 1);
      g += at(step === 1 && r.id === 'paint' && !P ? picX + 34 : picX, cy, picS, pic);
      const tx = cardX + (P ? 92 : (step === 1 && r.id === 'paint' ? 190 : 128));
      if (P) {
        g += text(tx, cy - 24, r.name, { anchor: 'start', size: 17, weight: 600, display: true });
        const split = (t, n) => (t.length > n ? [t.slice(0, t.lastIndexOf(' ', n)), t.slice(t.lastIndexOf(' ', n) + 1)] : [t]);
        const w1 = split(yes, 22);
        w1.forEach((t, k) => { g += text(tx, cy - 4 + k * 18, t, { anchor: 'start', size: 15 }); });
        if (showNo) { const w2 = split(no, 21); w2.forEach((t, k) => { g += text(tx, cy + 16 + (w1.length - 1) * 18 + k * 17, t, { anchor: 'start', size: 14, col: 'var(--sim-bad)' }); }); }
      } else {
        g += text(tx, cy - 22, r.name, { anchor: 'start', size: 20, weight: 600, display: true });
        g += text(tx, cy + 4, yes, { anchor: 'start', size: 17 });
        if (showNo) g += text(tx, cy + 28, no, { anchor: 'start', size: 16, col: 'var(--sim-bad)' });
      }
      s += `<g style="opacity:${o}"${this._fresh && on ? ` class="el-pop"` : ''}>${g}</g>`;
    });
    s += text(cardX + cardW / 2, st.H - 8, READING[step], { size: P ? 17 : 20, weight: 600, display: true });
    this._fresh = false;
    return { svg: s, over: '' };
  }
}
