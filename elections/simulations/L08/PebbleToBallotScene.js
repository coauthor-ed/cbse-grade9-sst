// PebbleToBallotScene - L08 s06. One big object a beat: pebble, paper, EVM, Braille, VVPAT. A strip shows
// where we are. No "same mechanism". On EVM marks are plain shapes. The VVPAT slip shows behind glass,
// then drops into a sealed box.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, folk, pop, label, tile, say, rr, mix, ellipse, mark, hi } from '../L06/PartyWorld.js';

const NAMES = ['Pebble', 'Paper', 'EVM', 'Braille', 'VVPAT'];
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const SEEDS = [[250, 290, 40], [330, 310, 46], [410, 285, 38], [290, 245, 34], [375, 240, 36], [335, 200, 30]];

export class PebbleToBallotScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS = [];
  static ARIA_LABEL = 'Five big objects, one a beat: a pile of pebbles, a marked ballot paper and box, an EVM with buttons, Braille numbers beside a button, and a VVPAT slip behind a small window that drops into a sealed box.';
  busy() { return this.age < (this.stage === 4 ? 3.2 : 1); }

  _strip(ctx, c) {
    NAMES.forEach((n, i) => {
      const x = 12 + i * 133, on = i === this.stage;
      ctx.save(); ctx.globalAlpha *= on ? 1 : i < this.stage ? 0.8 : 0.5;
      ctx.fillStyle = on ? hi(c) : c.bgSurface; rr(ctx, x, 396, 124, 50, 10); ctx.fill();
      ctx.strokeStyle = on ? c.accent : c.stroke; ctx.lineWidth = on ? 4 : 2.5; ctx.stroke();
      say(ctx, c, n, x + 62, 421, { size: 25 });
      ctx.restore();
    });
  }

  _unit(ctx, c, x, y, w, rowsN, braille) {
    const t = tones(c), rh = 74;
    ctx.fillStyle = mix(t.grey, c.bgSurface, 0.15); rr(ctx, x, y, w, rowsN * rh + 24, 12); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.stroke();
    ['circle', 'triangle', 'square'].slice(0, rowsN).forEach((m, i) => {
      const yy = y + 12 + i * rh;
      ctx.fillStyle = c.bgSurface; rr(ctx, x + 12, yy, w - 24, rh - 8, 6); ctx.fill();
      say(ctx, c, 'Candidate ' + (i + 1), x + 26, yy + 32, { size: 26, align: 'left', display: false, weight: 800 });
      mark(ctx, c, m, x + w - 150, yy + 33, 17, { lw: 4 });
      ctx.fillStyle = i === 1 ? c.water : mix(c.water, c.bgDeep ?? c.label, 0.4); ellipse(ctx, x + w - 62, yy + 33, 22, 22); ctx.fill();
      if (braille) { ctx.fillStyle = c.label; [[0, 0], [0, 12], [10, 6]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(x + w - 110 + dx, yy + 26 + dy, 3.5, 0, 7); ctx.fill(); }); }
    });
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    day(ctx, c, 680, 456, { ground: 330, sun: false });
    if (s === 0) {
      SEEDS.forEach(([x, y, r], i) => {
        const k = pop(a, 0.06 * i);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        ctx.fillStyle = i % 2 ? t.rock : t.rockDark; ellipse(ctx, x, y + 50, r * 1.25, r * 0.9); ctx.fill();
        ctx.fillStyle = mix(t.rock, c.bgSurface, 0.4); ellipse(ctx, x - r * 0.3, y + 50 - r * 0.3, r * 0.4, r * 0.22); ctx.fill();
        ctx.restore();
      });
      label(ctx, c, 'Ancient Greece', 340, 52, { size: 30 });
    } else if (s === 1) {
      tile(ctx, c, 90, 30, 260, 340, { fill: c.bgSurface, r: 8 });
      ['circle', 'triangle', 'square'].forEach((m, i) => {
        const y = 66 + i * 100;
        say(ctx, c, 'Candidate ' + (i + 1), 112, y + 28, { size: 25, align: 'left', display: false, weight: 800 });
        mark(ctx, c, m, 278, y + 28, 13, { lw: 4 });
        ctx.fillStyle = c.stroke; ctx.fillRect(108, y + 74, 224, 3);
      });
      ctx.strokeStyle = c.label; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(310, 180); ctx.lineTo(334, 204); ctx.moveTo(334, 180); ctx.lineTo(310, 204); ctx.stroke();
      drawCivic(ctx, c, 'ballotBox', 500, 372, { h: 240 });
    } else if (s === 2) {
      this._unit(ctx, c, 150, 40, 380, 3, false);
      folk(ctx, this, { role: 'voter', x: 76, y: 386, height: 230, facing: 1, i: 4 });
      label(ctx, c, 'Press, and it beeps', 340, 310, { size: 30, bg: hi(c), ink: c.label, scale: pop(a, 0.3) });
    } else if (s === 3) {
      ctx.fillStyle = mix(t.grey, c.bgSurface, 0.15); rr(ctx, 60, 30, 560, 340, 18); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = c.bgSurface; rr(ctx, 84, 60, 512, 280, 12); ctx.fill();
      ctx.fillStyle = c.label; [[0, 0], [0, 52], [36, 26]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(170 + dx, 158 + dy, 18, 0, 7); ctx.fill(); });
      ctx.fillStyle = c.water; ellipse(ctx, 450, 184, 96, 96); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 4; ctx.stroke();
      label(ctx, c, 'Raised Braille number', 210, 298, { size: 26 });
      label(ctx, c, 'Button', 450, 310, { size: 26 });
    } else {
      ctx.fillStyle = mix(t.grey, c.bgSurface, 0.25); rr(ctx, 180, 18, 320, 364, 16); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = mix(c.water, c.bgSurface, 0.72); rr(ctx, 224, 44, 232, 170, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = t.greyDark; rr(ctx, 204, 268, 272, 92, 10); ctx.fill();
      const u = Math.min(1, Math.max(0, (a - 1.8) / 0.8)), y = 60 + u * 230;
      ctx.save(); ctx.beginPath(); ctx.rect(224, 44, 232, 310); ctx.clip();
      {
        ctx.fillStyle = c.bgSurface; rr(ctx, 262, y, 156, 138, 4); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 2.5; ctx.stroke();
        if (u < 1) { say(ctx, c, 'Candidate 2', 340, y + 42, { size: 25, display: false, weight: 800 }); mark(ctx, c, 'triangle', 340, y + 96, 22, { lw: 4 }); }
      }
      ctx.restore();
      label(ctx, c, 'Small window', 340, 240, { size: 25 });
      if (u < 1) say(ctx, c, 'Sealed box', 340, 316, { size: 30, col: c.bgSurface }); else label(ctx, c, 'In the sealed box', 340, 322, { size: 26 });
      label(ctx, c, 'A few seconds', 96, 130, { size: 24, bg: hi(c), ink: c.label });
    }
    this._strip(ctx, c);
  }
}
