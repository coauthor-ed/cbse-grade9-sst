// NeedOrWantGame - L01 game (blk-l01-game): sort each card by the job the thing does, Need or Want.
//   One big card at a time: a thing and its situation in a few words. Pairs of the same thing appear in two
//   situations (bicycle to school / for weekend fun; water to drink / a flavoured drink; shoes for school / a
//   third pair; a phone for a parent's work calls / a newer phone). The same icon on both cards of a pair.
//   Tap Need or Want. Right: the card drops into that bin as a chip and a one-line reason confirms it.
//   Wrong: the bin shakes, a one-line reason says why, and the card stays for another try (counted).
//   Round 1 is the four pairs above (8 cards); Play again deals 4 of the 6 pairs. Order: Math.random.
//   Win: every card sorted -> finishGame -> checkObjective { ok: true }. The bins never show the answer before
//   a tap. Quill: the frame's corner Quill is removed (the host's verdict strip has him), nothing on the board.
// Colours are tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const PAIRS = [
  { icon: 'bike', tone: 2,
    need: { obj: 'Bicycle', sit: 'to ride to school every day', chip: 'bicycle: school', why: 'It takes her to school every day. That is a need.' },
    want: { obj: 'Bicycle', sit: 'only for fun at the weekend', chip: 'bicycle: fun', why: 'Only for fun. Life is nicer with it, but she can do without it.' } },
  { icon: 'glass', tone: 1,
    need: { obj: 'Water', sit: 'to drink', chip: 'water to drink', why: 'Nobody can live without drinking water. That is a need.' },
    want: { obj: 'Flavoured drink', sit: 'a bottle from the shop', chip: 'flavoured drink', why: 'It tastes nice, but plain water does the job. That is a want.' } },
  { icon: 'shoe', tone: 3,
    need: { obj: 'Shoes', sit: 'one pair, for school', chip: 'shoes: school', why: 'She needs shoes to walk to school. That is a need.' },
    want: { obj: 'Shoes', sit: 'a third pair, for fashion', chip: 'shoes: third pair', why: 'She has two pairs already. A third pair is a want.' } },
  { icon: 'phone', tone: 7,
    need: { obj: 'Phone', sit: 'for a parent\'s work calls', chip: 'phone: work calls', why: 'The family earns its money through these calls. That is a need.' },
    want: { obj: 'Phone', sit: 'a newer one, bigger screen', chip: 'phone: bigger screen', why: 'The old phone still makes calls. A bigger screen is a want.' } },
  { icon: 'pot', tone: 5,
    need: { obj: 'Rice and dal', sit: 'for dinner', chip: 'rice and dal', why: 'Food keeps us alive. That is a need.' },
    want: { obj: 'Chips', sit: 'a third packet today', chip: 'chips: third packet', why: 'Tasty, but nobody needs a third packet to live. That is a want.' } },
  { icon: 'sweater', tone: 6,
    need: { obj: 'Sweater', sit: 'to keep warm in winter', chip: 'sweater: winter', why: 'It keeps her warm in the cold. That is a need.' },
    want: { obj: 'Sweater', sit: 'a new one, only for its colour', chip: 'sweater: colour', why: 'She has a warm one already. A new colour is a want.' } },
];
const FIRST = [0, 1, 2, 3];

