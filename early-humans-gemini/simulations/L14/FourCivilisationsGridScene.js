// FourCivilisationsGridScene - blk-l14-s04, 6 beats, one item of the list per beat. Four big cells show the same item in
// four places, so the shared idea and the local difference read together. Entries come from this chapter. Canvas: SimIcons.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, inkOn, mix, outBack, pill, rr, wrapLines, font } from 'simulations/base/kit/SimLook.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3, 4, 5].map((idx) => [{ idx, dwellMs: null }]);
const CIVS = [['Harappans', 's2'], ['Mesopotamia', 's6'], ['Egypt', 's3'], ['China', 's5']];
const ROWS = [
  { title: 'River plains', icon: 'river', v: ['Sindhu, Sarasvati', 'Tigris, Euphrates', 'Nile', 'Huang He, Yangtze'] },
  { title: 'More food than farmers need', icon: 'grain', v: ['Wheat, barley', 'Grain in temple stores', 'Fields after the flood', 'Millets, rice'] },
  { title: 'Cities', icon: 'building', v: ['Mohenjo-Daro', 'Ur', 'Memphis', 'Anyang'] },
  { title: 'Writing: first jobs differ', icon: 'pen', v: ['Sindhu lipi: unread', 'Cuneiform: lists', 'Hieroglyphs', 'Oracle bones: questions'] },
  { title: 'Who ran things?', icon: 'crown', v: ['We do not know', 'City-states, then empires', 'Pharaohs', 'Dynasties'] },
  { title: 'Bronze Age begins', icon: 'hammer', v: ['3300 BCE', '3500 BCE', '3100 BCE', 'About 2000 BCE'] },
];

export class FourCivilisationsGridScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'Four cells, one each for the Harappans, Mesopotamia, Egypt and China. Each beat fills them with one shared feature: river plains, food surplus, cities, writing, who ran things, and the start of the Bronze Age.';

  busy() { return this.age < 1; }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, row = ROWS[s];
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.14); ctx.fillRect(0, 0, W, H);
    pill(ctx, c, row.title, 340, 40, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
    // Six marks: how far along the list.
    ROWS.forEach((_, i) => { ctx.fillStyle = i <= s ? c.accent : c.track; ctx.beginPath(); ctx.arc(340 + (i - 2.5) * 22, 84, 7, 0, 7); ctx.fill(); });
    CIVS.forEach(([name, tone], i) => {
      const w = 322, h = 196, x = 12 + (i % 2) * 334, y = 104 + (i >> 1) * 206, col = c[tone], k = outBack(clamp((t - i * 0.08) / 0.34, 0, 1));
      rr(ctx, x, y + 5, w, h, 18); ctx.fillStyle = darken(c.bgSurface, 0.22); ctx.fill();
      rr(ctx, x, y, w, h, 18); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.stroke; ctx.stroke();
      pill(ctx, c, name, x + w / 2, y + 30, { size: 25, display: true, bg: col, ink: inkOn(c, col) });
      ctx.save(); ctx.translate(x + 62, y + 118); ctx.scale(k, k); drawIcon(ctx, c, row.icon, 0, 0, 40, { tone: col }); ctx.restore();
      ctx.save(); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = font(c, 700, 27, true);
      const lines = wrapLines(ctx, row.v[i], 196), lh = 32;
      lines.forEach((ln, j) => ctx.fillText(ln, x + 214, y + 118 + (j - (lines.length - 1) / 2) * lh));
      ctx.restore();
    });
  }
}
