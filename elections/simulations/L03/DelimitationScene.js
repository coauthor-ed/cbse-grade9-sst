// DelimitationScene - L03 s01. A hill seat and a city seat from above, one MP each, with one glyph per lakh of
// people under each MP. b0 the seats. b1 the learner drags the boundary; the sums stay true; 15 and 15 is the find.
// b2 back at rest. Steps 3 to 7 are the -setup and -answer mounts: the word delimitation appears only on those.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, rr, darken, clamp, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { drawPersonGlyph } from 'simulations/base/kit/SimFigure.js';
import { who, tag } from '../shared/DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const MAP = { x: 14, y: 72, w: 652, h: 214 };
const HILL_W = 204, CITY_X = MAP.x + HILL_W, CITY_W = MAP.w - HILL_W;
const LAKH_PX = CITY_W / 25;                    // the city has 25 lakh people, spread evenly along the map
const EQUAL = 10;                               // lakh moved for 15 and 15

const R = mulberry32(11);
const HOUSES = Array.from({ length: 150 }, (_, i) => ({ x: CITY_X + 8 + (i % 25) * (CITY_W - 12) / 25 + R() * 4, y: MAP.y + 6 + (i % 6) * 34 + R() * 8, t: Math.floor(R() * 3) }));
const VILLAGES = [[52, 118], [130, 96], [94, 186], [172, 158], [46, 244], [158, 248]].map(([x, y]) => ({ x, y }));
const PEAKS = [[40, 180, 70], [110, 170, 90], [172, 196, 66], [76, 262, 56], [150, 276, 60]];

