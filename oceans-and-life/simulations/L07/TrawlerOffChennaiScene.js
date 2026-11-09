// TrawlerOffChennaiScene - L07 blk-l07-s09 (hook).
//
// A real map of the Coromandel coast around Chennai, with a foreign trawler 100 nautical miles
// out at sea on a dashed line that runs east from the city, and an Indian coast guard ship that
// lies much closer in. A dial moves the trawler along that line and the distance label follows
// it; pressing Sail sends the coast guard ship out to meet the trawler while a clock counts the
// hours it takes (20 nautical miles an hour, so 100 nautical miles is 5 hours).
//
// India's border comes only from SimGeo.loadLayer('india') drawn with GeoMap's drawIndia, and the
// credit it prints is never switched off, so the credit is on screen on every beat. The scene names
// no sea zone and says nothing about whose fish the trawler is taking: that is the next lesson.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  ZONES, alpha, mix, pill, chipRow, chipSize, placeLabels, leader, drawBackdrop, drawCard, font, rr,
} from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawIndia, layerCache, makeView, CREDIT_INDIA } from 'simulations/base/kit/GeoMap.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';

// ---- the frame ---------------------------------------------------------------------------
const MAP = { x: 16, y: 72, w: 648, h: 300 };   // the chart: the coast on the left, the sea to the east
const PAD = 8;
const EXTENT = { lon0: 79.2, lon1: 84.75, lat0: 11.372, lat1: 13.9 };  // fitted to the panel below
const CLOCK_CARD = { x: 16, y: 386, w: 300, h: 108 };
const VOYAGE_CARD = { x: 332, y: 386, w: 332, h: 108 };

// ---- the model ---------------------------------------------------------------------------
const CHENNAI = [13.08, 80.27];                // the city: 13.08 N, 80.27 E
const BEARING = 100;                           // the route line's bearing out to sea
const EARTH_NM = 3440.065;                     // nautical miles in one radian of arc
const KM_PER_NM = 1.852;                       // one nautical mile is 1,852 m
const SPEED_NM_H = 20;                         // the coast guard ship's speed, an example
const DIAL_MIN = 0;
const DIAL_MAX = 250;
const DIAL_STEP = 10;
const DIAL_DEFAULT = 100;
const SECONDS_PER_HOUR = 0.6;                  // the compressed clock: 5 h of sailing in 3 s
const SPEED_LABEL = '20 nautical miles an hour';
const SHIP_LABEL = 'coast guard ship';
const TRAWLER_LABEL = 'trawler';
const CITY_LABEL = 'Chennai';

function withTransform(ctx) {
  try { if (ctx.getTransform?.()) return ctx; } catch { /* fall through */ }
  const ident = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  return new Proxy(ctx, { get: (t, p) => (p === 'getTransform' ? () => ident : t[p]) });
}

export class TrawlerOffChennaiScene extends SimScene {
  static BEAT_STEP_MAP = [
    [{ idx: 0 }],
    [{ idx: 1 }],
    [{ idx: 2 }],
  ];
  static COLOR_MAP = GEO_COLOR_MAP;
  static DRAGGABLE = false;         // the projection is held still: no pan, no zoom
  static CONTINUOUS = false;
  static NOTE_STAGE = 0;
  static ARIA_LABEL =
    'A map of the Coromandel coast around Chennai, drawn from Survey of India maps, with the city '
    + 'marked on the coast. A dashed line runs east from the city to a foreign trawler out at sea, '
    + 'and the distance along it is written in nautical miles and in kilometres. An Indian coast '
    + 'guard ship lies much closer in. A dial moves the trawler along the line, and pressing Sail '
    + 'sends the coast guard ship out to it while a clock counts the hours it takes to get there.';
  static CONTROLS = [
    { type: 'slider', id: 'dist', label: 'how far out the trawler is (nautical miles)', min: DIAL_MIN, max: DIAL_MAX, step: DIAL_STEP, value: DIAL_DEFAULT },
    { type: 'button', id: 'sail', label: 'set the coast guard ship going' },
  ];

  constructor(container, config) {
    super(container, config);
    this._dist = DIAL_DEFAULT;     // the trawler's distance from Chennai, in nautical miles
    this._sailed = 0;               // nautical miles the coast guard ship has covered
    this._run = null;               // { t, stage } while the ship is under way
    this._arrived = false;          // the ship has reached the trawler
    this._cache = layerCache();     // the static coastline, painted once per theme
  }

  noteRows() { return [{ text: 'the speed shown is an example for this map, not a claim about any real patrol' }]; }

  // ---- the map ------------------------------------------------------------------------

  async setup() {
    // The only layer: the Survey of India outline, which carries India's coast and border.
    this._india = await SimGeo.loadLayer('india');
    await super.setup();
    this._view = await this._makeView();
    this.animateFor(500);
  }