/** Icons SimIcons does not have, on its 48 grid in its three shades (b base, d dark, l light). */
const OWN = {
  bike: [
    ['M12 36m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0zM12 36m-4.5 0a4.5 4.5 0 1 1 9 0a4.5 4.5 0 1 1-9 0z', 'd'],
    ['M36 36m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0zM36 36m-4.5 0a4.5 4.5 0 1 1 9 0a4.5 4.5 0 1 1-9 0z', 'd'],
    ['M11 35l8-15h15l3 15h-4l-2.5-11H21l-6.5 12zM20 22l6 13 7-13h-3l-4 8-3.5-8z', 'b'],
    ['M16 15h9v4h-9zM31 14h7v4h-7z', 'l'],
  ],
  shoe: [
    ['M5 26c0-4 3-9 7-9h6l4 6c4 2 12 3 18 4 4 1 4 5 4 8v2H5z', 'b'], ['M5 37h39v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z', 'd'],
    ['M18 22l3-2M21 25l3-2M24 27l3-2', 'l'], ['M10 22h5v4h-5z', 'l'],
  ],
  sweater: [
    ['M16 8l-11 8 4 10 5-3v19h20V23l5 3 4-10-11-8c-1 4-4 6-8 6s-7-2-8-6z', 'b'],
    ['M14 36h20v6H14z', 'd'], ['M5 16l4 10 4-2.5-4-10z', 'd'], ['M43 16l-4 10-4-2.5 4-10z', 'd'], ['M20 9c1 3 2 4 4 4s3-1 4-4', 'l'],
  ],
};
const shadeOf = (k) => (k === 'd' ? 'color-mix(in oklab, var(--i) 64%, black)' : k === 'l' ? 'color-mix(in oklab, var(--i) 45%, white)' : 'var(--i)');
function icon(name, tone, cls = 'nw-ic') {
  if (!OWN[name]) return iconSvg(name, tone).replace('class="sim-icon"', `class="sim-icon ${cls}"`);
  return `<svg class="sim-icon ${cls}" viewBox="0 0 48 48" aria-hidden="true" style="--i:var(--sim-series-${tone})">${OWN[name].map(([d, k]) => `<path d="${d}" style="fill:${shadeOf(k)}${k === 'l' && name === 'shoe' && d.startsWith('M18') ? ';stroke:' + shadeOf('l') + ';stroke-width:2' : ''}"/>`).join('')}</svg>`;
}

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** A round: the cards of these pairs, in a random order. */
function deal(pairIdx) {
  const cards = [];
  for (const p of pairIdx) for (const kind of ['need', 'want']) cards.push({ id: `${p}-${kind}`, pair: p, kind, ...PAIRS[p][kind], icon: PAIRS[p].icon, tone: PAIRS[p].tone });
  return shuffled(cards);
}

