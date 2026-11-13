/**
 * RefereeToolkitScene - blk-l06-s08, the L06 mini-game (mini-game@1, mounted once, no beats).
 *
 * The concept IS the win condition. Five cases from L06's own slides stand in a row; the learner opens
 * one and calls the tool that answers it. No case stores its answer: `verdictFor()` runs the chapter's
 * test over each case's own evidence - can the good be fenced at all, is there a rival, is the price
 * beyond reach or a sudden spike - and prints the tool and the stamp the test picks. So the only way to
 * clear the deck is asking which way the market is failing, not matching labels (tie L2).
 *
 * The four tools and the four stamps are the chapter's own words (the stub's `Must get right`):
 * cap the price -> unfair price; set a floor or send a regulator -> unfair practice;
 * provide the good directly -> missing provision; leave the market alone -> none.
 *
 * What this file will not do, all from the stub:
 *   - no timer, no score of its own, no hearts, no penalty. A wrong tool is struck out for that case
 *     only and the case stays live, so every retry is free.
 *   - it never prints the answer for a case before the learner calls one, and never shows which tool
 *     the other four cases need.
 *   - it names no mechanism the L06 slides do not: no shortage the cap makes, no cost of intervention,
 *     no bank-stage rule.
 *
 * Every figure on screen is a slide's own number: Rs 3,000 a course and a Rs 2,500 ceiling (s02/s03),
 * one month's wage (s01), Rs 100 per 200 ml under the Essential Commodities Act (s03), TRAI (s04),
 * Rs 5,000 each for the park (s05), and the ordinary swing with the season turned (s07/s09).
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { esc, simField, simTags } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst } from 'simulations/base/kit/SimLookDom.js';

const RUPEE = '\u20b9';

/* ------------------------------------------------------------------ the four tools */

const TOOLS = [
  { id: 'cap', label: 'cap the price', stamp: 'unfair price' },
  { id: 'regulator', label: 'set a floor or send a regulator', stamp: 'unfair practice' },
  { id: 'provide', label: 'provide the good directly', stamp: 'missing provision' },
  { id: 'none', label: 'leave the market alone', stamp: 'none' },
];

const TOOL = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

/* ------------------------------------------------------------------ the five cases */

// `fence` is the sharpest test, so it is asked first: a good nobody can fence back (a park gate, a
// road) is a missing provision whatever else is true of its sellers. `rivals === 0` is the monopoly
// shape of s04. `reach` / `spike` are the two price failures of s01-s03. Anything else the market has
// already answered on its own, which is the s07 "leave the market alone" case.
const CASES = [
  {
    id: 'medicine',
    name: 'medicine',
    clue: 'beyond reach',
    fence: true, rivals: 1, reach: true,
    rows: [
      ['market price', `${RUPEE}3,000 a course`],
      ['a legal ceiling', `${RUPEE}2,500`],
      ["a family earns", "one month's wage"],
      ['at the counter', 'families wince'],
    ],
  },
  {
    id: 'pandemic',
    name: 'pandemic',
    clue: 'sudden spikes',
    fence: true, rivals: 1, spike: true,
    rows: [
      ['the good', 'sanitiser, an essential'],
      ['the price', 'jumps overnight'],
      ['under the Act', 'Essential Commodities'],
      ['the cap so far', `${RUPEE}100 per 200 ml`],
    ],
  },
  {
    id: 'telecom',
    name: 'telecom',
    clue: 'one seller',
    fence: true, rivals: 0,
    rows: [
      ['sellers', 'one'],
      ['close substitutes', 'none'],
      ['the price', 'its own'],
      ['the referee', 'TRAI'],
    ],
  },
  {
    id: 'park',
    name: 'village park',
    clue: 'nobody pays first',
    fence: false, rivals: 1,
    rows: [
      ["each family's share", `${RUPEE}5,000`],
      ['the first to pay', 'nobody'],
      ['the good', 'roads, defence, lights'],
      ['the gate', 'cannot be fenced'],
    ],
  },
  {
    id: 'veg',
    name: 'vegetables',
    clue: 'an ordinary swing',
    fence: true, rivals: 1,
    rows: [
      ['the swing', 'ordinary'],
      ['the cause', 'the season turned'],
      ['sellers', 'many'],
      ['anyone left without', 'no'],
    ],
  },
];

