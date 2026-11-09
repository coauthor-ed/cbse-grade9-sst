// ForwardCheckGame - blk-l07-game-forward. The figure is a phone: six messages arrive on it, all
// invented and about nothing real. Tap what makes you doubt the message (or Nothing looks wrong), then choose Share or Check.
// One message is sound, so Check is a decision and not a reflex. No party, no real event.
// Control names: .part[data-i], .none, .act[data-a="share"], .act[data-a="check"], .next.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const ROUNDS = [
  { title: 'A school holiday', parts: [['From an unknown number', 1, 'You cannot tell who wrote it, so you cannot ask them.'], ['All schools closed for 10 days', 0, 'This may or may not be true. Look for a sign about the message itself.'], ['Forward to all parents NOW!!!', 1, 'A message that rushes you wants you to share it before you think.']], key: 'check', how: 'Ask your teacher, or look at the school notice board.' },
  { title: 'A miracle cure', parts: [['My uncle read this somewhere', 1, 'No one can say where it came from.'], ['A seed from the hills', 0, 'Nothing is wrong with a seed. Look for what makes the claim doubtful.'], ['Cures every illness in 3 days', 1, 'A claim this large needs strong proof, and none is given.']], key: 'check', how: 'Ask a doctor or a health worker.' },
  { title: 'A voting date', parts: [['Voting day has moved', 0, 'This could happen, so it must be checked. Look for what is missing.'], ['Everybody is saying so', 1, 'Many people saying it does not make it true.'], ['No notice from the Election Commission', 1, 'Polling dates come from the Election Commission, and no notice is shown.']], key: 'check', how: 'Look at a notice from the Election Commission.' },
  { title: 'A notice at school', parts: [['Notice signed by the Principal', 0, ''], ['Term test starts on Monday', 0, ''], ['Also on the school notice board', 0, '']], key: 'share', how: 'It names who wrote it, and you can see it for yourself.' },
  { title: 'A photo', parts: [['Photo from our town yesterday!', 0, 'That is what it claims. Look for what would prove it.'], ['No place or date on the photo', 1, 'An old photo from another place can be passed off as new.'], ['Share before it gets deleted', 1, 'This pushes you to share in a hurry, before you check.']], key: 'check', how: 'Search for where the photo first came from.' },
  { title: 'A new rule', parts: [["A friend's cousin works in the office", 1, 'This is second-hand, so nobody can be asked about it.'], ['All students must pay a new fine', 0, 'This may or may not be true. Look for where it came from.'], ['No office or order is named', 1, 'A real rule names who made it.']], key: 'check', how: 'Ask the office that would make such a rule.' },
];

const CSS = `
.gm.fc { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 16px 10px; gap: 8px; }
.fc .gm-head { display: flex; align-items: center; gap: 16px; max-width: none; padding-right: 70px; }
.fc .kicker { display: none; }
.fc .gm-head h2 { font-size: 22px; margin: 0; }
.fc .dots { display: flex; gap: 6px; }
.fc .dot { width: 16px; height: 16px; border-radius: 50%; background: var(--sim-track); }
.fc .dot[data-on="1"] { background: var(--sim-good); }
.fc .board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 20px; flex: 1; min-height: 0; align-items: start; }
.fc .phone { padding: 12px 10px 10px; border-radius: 30px; background: color-mix(in oklab, var(--sim-label) 88%, var(--sim-bg-deep)); }
.fc .screen { display: flex; flex-direction: column; border-radius: 20px; overflow: hidden; background: var(--sim-bg-surface); }
.fc .bar { display: flex; align-items: center; gap: 10px; padding: 7px 14px; background: var(--sim-accent); color: var(--sim-bg-surface); }
.fc .bar i { flex: none; width: 26px; height: 26px; border-radius: 50%; background: var(--sim-bg-surface); opacity: 0.7; }
.fc .bar h3 { margin: 0; font: 700 18px/1.2 var(--sim-font-display); }
.fc .msg { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 10px 12px 12px; }
.fc .part { max-width: 100%; min-height: 48px; padding: 8px 14px; font-size: 17px; font-weight: 700; line-height: 1.2; text-align: left; color: var(--sim-label);
  background: var(--sim-bg-cell); border: var(--sim-border); border-radius: 4px 16px 16px 16px; box-shadow: none; }
.fc .part[data-state="sign"] { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 22%, var(--sim-bg-surface)); }
.fc .part[data-state="no"] { opacity: 0.7; }
.fc .side { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.fc .why { order: -1; margin: 0; padding-right: 58px; min-height: 70px; display: flex; align-items: center; font-size: 18px; font-weight: 700; line-height: 1.3; }
.fc .none, .fc .next { min-height: 52px; padding: 6px 14px; font-size: 17px; font-weight: 800; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--look-pill); }
.fc .acts { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
.fc .act { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 68px; padding: 6px 12px; font: 700 23px/1.1 var(--sim-font-display); background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); }
.fc .act svg { flex: none; width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
.fc .act[disabled] { opacity: 0.5; cursor: default; }
.fc .next { display: none; background: var(--sim-accent); color: var(--sim-bg-surface); border: 0; }
.fc .next[data-on="1"] { display: block; }
.fc .next[data-on="1"] ~ .none { display: none; }
.sim-dom-root--portrait .gm.fc { padding: 4px 4px 8px; }
.sim-dom-root--portrait .fc .gm-head { flex-wrap: wrap; gap: 4px 12px; padding-right: 58px; }
.sim-dom-root--portrait .fc .board { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .fc .why { order: 0; padding-right: 0; min-height: 66px; font-size: 16px; }
.sim-dom-root--portrait .fc .part { font-size: 16px; }
`;