  /**
   * The fitted mercator, in design px. Written out rather than taken from GeoMap's makeView,
   * because that helper reads ctx.getTransform().a and this host's context has no getTransform.
   * The extent is the scene's own.
   */
  async _makeView() {
    return await makeView(withTransform(this._ctx), {
      kind: 'mercator',
      box: MAP,
      extent: [[EXTENT.lon0, EXTENT.lat0], [EXTENT.lon1, EXTENT.lat1]],
      pad: PAD,
    });
  }

  /** The point `nm` nautical miles from Chennai on the route line. */
  _pointAt(nm) { return destPoint(CHENNAI[0], CHENNAI[1], BEARING, nm); }

  /** Where a point sits in map px. */
  _px(ll) {
    const p = this._view ? this._view.at(ll) : null;
    return p ? { x: p[0], y: p[1] } : null;
  }

  // ---- the model ----------------------------------------------------------------------

  /** The trawler's distance from Chennai, in nautical miles. */
  get _trawlerNM() { return this._dist; }

  /** The same distance in kilometres: one nautical mile is 1,852 m. */
  get _trawlerKm() { return this._dist * KM_PER_NM; }

  /** The hours the coast guard ship needs to cover the distance at 20 NM an hour. */
  get _sailHours() { return this._sailed / SPEED_NM_H; }

  /** The clock face reads the hours the ship has been at sea. */
  get _clockHours() { return Math.round((this._sailed / SPEED_NM_H) * 2) / 2; }

  // ---- beats --------------------------------------------------------------------------

  enter(stage) {
    if (stage === 0) {
      // The map at rest: the trawler is out on the line, the coast guard ship is in close.
      this._sailed = 0;
      this._run = null;
      this._arrived = false;
      return;
    }
    if (stage === 1) {
      // The ship leaves Chennai and sails east along the line, the clock ticking.
      this._sailed = 0;
      this._run = null;
      this._arrived = false;
      this.after(0.7, () => this._sail());
      return;
    }
    // The ship has reached the trawler: five hours for a hundred nautical miles.
    this._sailed = this._dist;
    this._run = null;
    this._arrived = true;
  }

  /** Sends the coast guard ship out from Chennai towards the trawler. */
  _sail() {
    if (this.stage !== 1 || this._run) return;
    this._sailed = 0;
    this._run = { t: 0, stage: this.stage };
    this.animateFor(600);
  }

  update(d) {
    const run = this._run;
    if (!run) return;
    run.t += d;
    // The ship covers 20 nautical miles an hour; the hour is compressed into a second.
    this._sailed = Math.min(run.t / SECONDS_PER_HOUR * SPEED_NM_H, this._dist);
    if (this._sailed >= this._dist - 1e-9) {
      this._sailed = this._dist;
      this._run = null;
      this._arrived = true;
      const at = this._px(this._pointAt(this._dist));
      if (at) this.celebrate(at.x, at.y, 16);
    }
  }

  busy() { return !!this._run; }

  // ---- controls ------------------------------------------------------------------------

