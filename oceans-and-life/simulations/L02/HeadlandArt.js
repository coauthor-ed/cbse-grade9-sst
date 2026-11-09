// HeadlandArt - one headland seen side on from the sea, at six stages. Used by HeadlandErosionScene and the
// CarveTheCoast game. Not a scene.
//   svgHeadland(W, H, stage, o)   stage 0 whole, 1 crack, 2 sea cave, 3 arch, 4 sea stack, 5 stump. o.t waves.
//   geo(W, H)                     { seaY, topY, tip, holeL, holeR, pillarL, pillarR } for placing marks
// The dashed line keeps the original headland once rock has gone. Cut parts show the sky and sea behind them.
import { fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { svgSeaColumn, svgStrata, svgWaveLine, svgFoam, svgLighthouse, svgCloud, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';

export function geo(W, H) {
  return { seaY: H * 0.72, topY: H * 0.26, tip: W * 0.9, holeL: W * 0.5, holeR: W * 0.68, pillarL: W * 0.68, pillarR: W * 0.86, landEnd: W * 0.5 };
}

export function svgHeadland(W, H, stage, o = {}) {
  const g = geo(W, H), { seaY, topY, tip, holeL, holeR, pillarL, pillarR } = g, id = o.id ?? 'hl', t = o.t ?? 1;
  let s = `<defs>${svgSkyGradient(`${id}-sky`, 0, 10)}</defs><rect width="${W}" height="${seaY + 6}" style="fill:url(#${id}-sky)"/>`;
  s += svgCloud(W * 0.42, H * 0.12, Math.min(0.6, W / 900), { seed: 5 });
  // Far water behind the rock.
  s += `<rect x="0" y="${seaY - 22}" width="${W}" height="28" ${fill(sc('band2'))}/>`;
  // Rock outline.
  let rock;
  const foot = H;
  if (stage < 4) {
    rock = [[0, topY - 10], [W * 0.3, topY - 4], [W * 0.62, topY], [tip - 12, topY + 6], [tip, topY + 40], [tip + 6, seaY - 40], [tip, foot], [0, foot]];
  } else {
    rock = [[0, topY - 10], [W * 0.3, topY - 4], [holeL - 20, topY + 2], [holeL - 4, topY + 40], [holeL, seaY - 60], [holeL + 8, foot], [0, foot]];
  }
  const clip = `${id}-rock`;
  let holes = '';
  const archTop = topY + (seaY - topY) * 0.5;
  const hole = (x0, x1, y) => `M${x0} ${foot}L${x0} ${y + (x1 - x0) * 0.3}Q${(x0 + x1) / 2} ${y - (x1 - x0) * 0.26} ${x1} ${y + (x1 - x0) * 0.3}L${x1} ${foot}Z`;
  let body = `<clipPath id="${clip}"><path d="${line(rock)}Z"/></clipPath><g clip-path="url(#${clip})">${svgStrata(0, topY - 14, 1, { w: W, h: foot - topY + 14, bands: 5, seed: 7 })}</g>`;
  body += `<path d="${line(rock.slice(0, stage < 4 ? 4 : 3))}" ${stroke(sc('grass'), 9)}/>`;
  if (stage === 1) {
    body += `<path d="M${W * 0.58} ${seaY + 4}l-5 -22l8 -18l-7 -24l6 -20l-3 -18" ${stroke(sc('rockDeep'), 7)}/><path d="M${W * 0.585} ${seaY + 4}l-5 -22l8 -18l-7 -24" ${stroke(sc('ink'), 3)}/>`;
  }
  if (stage === 2) {
    body += `<path d="${hole(holeL - 4, holeR + 2, archTop + 8)}" ${fill(sc('rockDeep'))}/><path d="${hole(holeL + (holeR - holeL) * 0.2, holeR - (holeR - holeL) * 0.2, archTop + 34)}" ${fill(sc('ink'), 'opacity:0.7')}/>`;
  }
  if (stage === 3) {
    holes = hole(holeL + 4, holeR, archTop);
    body += `<clipPath id="${id}-hole"><path d="${holes}"/></clipPath><g clip-path="url(#${id}-hole)"><defs></defs><rect x="${holeL - 4}" y="${topY}" width="${holeR - holeL + 8}" height="${seaY - topY}" style="fill:url(#${id}-sky)"/><rect x="${holeL - 4}" y="${seaY - 24}" width="${holeR - holeL + 8}" height="30" ${fill(sc('band2'))}/></g>`;
    body += `<path d="${holes}" ${stroke(sc('rockDark'), 5)}/>`;
  }
  s += body;
  // Blow hole: a shaft through the roof of the cave or arch, with spray.
  if (stage === 2 || stage === 3) {
    const bx = stage === 2 ? W * 0.56 : W * 0.46;
    if (stage === 2) {
      s += `<path d="M${bx} ${topY}L${bx + 3} ${archTop + 20}" ${stroke(sc('rockDeep'), 7)}/>`;
      s += `<path d="M${bx} ${topY + 2}q-14 -20 -6 -34M${bx} ${topY + 2}q14 -20 8 -36M${bx} ${topY + 2}v-44" ${stroke(sc('foam'), 5)}/>`;
    }
  }
  if (stage >= 4) {
    // The pillar left behind, and the dashed outline of what stood here.
    const pTop = stage === 4 ? topY + 12 : seaY - (seaY - topY) * 0.2, pts = stage === 4
      ? [[pillarL + 8, foot], [pillarL + 6, seaY - 90], [pillarL + 16, pTop + 8], [pillarL + 30, pTop], [pillarR - 34, pTop + 4], [pillarR - 18, pTop + 26], [pillarR - 22, seaY - 60], [pillarR - 12, foot]]
      : [[pillarL + 6, foot], [pillarL + 12, pTop + 12], [pillarL + 34, pTop], [pillarR - 34, pTop + 4], [pillarR - 18, pTop + 18], [pillarR - 10, foot]];
    const cp = `${id}-pil`;
    s += `<clipPath id="${cp}"><path d="${line(pts)}Z"/></clipPath><g clip-path="url(#${cp})">${svgStrata(0, topY - 14, 1, { w: W, h: foot - topY + 14, bands: 5, seed: 7 })}</g>`;
    if (stage === 4) s += `<path d="M${pillarL + 28} ${pTop}L${pillarR - 32} ${pTop + 3}" ${stroke(sc('grass'), 8)}/>`;
    s += `<path d="M${holeL - 18} ${topY + 2}L${W * 0.62} ${topY}L${tip - 12} ${topY + 6}L${tip} ${topY + 40}L${tip + 6} ${seaY - 40}L${tip + 2} ${seaY}" ${stroke(sc('ink'), 3.5, 'stroke-dasharray:9 8')}/>`;
    // Rubble where the top came down.
    s += `<path d="M${holeL + 16} ${seaY + 6}l8 -12l13 4l7 -9l14 6l10 11ZM${holeR - 40} ${seaY + 6}l7 -9l11 3l8 6Z" ${fill(sc('rockDark'))}/>`;
  }
  if (stage < 4) s += svgLighthouse(W * 0.16, topY - 8, Math.min(0.62, H / 560));
  // Near water over the foot of the rock.
  s += svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, bands: 4, t, wave: 3.4, len: 22 });
  s += svgWaveLine(0, seaY, 1, { w: W, amp: 3.4, len: 22, t });
  s += svgFoam(stage < 4 ? tip : holeL, seaY - 2, 0.9, { seed: 3 });
  if (stage >= 4) s += svgFoam(pillarL + 10, seaY - 2, 0.7, { seed: 6 }) + svgFoam(pillarR - 14, seaY - 2, 0.7, { seed: 7 });
  return s;
}