const CSS = `
.nw .nw-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 380px minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: stretch; }
.nw .nw-stage { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.nw .nw-card { position: relative; display: grid; grid-template-columns: 76px minmax(0, 1fr); align-items: center; gap: 14px; padding: 14px 16px;
  background: var(--sim-bg-surface); border: calc(3px * var(--look-rim, 1)) solid var(--c); border-radius: var(--sim-radius-lg);
  box-shadow: 0 calc(5px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--c) 70%, var(--sim-label)); }
.nw .nw-card.nw-new { animation: nw-in 0.45s var(--look-spring-soft, ease-out) both; }
@keyframes nw-in { from { transform: translateY(-14px) scale(0.94); opacity: 0; } to { transform: none; opacity: 1; } }
.nw .nw-card .nw-ic { width: 76px; height: 76px; }
.nw .nw-obj { font: 800 27px/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); margin: 0 0 4px; }
.nw .nw-sit { font: 700 19px/1.3 var(--sim-font); color: var(--sim-label); margin: 0; }
.nw .nw-count { font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.nw .nw-say { margin: 0; min-height: 50px; font: 700 17px/1.35 var(--sim-font); color: var(--sim-label); }
.nw .nw-say[data-tone="good"] { color: var(--sim-good); }
.nw .nw-say[data-tone="bad"] { color: var(--sim-bad); }
.nw .nw-bin { display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; gap: 6px; text-align: left;
  padding: 10px 12px; min-height: 120px; border-radius: var(--sim-radius-lg); border-style: dashed; }
.nw .nw-bin:active { transform: translateY(calc(2px * var(--look-lip, 1))); }
.nw .nw-bin[data-flash="bad"] { border-color: var(--sim-bad); border-style: solid; animation: nw-shake 0.4s ease both; }
.nw .nw-bin[data-flash="good"] { border-color: var(--sim-good); border-style: solid; }
@keyframes nw-shake { 25% { transform: translateX(-6px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-3px); } }
.nw .nw-bl { font: 800 26px/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.nw .nw-bsub { font: 700 15px/1.25 var(--sim-font); color: var(--sim-label-muted); }
.nw .nw-chips { display: flex; flex-direction: column; gap: 5px; margin-top: 2px; }
.nw .nw-chip { display: flex; align-items: center; gap: 6px; padding: 2px 8px 2px 4px; border-radius: var(--sim-radius-sm);
  background: var(--sim-bg-deep); border: calc(1.5px * var(--look-rim, 1)) solid color-mix(in oklab, var(--c) 60%, var(--sim-stroke));
  font: 700 15px/1.25 var(--sim-font); color: var(--sim-label); }
.nw .nw-chip .nw-mini { width: 26px; height: 26px; flex: none; }
.nw .nw-chip.nw-pop { animation: nw-in 0.4s ease-out both; }
.nw .nw-again { align-self: flex-start; min-height: 48px; }
.nw .nw-again[hidden] { display: none; }
.sim-dom-root--portrait .nw .nw-body { display: flex; flex-direction: column; gap: 10px; }
.sim-dom-root--portrait .nw .nw-bins { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .nw .nw-card { grid-template-columns: 60px minmax(0, 1fr); gap: 10px; padding: 10px 12px; }
.sim-dom-root--portrait .nw .nw-card .nw-ic { width: 60px; height: 60px; }
.sim-dom-root--portrait .nw .nw-obj { font-size: 23px; }
.sim-dom-root--portrait .nw .nw-sit { font-size: 17px; }
.sim-dom-root--portrait .nw .nw-say { min-height: 44px; font-size: 16px; }
.sim-dom-root--portrait .nw .nw-bin { min-height: 104px; padding: 8px; }
.sim-dom-root--portrait .nw .nw-bl { font-size: 23px; }
.sim-dom-root--portrait .nw .nw-bsub { font-size: 14px; }
.sim-dom-root--portrait .nw .nw-chip { font-size: 14px; padding: 2px 6px 2px 3px; }
.sim-dom-root--portrait .nw .nw-chip .nw-mini { width: 22px; height: 22px; }
.nw .nw-bins { display: contents; }
`;

export class NeedOrWantGame extends GameBoard {
  static HEIGHT = 360;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Sort each card: is it doing the job of a need or of a want? Careful: the same thing appears twice, in two different situations.' } };
  static ARIA_LABEL = 'Need or want: one card at a time names a thing and its situation, such as a bicycle to ride to school, or the same bicycle only for weekend fun. Tap Need or Want. A wrong choice gives a one-line reason.';

  async setup() {
    this.round = 0;
    this.newRound(FIRST);
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm nw"><div class="gm-head"><h2>Need or want?</h2><p class="sub">Look at the job the thing does here.</p></div>
        <div class="nw-body">
          <div class="nw-stage"><div class="nw-slot"></div><span class="nw-count"></span><p class="nw-say" aria-live="polite"></p>
            <button type="button" class="tap btn nw-again" hidden>Play again</button></div>
          <div class="nw-bins">
            <button type="button" class="tap btn nw-bin" data-bin="need"><span class="nw-bl">Need</span><span class="nw-bsub">we must have it to live</span><span class="nw-chips"></span></button>
            <button type="button" class="tap btn nw-bin" data-bin="want"><span class="nw-bl">Want</span><span class="nw-bsub">it makes life nicer</span><span class="nw-chips"></span></button>
          </div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.root.querySelectorAll?.('.nw-bin')?.forEach((b) => onTap(b, () => this.sort(b.dataset.bin)));
    const again = this.root.querySelector?.('.nw-again');
    if (again) onTap(again, () => this.playAgain());
    this.draw(true);
  }