/** The stamp words the casefile header carries - the same three the stamps use, so one vocabulary. */
const KINDS = ['unfair price', 'unfair practice', 'missing provision'];

/**
 * The chapter's test, run on the case's own evidence. Returns the tool that answers it and the stamp
 * that names the failure it answers. Nothing here is stored per case, so the deck cannot be cleared by
 * remembering a label.
 */
function verdictFor(c) {
  if (!c.fence) return TOOL.provide;         // nobody can fence the gate -> missing provision
  if (c.rivals === 0) return TOOL.regulator; // one seller, no rival -> unfair practice
  if (c.reach || c.spike) return TOOL.cap;   // out of reach, or a sudden spike -> unfair price
  return TOOL.none;                          // nothing to answer -> none
}

/** How many of a case's tools have been called wrong so far - one number per struck-out chip. */
function ruledOut(list) {
  return list.length;
}

/* ------------------------------------------------------------------ the look */

const CSS = SIM_LOOK_DOM_CSS + `
.rt-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }
.rt-head { display: flex; align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }

/* ---- the hero: the five cases, side by side ---- */
.rt-deck { padding: var(--sim-space-2); transition: border-color .3s ease, box-shadow .3s ease; }
.rt-deck.is-solved { border-color: var(--sim-good); box-shadow: 0 var(--sim-lift) 0 var(--sim-good); }
.rt-cases { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--sim-space-2); }
.rt-case { display: flex; flex-direction: column; align-items: flex-start; gap: var(--sim-space-1);
  min-height: 76px; padding: var(--sim-space-2); box-sizing: border-box; cursor: pointer; text-align: left;
  font: 700 var(--sim-text-sm)/1.25 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-sm);
  transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
.rt-case:hover { border-color: var(--sim-accent); }
.rt-case:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.rt-case-name { font-size: var(--sim-text-md); font-weight: 800; }
.rt-clue { color: var(--sim-label-muted); }
.rt-case.is-open { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 10%, var(--sim-bg-surface)); }
.rt-case.is-open .rt-clue { color: var(--sim-label); }
.rt-case.is-stamped { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 12%, var(--sim-bg-surface)); }
.rt-case.is-fresh { animation: rt-pop .26s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes rt-pop { from { transform: scale(0.96); } to { transform: scale(1); } }
/* the stamp lands under the clue once the case is answered */
.rt-stamp { margin-top: auto; font-size: var(--sim-text-sm); font-weight: 800; color: var(--sim-good); }
.rt-stamp:empty { display: none; }

/* ---- the case on the table: the evidence the test is read off ---- */
.rt-file { padding: var(--sim-space-2) var(--sim-space-3) var(--sim-space-3); }
.rt-filehead { display: flex; align-items: center; justify-content: space-between; gap: var(--sim-space-2);
  flex-wrap: wrap; padding-bottom: var(--sim-space-1); }
.rt-filehead .sim-title { margin: 0; font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted); }
.rt-body { min-height: 84px; }
.rt-body.is-empty { display: flex; align-items: center; gap: var(--sim-space-2); }
.rt-empty { margin: 0; font: 700 var(--sim-text-md)/1.3 var(--sim-font); color: var(--sim-label-muted); }
.rt-rows { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--sim-space-1) var(--sim-space-3); }
/* the fields carry this scene's own short labels, so they sit at the 14px floor and stay one line */
.rt-rows .sim-field { font-size: var(--sim-text-sm); padding: var(--sim-space-1) var(--sim-space-2); }

/* a wrong call shakes the file once - finite, so the scene comes to rest on its own */
.rt-file.is-wrong .rt-body { animation: rt-shake .42s ease both; }
@keyframes rt-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); }
  45% { transform: translateX(5px); } 70% { transform: translateX(-3px); } }

/* ---- the four tools ---- */
.rt-tools { margin-top: var(--sim-space-2); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--sim-space-2); }
.rt-tool { padding: var(--sim-space-1) var(--sim-space-3); cursor: pointer; text-align: left;
  font: 800 var(--sim-text-sm)/1.3 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-pill);
  transition: background-color .18s ease, border-color .18s ease, color .18s ease; }
/* hover must never repaint a chip that already carries a verdict, or the chip under the cursor would
   turn blue the moment it is called wrong */
.rt-tool:hover:not([disabled]):not(.is-tried):not(.is-called) { border-color: var(--sim-accent); color: var(--sim-accent); }
.rt-tool:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.rt-tool[disabled] { cursor: default; color: var(--sim-label-muted); border-style: dashed; background: transparent; }
.rt-tool.is-called { border-color: var(--sim-good); color: var(--sim-good);
  background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); }
/* a wrong tool glows red and greys out - for this case only, so the case stays open for a free retry */
.rt-tool.is-tried { border-color: var(--sim-bad); color: var(--sim-bad); text-decoration: line-through;
  background: color-mix(in oklab, var(--sim-bad) 12%, var(--sim-bg-surface)); }

/* ---- the status line ---- */
.rt-status { margin: 0; min-height: 1.3em; font: 800 var(--sim-text-md)/1.3 var(--sim-font);
  color: var(--sim-label-muted); }
.rt-status.is-right { color: var(--sim-good); }
.rt-status.is-wrong { color: var(--sim-bad); }

/* ---- the strip: how many cases are stamped, and the replay ---- */
/* .sim-card is already a flex column, so the strip has to say row itself */
.rt-strip { padding: var(--sim-space-2) var(--sim-space-3); display: flex; flex-direction: row;
  align-items: center; gap: var(--sim-space-2); flex-wrap: wrap; }
/* two classes, so this wins over the kit's own .sim-record on order alone. The pips carry the case's
   number, not its name: five names never fit beside the counter and the replay button at this width. */
.sim-record.rt-record { flex: 1 1 200px; grid-template-columns: repeat(5, minmax(0, 1fr)); margin: 0;
  padding: var(--sim-space-1); gap: var(--sim-space-1); }
.sim-record.rt-record .sim-record__step { font-size: var(--sim-text-sm); font-weight: 800;
  color: var(--sim-label-muted); padding: var(--sim-space-1) 2px; }
.sim-record.rt-record .sim-record__step.is-done { color: var(--sim-good); border-color: var(--sim-good);
  background: color-mix(in oklab, var(--sim-good) 14%, transparent); }
.rt-count { margin: 0; font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label-muted);
  font-variant-numeric: tabular-nums; white-space: nowrap; }
.rt-btn { height: 40px; box-sizing: border-box; padding: 0 var(--sim-space-3); cursor: pointer;
  font: 800 var(--sim-text-md)/1 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-pill);
  transition: background-color .18s ease, border-color .18s ease, color .18s ease; }
.rt-btn:hover { border-color: var(--sim-accent); color: var(--sim-accent); }
.rt-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }

/* portrait: one case per row, the fields stack, the tools stay full width, the record shows numbers */
.sim-dom-root--portrait .rt-cases { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .rt-case { min-height: 0; flex-direction: row; align-items: center; gap: var(--sim-space-2); }
.sim-dom-root--portrait .rt-clue { margin-left: auto; text-align: right; }
.sim-dom-root--portrait .rt-stamp { margin-top: 0; }
.sim-dom-root--portrait .rt-rows { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .rt-body { min-height: 0; }
.sim-dom-root--portrait .rt-tools { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .rt-record { flex: 1 1 100%; }
`;

