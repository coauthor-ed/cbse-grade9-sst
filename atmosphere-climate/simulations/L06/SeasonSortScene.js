import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { SEASON_SORT } from '../L01/AtmosphereClimateDeck.js';

// Two sorts in one run: which calendar, then which monsoon. The crates on the belt are only the
// ones for the item in play, so the learner reads them to see which question is being asked. The
// deck marks every group and item with a `groupset`, and this class honours it.
export class SeasonSortScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Season sorter: seasons, months and facts ride a conveyor belt one at a time; read the crates, which change with the question, and tap the crate each item belongs in before the belt drops it.';
  static CONFIG = {
    ...SEASON_SORT,
    title: 'Sort the season',
    skin: 'belt',
    rounds: 10,
    how: 'The crates change with the question. Read them first, then tap the one this item belongs in.',
  };

  /** The engine's checks, plus the ones only this deck's two group sets need. */
  checkConfig(cfg) {
    const p = super.checkConfig(cfg);
    const groups = cfg.groups || [];
    const sets = new Map();
    for (const g of groups) {
      if (!g.groupset) p.push(`group "${g.id}" needs a groupset`);
      else sets.set(g.groupset, (sets.get(g.groupset) || 0) + 1);
    }
    for (const [s, n] of sets) if (n < 2) p.push(`group set "${s}" needs 2 or more groups (got ${n})`);
    for (const it of cfg.items || []) {
      if (!it.groupset) { p.push(`item "${it.name}" needs a groupset`); continue; }
      if (!sets.has(it.groupset)) p.push(`item "${it.name}": no group carries groupset "${it.groupset}"`);
      const g = groups.find((x) => [].concat(it.is || []).includes(x.id));
      if (g && g.groupset !== it.groupset) {
        p.push(`item "${it.name}": groupset "${it.groupset}" but is "${g.id}", which is in group set "${g.groupset}"`);
      }
    }
    return p;
  }

  /** The menu shows the three shortest names, so they stay large on a small card. */
  menuSample() {
    return [...(this.cfg.items || [])]
      .sort((a, b) => a.name.length - b.name.length)
      .slice(0, 3);
  }

  beginRun(run) {
    this._snapBins = true;
    this._shownSet = null;
    super.beginRun(run);
  }

  /**
   * The engine picks the next item; then the crates change to that item's group set. Called by
   * beginRun and after a slip, so it runs before every item.
   */
  _next() {
    super._next();
    const pl = this.play;
    if (!this.allBins) this.allBins = pl.bins;
    if (pl.cur) this._setBins(pl.cur.item);
  }

  /** Show only the crates of the item's group set; keep the engine's shuffled order within one. */
  _setBins(item) {
    const set = item.groupset;
    // `_shownSet`, not the bins themselves: on the first item the bins are still all four.
    if (this._shownSet === set) return;
    this._shownSet = set;
    this.play.bins = this.allBins.filter((b) => b.g.groupset === set);
    this._layoutBins(this._snapBins);
    this._snapBins = false;
  }
}