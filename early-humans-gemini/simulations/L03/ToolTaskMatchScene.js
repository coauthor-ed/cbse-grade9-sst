// ToolTaskMatchScene - L03 s05. What the layer shows: tools and fossils in one band. Which tool did which job is the best reading.
// Four drawn tools over four jobs. Chips light one pair and give the reason in the tool's shape.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { mix, pill, drawBackdrop, drawCard } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawTool, drawBone, drawBand } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const PAIRS = [
  { id: 'chopper', tool: 'chopper', name: 'chopper', job: 'chop meat', why: 'heavy, rough edge', tone: 's1', s: 54 },
  { id: 'handaxe', tool: 'handaxe', name: 'handaxe', job: 'dig tubers', why: 'pointed tip', tone: 's2', s: 66 },
  { id: 'scraper', tool: 'scraper', name: 'scraper', job: 'scrape skin', why: 'thin, steep edge', tone: 's3', s: 62 },
  { id: 'cleaver', tool: 'cleaver', name: 'cleaver', job: 'split bone', why: 'broad, straight edge', tone: 's4', s: 66 },
];
const CHIPS = PAIRS.map((p, i) => ({ id: p.id, label: p.name, targets: [p.id], tone: i + 1 }));
const W = 160, GAP = 6, X0 = 14, BY = 346;

export class ToolTaskMatchScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Four stone tools, each over a job: chopper, chop meat; handaxe, dig tubers; scraper, scrape skin; cleaver, split bone. The matches are marked as the best reading. Below, a band of soil holds tools and animal fossils together. Chips light one pair and give the reason in the shape.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Tool', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  isControlDisabled(id) { return id === 'lit' && this.tl.disabled(); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.animateFor?.(300); } }
  enter() { this.tl.set({ lit: null }); this.requestUiUpdate?.(); }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    PAIRS.forEach((p, i) => {
      const x = X0 + i * (W + GAP), off = this.tl.off(p.id);
      ctx.save(); ctx.globalAlpha *= off ? 0.3 : 1;
      drawCard(ctx, c, x, 12, W, 262);
      drawTool(ctx, c, p.tool, x + W / 2, 92, p.s);
      // The link is dashed: this match is a reading, not a find.
      ctx.setLineDash([9, 9]); ctx.strokeStyle = c.label; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + W / 2, 168); ctx.lineTo(x + W / 2, 204); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      pill(ctx, c, p.job, x + W / 2, 236, { size: 25, bg: off ? c.bgSurface : c[p.tone], display: true, ink: off ? c.labelMuted : undefined });
    });
    const on = this.tl.chip();
    pill(ctx, c, on ? PAIRS.find((p) => p.id === on.id).why : 'matches: the best reading', 340, 308, { size: 28, bg: c.gold, display: true });
    // The layer: one band, tools and fossils lying together.
    drawBand(ctx, c, 'dust', 0, BY, 680, 174, { seed: 8 });
    ctx.fillStyle = mix(c.elevLow, c.strata3, 0.25); ctx.fillRect(0, BY - 4, 680, 8);
    drawBone(ctx, c, 110, BY + 66, 54, { rot: 0.2, fossil: true });
    drawTool(ctx, c, 'handaxe', 246, BY + 70, 44, { rot: 1.2 });
    drawBone(ctx, c, 420, BY + 54, 46, { rot: -0.3, fossil: true });
    drawTool(ctx, c, 'chopper', 330, BY + 62, 30, { seed: 5 });
    drawTool(ctx, c, 'cleaver', 548, BY + 66, 44, { rot: -1.1 });
    pill(ctx, c, 'tools and fossils in one layer', 340, BY + 144, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
  }
}