const SHARE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5l7 7-7 7M21 12H9a6 6 0 0 0-6 6"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="M16 16l5 5"/></svg>';

export class ForwardCheckGame extends GameBoard {
  static ARIA_LABEL = 'A game of six invented messages on a phone. Tap what makes you doubt each message, or say that nothing looks wrong, then choose Share or Check.';
  static OBJECTIVE = { prompt: { en: 'For each message, find what makes you doubt it, then choose Share or Check.' } };

  constructor(container, config) { super(container, config); this._r = 0; this._found = false; this._seen = {}; this._acted = false; this._done = false; this._won = 0; }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false,
      css: CSS,
      html: `<div class="gm fc">
        <div class="gm-head"><p class="kicker">Before you forward</p><h2>Share or check?</h2><div class="dots">${ROUNDS.map(() => '<span class="dot"></span>').join('')}</div></div>
        <div class="board">
          <div class="phone"><div class="screen"><div class="bar"><i></i><h3 class="ttl"></h3></div><div class="msg"></div></div></div>
          <div class="side">
            <div class="acts"><button type="button" class="tap act" data-a="share">${SHARE}Share</button><button type="button" class="tap act" data-a="check">${CHECK}Check</button></div>
            <button type="button" class="tap next">Next message</button>
            <button type="button" class="tap none">Nothing looks wrong</button>
            <p class="why" aria-live="polite"></p>
          </div>
        </div>
      </div>`,
    });
    const none = this.root.querySelector('.none'), next = this.root.querySelector('.next');
    if (!none || !next) return;   // the headless harness has no HTML parser
    onTap(none, () => this._none());
    this.root.querySelectorAll('.act').forEach((el) => onTap(el, () => this._act(el.dataset.a)));
    onTap(next, () => this._next());
    this._deal();
  }

  _deal() {
    const r = ROUNDS[this._r], msg = this.root.querySelector('.msg');
    if (!msg) return;
    this._found = false; this._seen = {}; this._acted = false;
    this.root.querySelector('.ttl').textContent = r.title;
    msg.innerHTML = r.parts.map((p, i) => `<button type="button" class="tap part" data-i="${i}">${esc(p[0])}</button>`).join('');
    msg.querySelectorAll('.part').forEach((el) => onTap(el, () => this._part(Number(el.dataset.i), el)));
    this._say('Tap what makes you doubt it.');
    this._controls();
    this.root.querySelectorAll('.dot').forEach((d, i) => { d.dataset.on = i < this._won ? '1' : '0'; });
  }

  _controls() {
    this.root.querySelectorAll('.act').forEach((b) => { b.disabled = !this._found || this._acted; });
    const n = this.root.querySelector('.next'); n.dataset.on = this._acted ? '1' : '0';
    n.textContent = this._r === ROUNDS.length - 1 ? 'Finish' : 'Next message';
    this.root.querySelector('.none').disabled = this._found;
  }

  _say(t) { const w = this.root.querySelector('.why'); if (w) w.textContent = t; }

  _part(i, el) {
    if (this._acted) return;
    const p = ROUNDS[this._r].parts[i];
    if (p[1]) { el.dataset.state = 'sign'; this._found = true; this._say(p[2] + ' Now choose.'); }
    else if (!ROUNDS[this._r].parts.some((x) => x[1])) { this._say('This part looks sound. If nothing looks wrong, say so.'); }
    else { el.dataset.state = 'no'; this._say(p[2]); }
    this._controls();
  }

  _none() {
    const r = ROUNDS[this._r];
    if (r.parts.some((x) => x[1])) { this._say('Look again. Something here should make you stop.'); return; }
    this._found = true; this._say('You can see who wrote it and where it is posted. Now choose.');
    this._controls();
  }

  _act(a) {
    const r = ROUNDS[this._r];
    if (!this._found || this._acted) return;
    if (a !== r.key) { this._say(r.key === 'check' ? 'You found a reason to doubt it, so sharing it now could mislead others.' : 'You can check this one yourself, and nothing looks wrong, so it is fine to share.'); return; }
    this._acted = true; this._won += 1;
    this._say(r.how);
    this._controls();
    this.root.querySelectorAll('.dot').forEach((d, i) => { d.dataset.on = i < this._won ? '1' : '0'; });
  }

  _next() {
    if (!this._acted) return;
    if (this._r < ROUNDS.length - 1) { this._r += 1; this._deal(); return; }
    this._done = true;
    this._say('All six messages are done.');
    this.root.querySelector('.next').dataset.on = '0';
    this.quill?.perform('hop');
    finishGame(this);
  }

  checkObjective() { return this._done ? { ok: true } : null; }

  resetChallenge() { super.resetChallenge(); this._r = 0; this._won = 0; this._done = false; this._deal(); }
}
