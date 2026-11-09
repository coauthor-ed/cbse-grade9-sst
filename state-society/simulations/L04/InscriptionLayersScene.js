// InscriptionLayersScene - L04 s05 (5 beats) and s07 (2 beats). A real boulder, three inscribed
// patches, the lake beside it, and a date strip spaced to scale. The lake's state comes from the
// beat. Words sit in chips off the rock. No face on the rock.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, pill, alpha, mulberry32, chipRow } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { pal, boulderPath, hut, person, tree, MAN, TAU } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_ROCK = 0, S_A = 1, S_R = 2, S_S = 3, S_ALL = 4, S_LAST = 5, S_FAR = 6;
const MAP5 = [m(S_ROCK), m(S_A), m(S_R), m(S_S), m(S_ALL)], MAP2 = [m(S_LAST), m(S_FAR)];
const CHIPS = [{ id: 'a', label: 'A\u015Bhoka', targets: ['a'], tone: 2 }, { id: 'r', label: 'Rudradaman I', targets: ['r'], tone: 3 }, { id: 's', label: 'Skandagupta', targets: ['s'], tone: 6 }];
const PATCH = { a: { x: 92, y: 88, w: 196, h: 92, tone: 's2', tag: 'Prakrit' }, r: { x: 84, y: 188, w: 150, h: 104, tone: 's3', tag: 'Sanskrit' }, s: { x: 244, y: 190, w: 96, h: 98, tone: 's6', tag: 'Sanskrit' } };
const LAKE = { x: 520, y: 232, rx: 138, ry: 72 };
const strip = (st) => {
  const on = (k) => st === S_ROCK ? false : st === S_LAST || st === S_ALL ? true : ({ a: S_A, r: S_R, s: S_S })[k] <= st;
  return {
    from: -320, to: 520,
    marks: [
      { id: 'a', at: -250, when: '3rd c. BCE', label: 'A\u015Bhoka', tone: 2, ghost: !on('a') },
      { id: 'r', at: 150, when: 'c. 150 CE', label: 'Rudradaman I', tone: 3, ghost: !on('r') },
      { id: 's', at: 455, when: '5th c. CE', label: 'Skandagupta', tone: 6, ghost: !on('s') },
    ],
    spans: st >= S_ALL || st === S_S ? [{ from: -250, to: 455, label: 'about 700 years', tone: 'accent' }] : [],
  };
};

export class InscriptionLayersScene extends SimScene {
  static BEAT_STEP_MAP = MAP5;
  static BEAT_MAPS = { 5: MAP5, 2: MAP2 };
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A large rock with three inscribed patches beside the Sudarshana Lake, and a date strip spaced to scale under it: Ashoka in the 3rd century BCE, Rudradaman I about 150 CE, Skandagupta in the 5th century CE. The lake is repaired and later restored. A last view shows a capital far from a village.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Ruler', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== S_ALL; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  enter() { this.tl.reset(); }

  _patch(ctx, c, k, on, off) {
    const P = PATCH[k], p = pal(c), r = mulberry32(k.charCodeAt(0));
    ctx.save(); if (off) ctx.globalAlpha = 0.3;
    rr(ctx, P.x, P.y, P.w, P.h, 8); ctx.fillStyle = on ? mix(p.stoneLight, c[P.tone], 0.38) : alpha(p.stoneDark, 0.16); ctx.fill();
    if (on) { ctx.lineWidth = 4; ctx.strokeStyle = c[P.tone]; ctx.stroke(); }
    ctx.fillStyle = on ? p.ink : alpha(p.ink, 0.42);
    for (let row = 0; row < 5; row++) {
      let x = P.x + 10; const y = P.y + 12 + row * ((P.h - 18) / 5);
      while (x < P.x + P.w - 14) {
        const f = r();
        if (k === 'a') { ctx.fillRect(x, y, 3, 10); if (f > 0.5) ctx.fillRect(x + 3, y + (f > 0.75 ? 0 : 7), 6, 3); x += 13; } else { ctx.fillRect(x, y, 8 + f * 8, 3); ctx.fillRect(x + 3, y, 3, 8); x += 18 + f * 4; }
      }
    }
    ctx.restore();
  }

