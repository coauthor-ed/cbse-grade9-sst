// DiscardToDiscoveryScene - L02 s03. One tool: made, used, dropped, buried as the surface rises round it, found.
// The tool never moves: the ground rises. Beat 2 is the Old World on a land map.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { mix, darken, pill, clamp01, outBack, inOutSine, drawBackdrop, drawCard } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { loadEraMap, eraView, drawEraBase, eraRegion, eraLabel, eraOnLand } from '../shared/EraMap.js';
import { drawTool, drawBand } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_LINE = 0, S_LIMB = 1, S_WORLD = 2, S_DROP = 3, S_BURY = 4, S_FOUND = 5;
const GY = 318, TX = 340;                                 // the old ground level, and where the tool lies
const NEW = [{ kind: 'dust', h: 44, name: 'dust' }, { kind: 'silt', h: 42, name: 'flood silt' }, { kind: 'ash', h: 34, name: 'ash' }, { kind: 'clay', h: 46, name: 'fallen rock' }];
const EXT = [[-20, -38], [150, 66]];
const AFRICA = [[-22, 14], [-10, 36], [12, 38], [31, 32.4], [34, 27], [44, 12], [54, 12], [44, -20], [30, -38], [14, -38], [6, -8], [-10, 2]];
const EUROPE = [[-12, 36], [-14, 56], [8, 66], [30, 72], [50, 62], [44, 46], [28, 36], [8, 37]];
const ASIA = [[50, 62], [80, 76], [160, 72], [150, 46], [128, 20], [120, -10], [96, -8], [76, 4], [60, 14], [44, 11], [35, 28], [34, 37], [44, 46]];