  isControlHidden(id) { return id === 'sail' && this.stage !== 1; }

  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'dist') {
      this._dist = Math.max(DIAL_MIN, Math.min(DIAL_MAX, Number(v)));
      if (this._run) this._run.t = Math.min(this._run.t, this._dist / SPEED_NM_H * SECONDS_PER_HOUR);
      this.requestUiUpdate?.();
    } else if (id === 'sail') {
      this._sail();
    }
  }

  /** What the host shows in the slider: the scene's own value. */
  getControlValue(id) { return id === 'dist' ? String(this._dist) : super.getControlValue(id); }

  testState() {
    return {
      stage: this.stage,
      dist: this._dist,
      km: Math.round(this._trawlerKm * 10) / 10,
      hours: this._clockHours,
      sailed: Math.round(this._sailed * 10) / 10,
      arrived: !!this._arrived,
      running: !!this._run,
      // The two marks, in map px, so a test can see that they are far apart.
      ship: this._px(this._pointAt(this._sailed)),
      trawler: this._px(this._pointAt(this._dist)),
    };
  }

  // ---- drawing ----------------------------------------------------------------------

  draw(ctx, c, t) {
    drawBackdrop(ctx, c, 'plain');
    const mapBox = MAP;
    this._cache(ctx, [c, this.stage], (o) => {
      o.save();
      o.beginPath();
      o.rect(mapBox.x, mapBox.y, mapBox.w, mapBox.h);
      o.clip();
      o.fillStyle = c.mapOcean || mix(c.bgDeep, c.s1, 0.6);
      o.fillRect(mapBox.x, mapBox.y, mapBox.w, mapBox.h);
      if (this.view && this._india) {
        drawIndia(o, this.view, c, this._india, {
          fill: c.mapLand, stroke: c.label, lineWidth: 2,
        });
      }
      o.restore();
    });
    if (this._view) {
      const chennaiPx = this._px(CHENNAI);
      const trawlerPx = this._px(this._pointAt(this._dist));
      if (chennaiPx && trawlerPx) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(chennaiPx.x, chennaiPx.y);
        ctx.lineTo(trawlerPx.x, trawlerPx.y);
        ctx.setLineDash([8, 5]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = alpha(c.accent, 0.9);
        ctx.stroke();
        ctx.restore();
        const mx = (chennaiPx.x + trawlerPx.x) / 2;
        const my = (chennaiPx.y + trawlerPx.y) / 2;
        const nmText = `${this._dist} nautical miles`;
        const kmText = `${Math.round(this._trawlerKm)} km`;
        pill(ctx, c, `${nmText} / ${kmText}`, mx, my, {
          size: 13, bg: alpha(c.bgSurface, 0.9), ink: c.label,
        });
      }
      if (chennaiPx) {
        pill(ctx, c, CITY_LABEL, chennaiPx.x, chennaiPx.y - 18, {
          size: 14, bg: alpha(c.bgDeep, 0.7), ink: c.label,
        });
        drawIcon(ctx, c, 'pin', chennaiPx.x, chennaiPx.y, 5, { tone: c.accent });
      }
      if (trawlerPx) {
        drawIcon(ctx, c, 'boat', trawlerPx.x, trawlerPx.y, 10, { tone: c.s1 });
        pill(ctx, c, TRAWLER_LABEL, trawlerPx.x + 14, trawlerPx.y, {
          size: 13, bg: alpha(c.bgSurface, 0.85), ink: c.label,
        });
      }
      const shipDist = Math.min(this._sailed, this._dist);
      const shipPoint = this._pointAt(shipDist);
      const shipPx = this._px(shipPoint);
      if (shipPx) {
        drawIcon(ctx, c, 'boat', shipPx.x, shipPx.y, 8, { tone: c.s3 });
        const labelX = shipPx.x + (shipPx.x > (chennaiPx ? chennaiPx.x : 300) ? 14 : -14);
        pill(ctx, c, SHIP_LABEL, labelX, shipPx.y - 14, {
          size: 13, bg: alpha(c.bgSurface, 0.85), ink: c.label,
        });
      }
    }
    if (this.view && this._india) {
      pill(ctx, c, CREDIT_INDIA, mapBox.x + mapBox.w - 6, mapBox.y + mapBox.h - 14, {
        align: 'right', size: 14, bg: alpha(c.bgSurface, 0.85), ink: c.labelMuted,
      });
    }
    const clockB = CLOCK_CARD;
    drawCard(ctx, c, clockB.x, clockB.y, clockB.w, clockB.h, 1, { accent: c.s1 });
    ctx.save();
    ctx.font = font(c, 700, 28);
    ctx.fillStyle = c.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this._clockHours} h`, clockB.x + clockB.w / 2, clockB.y + clockB.h / 2 - 6);
    ctx.font = font(c, 500, 13);
    ctx.fillText('hours sailed', clockB.x + clockB.w / 2, clockB.y + clockB.h / 2 + 22);
    ctx.restore();
    ctx.save();
    ctx.font = font(c, 500, 12);
    ctx.fillStyle = c.labelMuted;
    ctx.textAlign = 'left';
    ctx.fillText(SPEED_LABEL, clockB.x + 14, clockB.y + clockB.h - 20);
    ctx.restore();
    const voyageB = VOYAGE_CARD;
    drawCard(ctx, c, voyageB.x, voyageB.y, voyageB.w, voyageB.h, 1, { accent: c.accent });
    ctx.save();
    ctx.font = font(c, 700, 22);
    ctx.fillStyle = c.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${this._dist} NM`, voyageB.x + 16, voyageB.y + 18);
    ctx.font = font(c, 500, 14);
    ctx.fillStyle = c.label;
    ctx.fillText(`${Math.round(this._trawlerKm)} km`, voyageB.x + 16, voyageB.y + 46);
    ctx.font = font(c, 400, 12);
    ctx.fillStyle = c.labelMuted;
    ctx.fillText('distance from Chennai', voyageB.x + 16, voyageB.y + voyageB.h - 20);
    ctx.restore();
  }
}

// ---- the route line ----------------------------------------------------------------------
// The point `nm` nautical miles from (lat, lon) on a bearing, on the sphere.
function destPoint(lat, lon, brg, nm) {
  const p = Math.PI / 180;
  const br = brg * p;
  const la1 = lat * p;
  const lo1 = lon * p;
  const dr = nm / EARTH_NM;
  const la2 = Math.asin(Math.sin(la1) * Math.cos(dr) + Math.cos(la1) * Math.sin(dr) * Math.cos(br));
  const lo2 = lo1 + Math.atan2(
    Math.sin(br) * Math.sin(dr) * Math.cos(la1),
    Math.cos(dr) - Math.sin(la1) * Math.sin(la2),
  );
  return [(la2 * 180) / p, (lo2 * 180) / p];
}
