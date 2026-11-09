// FederalLayersScene - L05 s09. India from the Survey of India layer. b0 Union and State offices, the
// same citizens. b1 three lists and the residual power, a tap each.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import { drawCivic, tag, card, who, pop, mix, font, plate } from '../L04/DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const MAP = { x: 6, y: 8, w: 280, h: 410 };
const LISTS = [
  { id: 'u', label: 'Union List', tone: 1, who: 'Union makes laws', items: ['defence', 'foreign affairs'] },
  { id: 's', label: 'State List', tone: 3, who: 'States make laws', items: ['police', 'public health'] },
  { id: 'c', label: 'Concurrent List', tone: 5, who: 'Both can make laws', items: ['education'] },
  { id: 'r', label: 'Residual', tone: 2, who: 'Stays with the Union', items: ['a subject in no list'] },
];
const CHIPS = LISTS.map((l) => ({ id: l.id, label: l.label.replace(' List', ''), targets: [l.id], tone: l.tone }));

export class FederalLayersScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of India beside the Union office and a State office. Then chips open the Union List, the State List, the Concurrent List and residual powers, each with example subjects.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'List', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this._at = this.age; } }
  enter(st) { this._at = 0; this.tl.set({ lit: st === 1 ? 'u' : null }); }
  busy() { return this.age - (this._at ?? 0) < 1.2; }

  async setup() {
    this.india = null;
    await super.setup();
    const india = await SimGeo.loadLayer('india');
    const proj = await SimGeo.makeProjection('mercator', india, [MAP.w, MAP.h]);
    this.path = await SimGeo.makePath(this._ctx, proj);
    this.india = india;
    this.animateFor?.(300);
  }

  draw(ctx, c) {
    const st = this.stage, a = this.age - (this._at ?? 0);
    ctx.fillStyle = mix(c.bgSurface, c.water, 0.26); ctx.fillRect(0, 0, 680, 453);
    const map = this.india && plate(this, 'map', c, MAP.w + 8, MAP.h + 8, (x) => {
      x.translate(4, 4); this.path.context(x);
      x.beginPath(); this.path(this.india); x.fillStyle = mix(c.gold, c.bgSurface, 0.32); x.fill(); x.lineWidth = 3; x.strokeStyle = mix(c.gold, c.label, 0.5); x.stroke();
    });
    if (map) ctx.drawImage(map, MAP.x - 4, MAP.y - 4, MAP.w + 8, MAP.h + 8);
    pill(ctx, c, 'Boundary of India: Survey of India', 14, 426, { align: 'left', size: 26, bg: c.bgSurface, ink: c.labelMuted });
    if (st === 0) {
      drawCivic(ctx, c, 'parliament', 500, 150, { w: 250 });
      tag(ctx, c, 'Union government', 500, 28, { bg: c.s1, size: 30, k: pop(a, 0.15) });
      drawCivic(ctx, c, 'office', 500, 340, { w: 150 });
      tag(ctx, c, 'State governments', 500, 184, { bg: c.s3, size: 30, k: pop(a, 0.45) });
      who(ctx, this, { role: 'farmer', x: 374, y: 382, height: 90, i: 1 }); who(ctx, this, { role: 'teacher', x: 626, y: 382, height: 90, i: 2 });
      tag(ctx, c, 'the same citizens', 500, 366, { bg: c.gold, size: 28, k: pop(a, 0.75) });
    } else {
      const L = LISTS.find((l) => l.id === this.tl.chip()?.id);
      if (!L) { card(ctx, c, 300, 24, 368, 124, { title: 'Three lists', text: 'Tap a list.', size: 28, titleSize: 34 }); drawVignette(ctx, c, 0.12); return; }
      card(ctx, c, 300, 24, 368, 124, { title: L.label, text: L.who, size: 28, titleSize: 34, rim: c[`s${L.tone}`] });
      L.items.forEach((t, i) => tag(ctx, c, t, 484, 214 + i * 76, { bg: c[`s${L.tone}`], size: 32, k: pop(a, 0.1 + i * 0.16) }));
    }
    drawVignette(ctx, c, 0.12);
  }
}