export class DelimitationScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static ARIA_LABEL = 'A hill seat with 5 lakh people and a city seat with 25 lakh people, seen from above, with one MP each. On the second step you drag the boundary into the city: the two numbers change and always add up to 30 lakh.';
  moved = 0;
  grab = false;
  hits = false;

  enter() { this.moved = 0; this.grab = false; }
  busy() { return this.grab || this.age < 1.4; }
  _shift() { return this.moved; }

  pointerDown(p) { if (this.stage !== 1 || Math.abs(p.x - this._lx()) > 60 || p.y < MAP.y - 10 || p.y > MAP.y + MAP.h + 10) return; this.grab = true; }
  pointerMove(p) {
    if (!this.grab) return false;
    const v = clamp(Math.round((p.x - CITY_X) / LAKH_PX), 0, 16);
    if (v !== this.moved) {
      this.moved = v;
      if (v === EQUAL && !this.hits) { this.hits = true; this.celebrate(this._lx(), MAP.y + MAP.h / 2, 12, { key: 'equal' }); }
    }
    return false;
  }
  pointerUp() { this.grab = false; }
  _lx() { return CITY_X + this._shift() * LAKH_PX; }

  _map(ctx, c, lx) {
    ctx.save(); rr(ctx, MAP.x, MAP.y, MAP.w, MAP.h, 16); ctx.clip();
    ctx.fillStyle = mix(c.bgSurface, c.s3, 0.34); ctx.fillRect(MAP.x, MAP.y, HILL_W, MAP.h);
    ctx.fillStyle = mix(c.bgSurface, c.s8, 0.3); ctx.fillRect(CITY_X, MAP.y, CITY_W, MAP.h);
    PEAKS.forEach(([x, y, w]) => { ctx.fillStyle = mix(c.s3, c.label, 0.2); ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x, y - w * 0.95, x + w / 2, y); ctx.closePath(); ctx.fill(); ctx.fillStyle = mix(c.s3, c.bgSurface, 0.3); ctx.beginPath(); ctx.moveTo(x - w * 0.26, y - w * 0.22); ctx.quadraticCurveTo(x, y - w * 0.8, x + w * 0.1, y - w * 0.3); ctx.closePath(); ctx.fill(); });
    VILLAGES.forEach((v) => [[0, 0], [14, 7], [-11, 9]].forEach(([dx, dy]) => { ctx.fillStyle = mix(c.gold, c.bgSurface, 0.2); ctx.fillRect(v.x + dx, v.y + dy, 11, 9); ctx.fillStyle = darken(c.s6, 0.1); ctx.beginPath(); ctx.moveTo(v.x + dx - 2, v.y + dy); ctx.lineTo(v.x + dx + 5.5, v.y + dy - 6); ctx.lineTo(v.x + dx + 13, v.y + dy); ctx.fill(); }));
    ctx.fillStyle = mix(c.bgSurface, c.label, 0.14);
    for (let i = 0; i < 6; i++) ctx.fillRect(CITY_X, MAP.y + 2 + i * 35.5, CITY_W, 3);
    HOUSES.forEach((h) => { ctx.fillStyle = mix([c.s1, c.s5, c.s2][h.t], c.bgSurface, 0.42); ctx.fillRect(h.x, h.y, 13, 21); ctx.fillStyle = mix([c.s1, c.s5, c.s2][h.t], c.label, 0.15); ctx.fillRect(h.x, h.y, 13, 5); });
    ctx.fillStyle = mix(c.s3, c.bgSurface, 0.82); ctx.globalAlpha = 0.34; ctx.fillRect(CITY_X, MAP.y, lx - CITY_X, MAP.h);
    ctx.restore();
    ctx.lineWidth = 3.5; ctx.strokeStyle = c.stroke; rr(ctx, MAP.x, MAP.y, MAP.w, MAP.h, 16); ctx.stroke();
  }

  _line(ctx, c, lx, handle) {
    ctx.save(); ctx.strokeStyle = c.label; ctx.lineWidth = 6; ctx.setLineDash([16, 10]); ctx.beginPath(); ctx.moveTo(lx, MAP.y); ctx.lineTo(lx, MAP.y + MAP.h); ctx.stroke(); ctx.restore();
    if (!handle) return;
    const y = MAP.y + MAP.h / 2;
    ctx.beginPath(); ctx.arc(lx, y + 4, 42, 0, 7); ctx.fillStyle = darken(c.gold, 0.25); ctx.fill();
    ctx.beginPath(); ctx.arc(lx, y, 42, 0, 7); ctx.fillStyle = c.gold; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.label; ctx.stroke();
    ctx.fillStyle = c.label; [-1, 1].forEach((d) => { ctx.beginPath(); ctx.moveTo(lx + d * 28, y); ctx.lineTo(lx + d * 8, y - 16); ctx.lineTo(lx + d * 8, y + 16); ctx.closePath(); ctx.fill(); });
  }

  _people(ctx, c, x0, w, n, tone) {
    const cols = Math.min(n, Math.max(5, Math.ceil(n / 2))), gap = Math.min(26, (w + 8) / cols);
    for (let i = 0; i < n; i++) drawPersonGlyph(ctx, c, x0 + (i % cols) * gap + 10, 396 + Math.floor(i / cols) * 44, 28, { col: tone });
  }

  /** The two seats with their readouts and people. hill: lakh in the hill seat. */
  seats(ctx, c, lx, hill, name, handle) {
    const city = 30 - hill;
    this._map(ctx, c, lx);
    this._line(ctx, c, lx, handle);
    tag(ctx, c, `${name ? 'Hill seat: ' : ''}${hill} lakh`, name ? 158 : 150, 36, { bg: c.s3, size: 33 });
    tag(ctx, c, `${name ? 'City seat: ' : ''}${city} lakh`, 490, 36, { bg: c.s5, size: 33 });
    who(ctx, this, { role: 'adult', x: 46, y: 448, height: 150, i: 1, facing: 0, mood: 'smile' });
    who(ctx, this, { role: 'adult', x: 356, y: 448, height: 150, i: 2, facing: 0, mood: 'smile' });
    this._people(ctx, c, 88, 232, hill, mix(c.s3, c.label, 0.3));
    this._people(ctx, c, 396, 276, city, mix(c.s5, c.label, 0.3));
    tag(ctx, c, '1 MP', 126, 326, { size: 30 });
    tag(ctx, c, '1 MP', 436, 326, { size: 30 });
  }

  ground(ctx, c) { ctx.fillStyle = mix(c.bgSurface, c.gold, 0.08); ctx.fillRect(0, 0, 680, 453); }

  draw(ctx, c) {
    this.ground(ctx, c);
    const shift = this._shift();
    this.seats(ctx, c, this._lx(), 5 + shift, true, this.stage === 1);
    if (this.stage === 2) tag(ctx, c, 'Both sit in the same House', 340, 180, { size: 30 });
  }
}
