// ReadCurveGame - L03 game (blk-l03-game): read one step of the farmer's barley/wheat curve.
//   1. The curve with A to E. The learner taps the step from C to D (four steps are tappable; a wrong step gets
//      a short reason naming the step it is).
//   2. The step lights: +25 kg barley along, a "?" drop of wheat down, dashed guides from C and D to the wheat
//      axis. The learner picks the wheat given up from 4 shuffled chips: 10, 20, 25, 30 kg. 25 is the trap (the
//      barley gained). A wrong pick gets a short reason; the right one (30) ends the game: finishGame ->
//      checkObjective { ok: true }.
// The figure never prints 70 or 40 before the answer: the learner reads them from the axis (grid every 10).
// Table numbers only (A 0/100, B 25/90, C 50/70, D 75/40, E 100/0); wheat = 100 - 0.2 b - 0.008 b^2 joins them.
// Shuffle: Math.random (no crypto). Colours are tokens only: wheat --sim-gold, barley series 2. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';

const MINUS = String.fromCharCode(0x2212);
const PTS = [['A', 0, 100], ['B', 25, 90], ['C', 50, 70], ['D', 75, 40], ['E', 100, 0]];
const STEPS = ['AB', 'BC', 'CD', 'DE'];
const KEY_STEP = 'CD', KEY = 30;
const CHOICES = [10, 20, 25, 30];
const wheatAt = (b) => 100 - 0.2 * b - 0.008 * b * b;
const f1 = (v) => (+v).toFixed(1);
const WHEAT = 'var(--sim-gold)', BARLEY = 'var(--sim-series-2)';

const STEP_WHY = {
  AB: 'That is A to B. C to D starts at C.',
  BC: 'That is B to C. Find C, then go one step right to D.',
  DE: 'That is D to E. C to D ends at D.',
};
const PICK_WHY = {
  10: '10 kg is the step A to B. Read the wheat at C (70) and at D (40).',
  20: 'That is B to C. Read the wheat at C (70) and at D (40).',
  25: '25 kg is the barley gained. The question asks for the wheat: 70 at C, 40 at D.',
};

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

const CSS = `
.rc { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.rc .rc-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 600px minmax(0, 1fr); gap: 26px; align-items: center; }
.rc .rc-fig { position: relative; width: 100%; }
.rc .rc-fig svg { display: block; width: 100%; height: auto; }
.rc .rc-hit { position: absolute; transform: translate(-50%, -50%); width: 46px; height: 46px; min-height: 46px; padding: 0; border-radius: 50%;
  background: color-mix(in oklab, var(--sim-accent) 10%, transparent); border: 3px dashed var(--sim-accent); box-shadow: none; }
.rc .rc-hit:active { transform: translate(-50%, calc(-50% + 2px)); box-shadow: none; }
.rc .rc-hit[data-s="bad"] { border-color: var(--sim-bad); border-style: solid; background: color-mix(in oklab, var(--sim-bad) 14%, transparent); }
.rc .rc-side { display: flex; flex-direction: column; gap: 14px; align-items: stretch; }
.rc .rc-ask { margin: 0; font: 800 21px/1.3 var(--sim-font); color: var(--sim-label); }
.rc .rc-ask b { color: var(--sim-accent); }
.rc .rc-chips { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.rc .rc-chips:empty { display: none; }
.rc .rc-chip { min-height: 56px; font: 800 24px/1 var(--sim-font-display, var(--sim-font)); }
.rc .rc-chip[data-s="bad"] { border-color: var(--sim-bad); color: var(--sim-bad); }
.rc .rc-chip[data-s="good"] { border-color: var(--sim-good); background: var(--sim-good); color: var(--sim-ink-on-good, var(--sim-bg-deep)); }
.rc .rc-say { margin: 0; min-height: 50px; font: 700 18px/1.4 var(--sim-font); }
.rc .rc-say[data-tone="good"] { color: var(--sim-good); }
.rc .rc-say[data-tone="bad"] { color: var(--sim-bad); }
.rc .rc-end { height: 0; }
.sim-dom-root--portrait .rc .rc-body { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.sim-dom-root--portrait .rc .rc-ask { font-size: 18px; text-align: center; }
.sim-dom-root--portrait .rc .rc-chip { min-height: 52px; font-size: 22px; }
.sim-dom-root--portrait .rc .rc-say { font-size: 16px; min-height: 0; text-align: center; }
.sim-dom-root--portrait .rc .rc-side { gap: 10px; }
`;