export class DiscardToDiscoveryScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4), m(5)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'A chopper 3.3 million years old. A person uses it to cut, dig and crack. A land map shows Africa, Asia and Europe, the Old World. Then the worn tool lies on the ground, new layers of earth rise over it while it stays still, and an archaeologist cuts a trench down to it.';

  async setup() { this.map = await loadEraMap(); await super.setup(); await eraView(this, EXT); this.animateFor?.(400); }
  busy() { return this.age < 2.6; }


  _ground(ctx, c) {
    // Sky above whatever the surface is now; old earth stays put below GY.
    ctx.fillStyle = mix(c.skyDay ?? c.bgSurface, c.bgSurface, 0.4); ctx.fillRect(0, 0, 680, 520);
    drawBand(ctx, c, 'base', 0, GY, 680, 206, { seed: 3 });
  }

  draw(ctx, c) {
    const st = this.stage;
    if (st === S_WORLD) {
      drawBackdrop(ctx, c, 'dots');
      if (!drawEraBase(ctx, c, this, { india: false })) return;
      const v = this.view;
      eraOnLand(ctx, this, () => [[AFRICA, c.s2], [EUROPE, c.s3], [ASIA, c.s1]].forEach(([r, col], i) => eraRegion(ctx, c, v, r, col, clamp01((this.age - i * 0.25) / 0.5), { fill: 0.4 })));
      eraLabel(ctx, c, 'Africa', ...v.at([20, 8]), { size: 30 });
      eraLabel(ctx, c, 'Europe', ...v.at([14, 49]), { size: 30 });
      eraLabel(ctx, c, 'Asia', ...v.at([92, 46]), { size: 30 });
      eraLabel(ctx, c, 'the Old World', 470, 440, { size: 32, bg: c.gold });
      return;
    }
    if (st === S_LINE) {
      drawBackdrop(ctx, c, 'dots');
      drawCard(ctx, c, 90, 40, 500, 330);
      const k = outBack(clamp01(this.age / 0.5));
      drawTool(ctx, c, 'chopper', 340, 206, 150 * k, { seed: 41 });
      pill(ctx, c, 'about 3.3 million years ago', 340, 420, { size: 32, bg: c.gold, display: true });
      pill(ctx, c, 'the earliest stone tools', 340, 476, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
      return;
    }
    if (st === S_LIMB) {
      ctx.fillStyle = mix(c.skyDay ?? c.bgSurface, c.bgSurface, 0.4); ctx.fillRect(0, 0, 680, 520);
      drawBand(ctx, c, 'dust', 0, 430, 680, 90);
      const hand = { x: 384, y: 330 };
      const fig = figureFor(this, { role: 'adult', pose: 'stand', x: 250, y: 440, height: 330, facing: 1, i: 3, hands: [hand, null], look: { outfit: 'drape', top: c.strata3, bottom: c.strata2, shoeStyle: 'none' } });
      drawFigure(ctx, c, fig, fig.look);
      const k = outBack(clamp01(this.age / 0.4));
      drawTool(ctx, c, 'chopper', hand.x + 56, hand.y + 6, 62 * k, { rot: 0.3 });
      ['cut', 'dig', 'crack'].forEach((t, i) => {
        const q = outBack(clamp01((this.age - 0.3 - i * 0.18) / 0.4));
        if (q > 0) pill(ctx, c, t, 580, 96 + i * 86, { size: 34 * Math.max(0.6, q), bg: c.bgSurface, ink: c.label, display: true });
      });
      return;
    }
    this._ground(ctx, c);
    // New layers settle from the old ground upward. Their total height is the rise.
    const dur = 1.8;
    const prog = st === S_DROP ? 0 : st === S_BURY ? clamp01(this.age / dur) : 1;
    let y = GY, h0 = NEW.reduce((a, b) => a + b.h, 0), left = prog * h0;
    for (const b of NEW) {
      const h = Math.min(b.h, left); left -= h;
      if (h <= 0) break;
      y -= h;
      drawBand(ctx, c, b.kind, 0, y, 680, h, { seed: b.h });
    }
    const top = y;
    ctx.fillStyle = mix(c.elevLow, c.strata3, 0.2); ctx.fillRect(0, top - 8, 680, 10);
    if (st === S_FOUND) {
      // The trench: a slot of open air from the surface to the tool.
      const tw = 200, x0 = TX - tw / 2, d = inOutSine(clamp01(this.age / 0.9)) * (GY + 34 - top);
      ctx.fillStyle = mix(c.skyDay ?? c.bgSurface, c.bgDeep, 0.25); ctx.fillRect(x0, top - 6, tw, d + 6);
      ctx.strokeStyle = darken(c.strata3, 0.5); ctx.lineWidth = 4; ctx.strokeRect(x0, top - 6, tw, d + 6);
    }
    drawTool(ctx, c, 'chopper', TX, GY - 2, 42, { rot: 0.1, worn: true });
    if (st === S_DROP) {
      const dx = inOutSine(clamp01(this.age / 1.6)) * 220;
      const fig = figureFor(this, { role: 'adult', pose: { name: 'walk', phase: (dx / 90) % 1 }, x: 300 + dx, y: GY, height: 210, facing: 1, i: 3, look: { outfit: 'drape', top: c.strata3, bottom: c.strata2, shoeStyle: 'none' } });
      drawFigure(ctx, c, fig, fig.look);
      pill(ctx, c, 'worn out, dropped', 190, 430, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    }
    if (st === S_BURY) {
      let yy = GY; let l = prog * h0;
      NEW.forEach((b) => { const h = Math.min(b.h, l); l -= h; yy -= b.h; if (h > b.h * 0.7) pill(ctx, c, b.name, 580, yy + b.h / 2, { size: 25, bg: c.bgSurface, ink: c.label, display: true }); });
      // The surface climbs; the tool stays.
      ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(240, GY); ctx.stroke(); ctx.setLineDash([]);
      pill(ctx, c, 'the old ground', 120, GY + 34, { size: 25, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'the tool stays here', 340, GY + 76, { size: 26, bg: c.gold, display: true });
    }
    if (st === S_FOUND) {
      const fig = figureFor(this, { role: 'worker', pose: 'point', x: 174, y: top - 6, height: 130, facing: 1, i: 2 });
      drawFigure(ctx, c, fig, fig.look);
      pill(ctx, c, 'found', TX, GY + 62, { size: 32, bg: c.gold, display: true });
    }
  }
}