  _rock(ctx, c, lit) {
    const p = pal(c);
    ctx.save(); boulderPath(ctx, 196, 196, 178, 150, 12); ctx.fillStyle = p.stoneDark; ctx.translate(0, 8); ctx.fill(); ctx.restore();
    boulderPath(ctx, 196, 196, 178, 150, 12); ctx.fillStyle = p.stone; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = p.stoneDark; ctx.stroke();
    ctx.save(); boulderPath(ctx, 196, 196, 178, 150, 12); ctx.clip();
    ctx.fillStyle = alpha(p.stoneLight, 0.55); ctx.beginPath(); ctx.ellipse(130, 90, 150, 70, -0.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = alpha(p.stoneDark, 0.5); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(30, 310); ctx.quadraticCurveTo(110, 300, 170, 330); ctx.moveTo(300, 60); ctx.quadraticCurveTo(330, 110, 350, 120); ctx.stroke();
    ctx.restore();
    const st = this.stage;
    for (const k of ['a', 'r', 's']) {
      const reached = st === S_LAST || st === S_ALL ? true : ({ a: S_A, r: S_R, s: S_S })[k] <= st;
      this._patch(ctx, c, k, reached && (!lit || lit === k), lit && lit !== k);
    }
  }

  _lake(ctx, c, state) {
    const p = pal(c), L = LAKE;
    ctx.beginPath(); ctx.ellipse(L.x, L.y + 12, L.rx + 8, L.ry + 8, 0, 0, TAU); ctx.fillStyle = p.grass; ctx.fill();
    ctx.beginPath(); ctx.ellipse(L.x, L.y, L.rx, state === 'low' ? L.ry * 0.45 : L.ry, 0, 0, TAU); ctx.fillStyle = state === 'low' ? mix(p.water, p.sand, 0.6) : p.water; ctx.fill();
    ctx.lineCap = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = state === 'low' ? p.stoneLight : p.stone;
    ctx.beginPath(); ctx.moveTo(L.x - L.rx + 14, L.y + L.ry + 6); ctx.quadraticCurveTo(L.x, L.y + L.ry + 26, L.x + L.rx - 14, L.y + L.ry + 6); ctx.stroke();
    if (state === 'repaired') { ctx.lineWidth = 16; ctx.strokeStyle = c.gold; ctx.beginPath(); ctx.moveTo(L.x - 34, L.y + L.ry + 16); ctx.quadraticCurveTo(L.x, L.y + L.ry + 22, L.x + 34, L.y + L.ry + 16); ctx.stroke(); }
    if (state === 'low') { ctx.strokeStyle = c.bad; ctx.lineWidth = 5; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(L.x - 20, L.y + L.ry + 2); ctx.lineTo(L.x + 4, L.y + L.ry + 16); ctx.lineTo(L.x - 8, L.y + L.ry + 28); ctx.stroke(); }
  }

  _far(ctx, c) {
    const p = pal(c);
    rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = p.grass; ctx.fill();
    ctx.setLineDash([20, 14]); ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.strokeStyle = p.sand;
    ctx.beginPath(); ctx.moveTo(150, 170); ctx.bezierCurveTo(330, 150, 240, 360, 520, 400); ctx.stroke(); ctx.setLineDash([]);
    rr(ctx, 54, 70, 190, 110, 6); ctx.fillStyle = p.stone; ctx.fill();
    for (let k = 0; k < 5; k++) { ctx.fillStyle = p.stone; ctx.fillRect(54 + k * 41, 50, 26, 24); }
    tree(ctx, c, 420, 200, 1.3, 3); tree(ctx, c, 120, 420, 1.4, 6);
    hut(ctx, c, 520, 430, 1.4); hut(ctx, c, 610, 400, 1.2);
    person(ctx, this, { role: 'farmer', x: 590, y: 494, height: 150, i: 4, look: MAN, facing: -1 });
    pill(ctx, c, 'capital', 150, 214, { size: 28, bg: c.gold, display: true });
    pill(ctx, c, 'a far village', 500, 300, { size: 28, bg: c.s3, display: true });
    pill(ctx, c, 'How does a decision get here?', 340, 62, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
  }

  draw(ctx, c) {
    const st = this.stage, p = pal(c);
    drawBackdrop(ctx, c, 'dots');
    if (st === S_FAR) { this._far(ctx, c); drawVignette(ctx, c, 0.28); return; }
    rr(ctx, 6, 6, 668, 356, 18); ctx.fillStyle = mix(c.bgSurface, c.s3, 0.12); ctx.fill();
    const lit = st === S_ALL ? this.tl.locked() : null;
    this._lake(ctx, c, st === S_S ? 'repaired' : st === S_R ? 'repaired' : st === S_ROCK || st === S_A ? 'whole' : 'whole');
    this._rock(ctx, c, lit);
    if (st === S_R) { pill(ctx, c, 'Sudarshana Lake', 520, 94, { size: 28, bg: c.s1, display: true }); pill(ctx, c, 'repaired', 520, 142, { size: 28, bg: c.gold, display: true }); }
    if (st === S_S) { pill(ctx, c, 'restored after damage', 500, 94, { size: 28, bg: c.gold, display: true }); }
    if (st === S_A) pill(ctx, c, 'Dhamma', 520, 120, { size: 30, bg: c.s2, display: true });
    if (st === S_ROCK) pill(ctx, c, 'near Girnar, Gujarat', 512, 76, { size: 28, bg: c.gold, display: true });
    if (st === S_LAST) chipRow(ctx, c, [{ text: 'administration', bg: c.s2 }, { text: 'public works', bg: c.s1 }, { text: 'politics', bg: c.s5 }], 512, 76, { size: 28, display: true, gap: 6, align: 'center', wrapAt: 300 });
    rr(ctx, 6, 366, 668, 150, 16); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c.stroke; ctx.stroke();
    drawDateStrip(ctx, c, strip(st), { x: 30, y: 376, w: 620, size: 28, lit: lit ? [lit] : null });
  }
}