export class ReadCurveGame extends GameBoard {
  static HEIGHT = 330;   // the board fits about 350 CSS px at 1280x720
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Move from C to D on the farmer\'s curve. How much wheat does the farmer give up for the 25 kg of barley gained? Read it from the curve.' } };
  static ARIA_LABEL = 'The farmer\'s curve: barley in kg across, wheat in kg up, with points A to E. Tap the step from C to D, then pick how much wheat the farmer gives up: 10, 20, 25 or 30 kg.';

  async setup() {
    this.phase = 'step'; this.badStep = null; this.bad = new Set(); this.won = false; this.order = shuffled(CHOICES); this.figP = null;
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      onResize: () => { if (this.isPortrait() !== this.figP) this.draw(); },
      html: `<div class="gm rc"><div class="gm-head"><h2>Read the curve</h2><p class="sub rc-sub"></p></div>
        <div class="rc-body"><div class="rc-fig"></div>
          <div class="rc-side"><p class="rc-ask"></p><div class="rc-chips"></div><p class="rc-say" aria-live="polite"></p></div></div>
        <div class="rc-end" aria-hidden="true"></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  isPortrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  /** The whole board for the current phase. */
  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.rc-fig')) return;
    this.figP = this.isPortrait();
    q('.rc-sub').textContent = this.phase === 'step' ? 'Find the step on the curve first.' : 'Now read the wheat from the curve.';
    q('.rc-ask').innerHTML = this.phase === 'step' ? 'Tap the step from <b>C</b> to <b>D</b>.' : 'How much wheat does the farmer give up?';
    q('.rc-fig').innerHTML = this.figure(this.figP);
    q('.rc-fig').querySelectorAll('.rc-hit').forEach((b) => onTap(b, () => this.tapStep(b.dataset.step)));
    const chips = q('.rc-chips');
    if (this.phase === 'step') chips.innerHTML = '';
    else {
      chips.innerHTML = this.order.map((v) => {
        const s = this.won && v === KEY ? 'good' : this.bad.has(v) ? 'bad' : '';
        return `<button type="button" class="tap btn rc-chip" data-v="${v}"${s ? ` data-s="${s}"` : ''}${this.won ? ' aria-disabled="true"' : ''}>${v} kg</button>`;
      }).join('');
      chips.querySelectorAll('.rc-chip').forEach((b) => onTap(b, () => this.pick(Number(b.dataset.v))));
    }
    this.relayout?.();
  }

  /** The curve as SVG in its own viewBox (portrait: a narrower one, so text stays near 15 px on a phone). */
  figure(P) {
    const W = P ? 312 : 600, H = P ? 270 : 232, L = P ? 50 : 66, R = 18, T = 26, B = P ? 46 : 50;
    const pw = W - L - R, ph = H - T - B;
    const X = (b) => L + (b / 100) * pw, Y = (w) => T + ph - (w / 100) * ph;
    const fs = P ? 15 : 16, cd = this.phase !== 'step';
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="The farmer's curve with points A to E">`;
    s += `<rect x="${L}" y="${T}" width="${pw}" height="${ph}" style="fill:var(--sim-bg-surface)"/>`;
    for (let w = 10; w <= 100; w += 10) s += `<line x1="${L}" y1="${f1(Y(w))}" x2="${L + pw}" y2="${f1(Y(w))}" style="stroke:var(--sim-stroke);stroke-width:${w % 20 ? 1 : 1.6};opacity:${w % 20 ? 0.45 : 0.7}"/>`;
    for (let w = 0; w <= 100; w += 20) s += `<text x="${L - 8}" y="${f1(Y(w) + 5)}" text-anchor="end" style="fill:var(--sim-label-muted);font:700 ${fs}px var(--sim-font)">${w}</text>`;
    for (const b of [0, 25, 50, 75, 100]) s += `<text x="${f1(X(b))}" y="${T + ph + 21}" text-anchor="middle" style="fill:var(--sim-label-muted);font:700 ${fs}px var(--sim-font)">${b}</text>`;
    s += `<text x="${L + pw / 2}" y="${H - 4}" text-anchor="middle" style="fill:${BARLEY};font:800 ${fs}px var(--sim-font)">Barley (kg)</text>`;
    s += `<text transform="translate(${P ? 14 : 18} ${T + ph / 2}) rotate(-90)" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs}px var(--sim-font)">Wheat (kg)</text>`;
    s += `<path d="M${L} ${T}V${T + ph}H${L + pw}" style="fill:none;stroke:var(--sim-label);stroke-width:3.5;stroke-linecap:round"/>`;
    // The curve.
    const d = Array.from({ length: 51 }, (_, i) => `${i ? 'L' : 'M'}${f1(X(i * 2))} ${f1(Y(wheatAt(i * 2)))}`).join('');
    s += `<path d="${d}" style="fill:none;stroke:var(--sim-accent);stroke-width:5;stroke-linecap:round;opacity:${cd ? 0.45 : 1}"/>`;
    if (cd) {
      // The lit step C to D, with its barley gain and its wheat drop.
      const cdPath = Array.from({ length: 13 }, (_, i) => { const b = 50 + i * 25 / 12; return `${i ? 'L' : 'M'}${f1(X(b))} ${f1(Y(wheatAt(b)))}`; }).join('');
      s += `<path d="${cdPath}" style="fill:none;stroke:var(--sim-accent);stroke-width:8;stroke-linecap:round"/>`;
      for (const [w] of [[70], [40]]) s += `<line x1="${L}" y1="${f1(Y(w))}" x2="${f1(X(w === 70 ? 50 : 75))}" y2="${f1(Y(w))}" style="stroke:${WHEAT};stroke-width:2.5;stroke-dasharray:6 5"/>`;
      s += `<line x1="${f1(X(50))}" y1="${f1(Y(70))}" x2="${f1(X(75) - 8)}" y2="${f1(Y(70))}" style="stroke:${BARLEY};stroke-width:4;stroke-linecap:round"/>`
        + `<path d="M${f1(X(75) - 12)} ${f1(Y(70) - 7)}L${f1(X(75) - 2)} ${f1(Y(70))}L${f1(X(75) - 12)} ${f1(Y(70) + 7)}Z" style="fill:${BARLEY}"/>`;
      s += `<text x="${f1(P ? X(50) + 6 : X(62.5))}" y="${f1(Y(70) - 10)}" text-anchor="${P ? 'start' : 'middle'}" style="fill:${BARLEY};font:800 ${fs}px var(--sim-font)">+25 kg barley</text>`;
      s += `<line x1="${f1(X(75))}" y1="${f1(Y(70))}" x2="${f1(X(75))}" y2="${f1(Y(40) - 10)}" style="stroke:${WHEAT};stroke-width:4;stroke-linecap:round"/>`
        + `<path d="M${f1(X(75) - 7)} ${f1(Y(40) - 13)}L${f1(X(75))} ${f1(Y(40) - 2)}L${f1(X(75) + 7)} ${f1(Y(40) - 13)}Z" style="fill:${WHEAT}"/>`;
      const lab = P ? (this.won ? `${MINUS}${KEY}` : '?') : this.won ? `${MINUS}${KEY} kg wheat` : '? kg wheat';
      s += `<text x="${f1(X(75) + 10)}" y="${f1(Y(55) + 6)}" text-anchor="start" style="fill:var(--sim-label);font:800 ${fs + 2}px var(--sim-font)">${lab}</text>`;
    }
    // Points and letters.
    for (const [n, b, w] of PTS) {
      const lit = cd && (n === 'C' || n === 'D');
      s += `<circle cx="${f1(X(b))}" cy="${f1(Y(w))}" r="${lit ? 8 : 6.5}" style="fill:${lit ? 'var(--sim-accent)' : 'var(--sim-label)'};stroke:var(--sim-bg-surface);stroke-width:2.5"/>`;
      // Letters clear of the step rings and, once the step is lit, of its two labels (C up-left, D down-left).
      let dx = 10, dy = -10, an = 'start';
      if (n === 'A') { dx = 8; dy = -9; }
      if (n === 'E') { dx = -4; dy = -14; an = 'end'; }
      if (cd && n === 'C') { dx = -10; dy = -10; an = 'end'; }
      if (cd && n === 'D') { dx = -12; dy = 22; an = 'end'; }
      s += `<text x="${f1(X(b) + dx)}" y="${f1(Y(w) + dy)}" text-anchor="${an}" style="fill:var(--sim-label);font:800 ${fs + 4}px var(--sim-font-display, var(--sim-font))">${n}</text>`;
    }
    s += '</svg>';
    if (!cd) {
      STEPS.forEach((st) => {
        const a = PTS.find((p) => p[0] === st[0]), b = PTS.find((p) => p[0] === st[1]);
        const mb = (a[1] + b[1]) / 2, cx = X(mb), cy = Y(wheatAt(mb));
        s += `<button type="button" class="tap btn rc-hit" data-step="${st}"${this.badStep === st ? ' data-s="bad"' : ''} aria-label="the step from ${st[0]} to ${st[1]}" style="left:${f1(cx / W * 100)}%;top:${f1(cy / H * 100)}%"></button>`;
      });
    }
    return s;
  }

  say(text, tone) {
    const el = this.root?.querySelector('.rc-say');
    if (!el) return;
    el.textContent = text;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  tapStep(st) {
    if (this.phase !== 'step') return;
    if (st === KEY_STEP) { this.phase = 'pick'; this.badStep = null; this.draw(); this.say('Right step. Read the wheat at C and at D.', 'good'); return; }
    this.badStep = st; this.draw(); this.say(STEP_WHY[st] ?? 'Not that step.', 'bad');
  }

  pick(v) {
    if (this.phase !== 'pick' || this.won) return;
    if (v === KEY) {
      this.won = true; this.draw();
      this.say(`Right: 70 ${MINUS} 40 = 30 kg of wheat for 25 kg of barley.`, 'good');
      finishGame(this);
      return;
    }
    this.bad.add(v); this.draw(); this.say(PICK_WHY[v] ?? 'Not that one.', 'bad');
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.phase = 'step'; this.badStep = null; this.bad = new Set(); this.won = false; this.order = shuffled(CHOICES);
    this.say('');
    this.draw();
  }

  testState() { return { phase: this.phase, won: this.won, order: this.order, bad: [...this.bad], badStep: this.badStep }; }
}