/* ------------------------------------------------------------------ the scene */

export class RefereeToolkitScene extends withChallenge(DomSimulation) {
  static WIDTH = 680;
  static HEIGHT = 600;              // sim-layout on the finished deck: the open casefile state
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 1180;    // sim-layout portrait: five cases stacked plus the file and tools
  static ARIA_LABEL =
    'Five cases from the chapter in a row - a medicine course priced beyond reach, a pandemic with sudden '
    + 'price spikes, a telecom price hike by a single seller, a village park nobody will pay for, and an '
    + 'ordinary vegetable price swing. Tapping a case opens its evidence above four response buttons: cap the '
    + 'price, set a floor or send a regulator, provide the good directly, or leave the market alone. A wrong '
    + 'button is struck out for that case and the case stays open; a right one lights the case and stamps the '
    + 'failure it answers. The deck is solved when all five cases are stamped.';
  static OBJECTIVE = {
    prompt: {
      en: 'Match each scenario to the right response: cap the price, set a floor or send a regulator, provide '
        + 'the good directly, or leave the market alone. Win when each call passes the chapter\u2019s test \u2014 does '
        + 'the market fail on fairness, on missing provision, or on unfair practice?',
    },
  };
  // Judged against an exact 5 of 5, so there is nothing here for a numeric tolerance to soften.
  static SCORING = { mode: 'accuracy', tolerance: 0, maxAttempts: Infinity };
  static CONTROLS = [];             // the case and the tool are in-panel buttons, as the stub describes them

