// GatheringScaleScene - L05 s01. b0 a class of forty raises hands, counted one by one to 40.
// b1 the class shrinks to a dot on India, filled with voters: about 2.4 crore classes of 40.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, drawVignette } from 'simulations/base/kit/SimLook.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import { room, who, tag, pop, rr, mix, font, clamp01, plate } from '../L04/DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const ROWS = [{ n: 13, y: 214, h: 84 }, { n: 11, y: 262, h: 98 }, { n: 9, y: 320, h: 118 }, { n: 7, y: 392, h: 146 }];   // 40 in all
const TAU = Math.PI * 2;
const MAP = { x: 196, y: 58, w: 288, h: 350 };

export class GatheringScaleScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'A class of forty students raises hands, one by one, while a counter rises to 40. Then the class shrinks to a tiny square on a map of India packed with dots for voters. The counter reads over 96.8 crore voters, about 2.4 crore classes of 40.';

  async setup() {
    this.india = null; this.geoPath = null;
    await super.setup();
    const india = await SimGeo.loadLayer('india');
    const proj = await SimGeo.makeProjection('mercator', india, [MAP.w, MAP.h]);
    this.india = india;
    this.geoPath = await SimGeo.makePath(this._ctx, proj);
  }

  busy() { return this.age < 3; }

  _paintClass(ctx, c, up, frontOnly = false) {
    room(ctx, c, { ground: 180, wall: mix(c.bgSurface, c.gold, 0.2), floor: mix(c.bgSurface, c.s8, 0.3) });
    rr(ctx, 170, 14, 340, 118, 10); ctx.fillStyle = mix(c.s3, c.label, 0.55); ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = mix(c.s8, c.label, 0.3); ctx.stroke();
    ROWS.forEach((R, r) => {
      if (frontOnly && r < 3) return;   // no OffscreenCanvas: the headless harness, never a browser
      const gap = 640 / R.n;
      for (let i = 0; i < R.n; i++) who(ctx, this, { role: 'student', x: 20 + gap * (i + 0.5), y: R.y, height: R.h, i: i * 3 + r * 5, pose: up ? 'reach-up' : 'stand' });
    });
  }

  // The hands go up left to right across the plate, and the count follows them.
  _class(ctx, c, a) {
    const u = clamp01((a - 0.2) / 2), n = Math.min(40, Math.floor(u * 40));
    // forty kit figures are slow on a cheap phone, so each pose is painted once
    const down = plate(this, 'down', c, 680, 453, (x) => this._paintClass(x, c, false)), up = plate(this, 'up', c, 680, 453, (x) => this._paintClass(x, c, true));
    if (down && up) {
      ctx.drawImage(down, 0, 0, 680, 453);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 680 * u, 453); ctx.clip(); ctx.drawImage(up, 0, 0, 680, 453); ctx.restore();
    } else this._paintClass(ctx, c, u >= 1, true);
    tag(ctx, c, `${n} hands`, 340, 72, { size: 54, bg: c.gold });
  }

  _map(ctx, c, a) {
    ctx.fillStyle = mix(c.bgSurface, c.water, 0.28); ctx.fillRect(0, 0, 680, 453);
    if (!this.geoPath) return;
    const base = plate(this, 'map', c, MAP.w + 8, MAP.h + 8, (x) => {
      x.translate(4, 4); this.geoPath.context(x);
      x.beginPath(); this.geoPath(this.india); x.fillStyle = mix(c.bgSurface, c.gold, 0.4); x.fill(); x.lineWidth = 3; x.strokeStyle = mix(c.gold, c.label, 0.5); x.stroke();
    });
    const dots = plate(this, 'dots', c, MAP.w + 8, MAP.h + 8, (x) => {
      x.translate(4, 4); this.geoPath.context(x);
      x.beginPath(); this.geoPath(this.india); x.clip();
      const tones = [c.s1, c.s2, c.s3, c.s5, c.s7];
      let t = 0;
      for (let y = 2; y < MAP.h; y += 8) for (let i = (y % 2) * 4; i < MAP.w; i += 8) {
        t = (t * 31 + 7) % 101;
        x.beginPath(); x.arc(i, y, 3, 0, TAU); x.fillStyle = tones[t % 5]; x.fill();
      }
    });
    if (base) ctx.drawImage(base, MAP.x - 4, MAP.y - 4, MAP.w + 8, MAP.h + 8);
    if (dots) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, MAP.y + MAP.h * (1 - clamp01((a - 0.5) / 1.4)), 680, MAP.h + 60); ctx.clip();
      ctx.drawImage(dots, MAP.x - 4, MAP.y - 4, MAP.w + 8, MAP.h + 8); ctx.restore();
    }
  }

  draw(ctx, c) {
    const st = this.stage, a = this.age;
    if (st === 0) this._class(ctx, c, a);
    else {
      this._map(ctx, c, a);
      const s = 1 - clamp01(a / 1.0), bx = 330, by = 226;
      const size = 26 + s * 654;
      if (s > 0) {
        ctx.save(); ctx.translate(bx * (1 - s), by * (1 - s)); ctx.scale(size / 680, size / 680); rr(ctx, 0, 0, 680, 453, 20); ctx.clip(); this._class(ctx, c, 9); ctx.restore();
      } else {
        rr(ctx, bx - 8, by - 8, 40, 36, 7); ctx.lineWidth = 6; ctx.strokeStyle = c.label; ctx.stroke(); rr(ctx, bx, by, 24, 20, 3); ctx.fillStyle = c.gold; ctx.fill();
        tag(ctx, c, 'your class', 110, 226, { size: 30 });
        ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(190, 226); ctx.lineTo(bx - 10, 232); ctx.stroke();
        tag(ctx, c, 'over 96.8 crore voters', 340, 30, { size: 38, bg: c.gold, k: pop(a, 1.3) });
        tag(ctx, c, 'about 2.4 crore classes of 40', 340, 370, { size: 30, k: pop(a, 1.7) });
        pill(ctx, c, 'Boundary of India: Survey of India', 14, 426, { align: 'left', size: 26, bg: c.bgSurface, ink: c.labelMuted });
      }
    }
    drawVignette(ctx, c, 0.14);
  }
}