  newRound(pairIdx) {
    this.deck = deal(pairIdx);
    this.idx = 0;
    this.placed = { need: [], want: [] };
    this.misses = 0;
    this.missed = new Set();
    this.won = false;
    this._flashT && clearTimeout(this._flashT);
  }

  get card() { return this.deck[this.idx] ?? null; }

  draw(fresh = false, popKey = null) {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.nw-slot') || !q('.nw-count') || !q('.nw-again')) return;
    const c = this.card;
    q('.nw-slot').innerHTML = c
      ? `<div class="nw-card${fresh ? ' nw-new' : ''}" style="--c:var(--sim-series-${c.tone})">${icon(c.icon, c.tone)}<div><p class="nw-obj">${c.obj}</p><p class="nw-sit">${c.sit}</p></div></div>`
      : '';
    q('.nw-count').textContent = c ? `Card ${this.idx + 1} of ${this.deck.length}` : `All ${this.deck.length} sorted${this.misses ? `, ${this.misses} fixed on the way` : ''}`;
    for (const bin of ['need', 'want']) {
      const el = q(`.nw-bin[data-bin="${bin}"]`);
      if (!el) continue;
      el.querySelector('.nw-chips').innerHTML = this.placed[bin].map((k) => `<span class="nw-chip${k.id === popKey ? ' nw-pop' : ''}" style="--c:var(--sim-series-${k.tone})">${icon(k.icon, k.tone, 'nw-mini')}${k.chip}</span>`).join('');
      el.setAttribute('aria-label', `${bin === 'need' ? 'Need' : 'Want'}: ${this.placed[bin].length} cards${c ? `. Put "${c.obj}, ${c.sit}" here` : ''}`);
      if (this.won) el.setAttribute('aria-disabled', 'true'); else el.removeAttribute('aria-disabled');
    }
    q('.nw-again').hidden = !this.won;
    this.relayout?.();
  }

  say(text, tone) {
    const el = this.root?.querySelector('.nw-say');
    if (!el) return;
    el.textContent = text;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  flash(bin, tone) {
    const all = this.root?.querySelectorAll('.nw-bin') ?? [];
    all.forEach((b) => b.removeAttribute('data-flash'));
    const el = this.root?.querySelector(`.nw-bin[data-bin="${bin}"]`);
    if (!el) return;
    void el.offsetWidth;
    el.dataset.flash = tone;
    clearTimeout(this._flashT);
    this._flashT = setTimeout(() => el.removeAttribute('data-flash'), 900);
  }

  sort(bin) {
    const c = this.card;
    if (!c || this.won) return;
    if (bin !== c.kind) {
      this.misses += 1;
      this.missed.add(c.id);
      this.flash(bin, 'bad');
      this.say(`Not quite. ${c.why}`, 'bad');
      return;
    }
    this.placed[bin].push(c);
    this.idx += 1;
    this.flash(bin, 'good');
    if (!this.card) {
      this.won = true;
      this.draw(false, c.id);
      this.say('All sorted. The same thing can be a need or a want: it depends on the job it does.', 'good');
      finishGame(this);
      return;
    }
    this.draw(true, c.id);
    this.say(`Right. ${c.why}`, 'good');
  }

  playAgain() {
    this.round += 1;
    super.resetChallenge?.();
    this.newRound(shuffled(PAIRS.map((_, i) => i)).slice(0, 4));
    this.say('');
    this.draw(true);
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.newRound(this.round ? shuffled(PAIRS.map((_, i) => i)).slice(0, 4) : FIRST);
    this.say('');
    this.draw(true);
  }

  destroy() {
    clearTimeout(this._flashT);
    super.destroy();
  }

  testState() { return { idx: this.idx, n: this.deck.length, won: this.won, misses: this.misses, deck: this.deck.map((c) => c.id).join(','), need: this.placed.need.length, want: this.placed.want.length }; }
}