  constructor(container, config) {
    super(container, config);
    this._open = null;               // the case the learner has open, null before the first tap
    this._picked = {};               // toolId -> the case it was called on (the right calls only)
    this._tried = {};                // caseId -> [toolIds called wrong on it]
    this._called = false;            // has any tool been called at all (what there is to judge)
    this._msg = null;                // { text, tone } for the status line
    this._celebrated = false;        // confetti fires once per solve
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="rt-root">
          <div class="rt-head">
            <span class="sim-tag sim-tag--accent">pick the referee\u2019s tool</span>
            <span class="sim-tag">five cases, one test</span>
          </div>

          <div class="sim-card rt-deck" data-deck>
            <div class="rt-cases" role="group" aria-label="Choose a case to answer">
              ${CASES.map((c, i) => `
                <button type="button" class="rt-case" data-case="${i}" aria-pressed="false"
                  aria-label="${esc(`${c.name}: ${c.clue}`)}">
                  <span class="rt-case-name">${esc(c.name)}</span>
                  <span class="rt-clue">${esc(c.clue)}</span>
                  <span class="rt-stamp" data-stamp="${i}"></span>
                </button>`).join('')}
            </div>

            <div class="sim-card rt-file" data-file>
              <div class="rt-filehead">
                <span class="sim-title">the test</span>
                ${simTags(KINDS)}
              </div>
              <div class="rt-body is-empty" data-body>
                <span class="sim-q" aria-hidden="true">?</span>
                <p class="rt-empty">tap a case to open its evidence</p>
              </div>
            </div>

            <div class="rt-tools" role="group" aria-label="Your response">
              ${TOOLS.map((t) => `
                <button type="button" class="rt-tool" data-tool="${t.id}" aria-pressed="false" disabled>
                  <span class="rt-long">${esc(t.label)}</span>
                </button>`).join('')}
            </div>
          </div>

          <p class="rt-status" data-status role="status" aria-live="polite">tap a case, then the tool it needs</p>

          <div class="sim-card rt-strip">
            <ol class="sim-record rt-record" data-record aria-label="Cases stamped so far">
              ${CASES.map((c, i) => `<li class="sim-record__step" data-pip="${i}" title="${esc(c.name)}">${i + 1}</li>`).join('')}
            </ol>
            <p class="rt-count" data-count>0 of ${CASES.length} stamped</p>
            <button type="button" class="rt-btn" data-new>new deck</button>
          </div>

          ${noteLineHtml([
            { text: 'every case and every figure is one of this chapter\u2019s own; the tools are the four the lesson names.' },
          ])}
        </div>`,
    });

    this._el = {
      root: this.root?.querySelector?.('.rt-root'),
      deck: this.root?.querySelector?.('[data-deck]'),
      file: this.root?.querySelector?.('[data-file]'),
      body: this.root?.querySelector?.('[data-body]'),
      status: this.root?.querySelector?.('[data-status]'),
      count: this.root?.querySelector?.('[data-count]'),
      newBtn: this.root?.querySelector?.('[data-new]'),
      cases: CASES.map((_, i) => this.root?.querySelector?.(`button[data-case="${i}"]`)),
      stamps: CASES.map((_, i) => this.root?.querySelector?.(`[data-stamp="${i}"]`)),
      pips: CASES.map((_, i) => this.root?.querySelector?.(`[data-pip="${i}"]`)),
      tools: TOOLS.map((t) => this.root?.querySelector?.(`button[data-tool="${t.id}"]`)),
    };

    // One delegated click: the five case cards and the four tool chips are the whole game.
    this.root?.addEventListener?.('click', (ev) => {
      const fresh = ev.target?.closest?.('[data-new]');
      if (fresh) { this._newDeck(); return; }
      const tool = ev.target?.closest?.('button[data-tool]');
      if (tool) { this._callTool(tool.dataset.tool); return; }
      const card = ev.target?.closest?.('button[data-case]');
      if (card) this._openCase(Number(card.dataset.case));
    });

    this._paint();
  }

  /* ------------------------------------------------------------------ the two taps */

  /**
   * Opening a case is free and never loses anything: it just reads the evidence into the file. An
   * already-answered case reopens with its stamp on it, so the learner can re-read a case they cleared.
   */
  _openCase(i) {
    if (!Number.isInteger(i) || !CASES[i]) return;
    this._open = i;
    const c = CASES[i];
    const done = this._picked[c.id];
    this._msg = done
      ? { text: `${c.name}: already stamped ${done}`, tone: 'right' }
      : { text: `${c.name} is open \u2014 which tool answers it?`, tone: null };
    this._paint({ fresh: i });
  }

  /**
   * The call. A tool is answered against the case's own evidence, never against a stored answer: the
   * right tool lights the case and stamps the failure, a wrong one is struck out for that case alone and
   * the case stays open.
   */
  _callTool(toolId) {
    if (this._open == null) return;
    const c = CASES[this._open];
    const want = verdictFor(c);
    const tried = this._tried[c.id] || (this._tried[c.id] = []);

    if (toolId === want.id) {
      this._picked[c.id] = want.stamp;
      this._called = true;
      // The deck walks itself forward: the next case's evidence opens, so the tools are never a dead
      // grey row and the learner keeps going. The card just answered keeps its stamp.
      const next = this._nextOpen(this._open);
      const left = CASES.filter((x) => !this._picked[x.id]).length;
      this._open = next;
      this._msg = next == null
        ? { text: `${want.label} answers this one \u2014 ${want.stamp}`, tone: 'right' }
        : { text: `${want.stamp} stamped \u2014 next case open, ${left} to go`, tone: 'right' };
      this._paint({ fresh: next });
      this._score();
      return;
    }

    if (!tried.includes(toolId)) tried.push(toolId);
    this._called = true;
    // kept to one line at the design width: the struck-out chip already says which tool was wrong.
    this._msg = { text: `not that one \u2014 ${ruledOut(tried)} ruled out here`, tone: 'wrong' };
    this._paint({ shake: true });
    this._score();
  }

  /**
   * The next case still waiting for an answer, searching on from the one just answered and wrapping
   * once. null only when every case carries its stamp, which is the deck's one dead state.
   */
  _nextOpen(from) {
    for (let k = 1; k <= CASES.length; k += 1) {
      const j = (from + k) % CASES.length;
      if (!this._picked[CASES[j].id]) return j;
    }
    return null;
  }

  /** Replay: the same five cases, nothing carried over. The attempt history stays with the wrapper. */
  _newDeck() {
    this._open = null;
    this._picked = {};
    this._tried = {};
    this._called = false;
    this._msg = null;
    this._celebrated = false;
    this._paint();
    this._score();
  }

  /** Hand the count to the challenge wrapper, then celebrate the first time it comes back solved. */
  _score() {
    const res = this.evaluate();
    if (res.solved && !this._celebrated) {
      this._celebrated = true;
      burst(this._el?.deck);          // the confetti lands on the deck as its border turns green
    } else if (!res.solved) {
      this._celebrated = false;
    }
  }

  /**
   * The stub's rule: value is how many cases carry the stamp the test gave them, target is the deck.
   * null until a tool has been called - an untouched deck cannot be judged.
   */
  checkObjective() {
    if (!this._called) return null;
    const stamped = CASES.filter((c) => this._picked[c.id]).length;
    return { value: stamped, target: CASES.length };
  }

  /* ------------------------------------------------------------------ the paint */

  /** Every visible thing, from four sets of state. No drawing in prose. */
  _paint(opts = {}) {
    if (!this._el?.root) return;
    const c = this._open == null ? null : CASES[this._open];
    const done = c ? this._picked[c.id] : null;
    const stamped = CASES.filter((x) => this._picked[x.id]).length;
    const solved = stamped === CASES.length;

    CASES.forEach((x, i) => {
      const btn = this._el.cases[i];
      if (btn) {
        const open = this._open === i;
        btn.classList.toggle('is-open', open);
        btn.classList.toggle('is-stamped', !!this._picked[x.id]);
        btn.setAttribute('aria-pressed', open ? 'true' : 'false');
        if (i === (opts.fresh ?? -1)) {
          btn.style.animation = 'none';
          void btn.offsetWidth;
          btn.style.animation = '';
        }
      }
      const stamp = this._el.stamps[i];
      if (stamp) stamp.textContent = this._picked[x.id] ? this._picked[x.id] : '';
      this._el.pips[i]?.classList.toggle('is-done', !!this._picked[x.id]);
    });

    // the case file: the open case's own evidence rows, or the dashed "nothing open" state.
    const body = this._el.body;
    if (body) {
      if (c) {
        body.className = 'rt-body';
        body.innerHTML = `<div class="rt-rows">${c.rows
          .map(([label, value]) => simField(label, value)).join('')}</div>`;
      } else {
        body.className = 'rt-body is-empty';
        body.innerHTML = '<span class="sim-q" aria-hidden="true">?</span>'
          + '<p class="rt-empty">tap a case to open its evidence</p>';
      }
    }

    // the tools: live only with a case open, and a wrong one struck out for this case alone.
    const tried = c ? this._tried[c.id] || [] : [];
    TOOLS.forEach((t) => {
      const btn = this._el.tools[TOOLS.indexOf(t)];
      if (!btn) return;
      const called = done === t.stamp;
      btn.disabled = !c || !!done;
      btn.classList.toggle('is-called', called);
      btn.classList.toggle('is-tried', !called && tried.includes(t.id));
      btn.setAttribute('aria-pressed', called ? 'true' : 'false');
    });

    this._el.deck?.classList.toggle('is-solved', solved);
    if (this._el.count) {
      this._el.count.textContent = solved
        ? `all ${CASES.length} stamped`
        : `${stamped} of ${CASES.length} stamped`;
    }

    const s = this._el.status;
    if (s) {
      s.textContent = solved
        ? 'every case stamped \u2014 the test answers all five'
        : (this._msg?.text || 'tap a case, then the tool it needs');
      s.classList.toggle('is-right', solved || this._msg?.tone === 'right');
      s.classList.toggle('is-wrong', this._msg?.tone === 'wrong');
    }

    if (opts.shake && this._el.file) {
      this._el.file.classList.remove('is-wrong');
      void this._el.file.offsetWidth;
      this._el.file.classList.add('is-wrong');
    }
  }
}
