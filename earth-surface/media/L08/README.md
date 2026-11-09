# Media provenance - L08

Per `docs/copyright-and-sourcing.md`: never extract a textbook's own
illustrations or photographs; source an openly-licensed equivalent and
record its source and licence here.

Status: sourced 2026-11-09 (see Sourced below). It is a real photograph
of a real landform - never generated, synthesised or scanned from the textbook.

## yardang-field.jpg

- Used by: `blocks/L08/blk-l08-s06.json` (`image.src`).
- Stands in for the source's `Fig. 2.21` (p.17 / book p.29), **right-hand
  panel only**. The textbook's printed photograph is **not** to be
  extracted.
- To produce: download a photograph of a **yardang field on a hyper-arid
  plateau** - parallel, flat-topped wind-carved rock ridges separated by
  sand-filled corridors - from Wikimedia Commons or another open-licence
  repository. Places the source's own entry names as candidates: the Lut
  Desert or White Desert in Egypt, the Qaidam Basin in China, or the
  Lut / Dasht-e Kavir plateau in Iran. Save it here and record below:
  source page URL, file name on the source, author or credited
  institution if any, and the exact licence (Commons photos are usually
  CC BY-SA or CC0 - check the file page, do not assume).
- What the slide needs, from `FIGURES.md` Fig. 2.21. Three details are
  load-bearing, and every one of them is a claim the prose makes:
  1. **Several ridges in one frame, all running the same way.** The
     slide's whole point is scale and parallel alignment; a photograph
     of a single rounded ridge loses both. The ridges must read as
     parallel to each other, not scattered.
  2. **The ridges must be flat-topped and low**, with roughly flat
     upper surfaces, not sharp peaks. The chapter's hard rock standing
     as a caprock over soft rock is what makes this shape, and a
     photograph of spires or pinnacles would be a different landform.
  3. **Sand or fine debris in the corridors between the ridges**, so the
     learner can see the two materials the wind sorted - rock kept,
     sand moved. A bare rock pavement without sand corridors would show
     only one of the two.
- **No plants, no soil, no water, no settlement** may be in the frame.
  An oasis or a village would put this photograph in conflict with
  L08's own `DeflationScene` (where the oasis is the thing the wind
  uncovers) and would also make it read as a landscaped scene. This is
  bare rock under a hyper-arid sky.
- A caption identifying the location, if the photograph itself has no
  visible signage, is welcome in the file name and in the block's `alt`
  text (already written); no text should be overlaid onto the image.
- The block's `alt` text already names the load-bearing features
  (parallel flat-topped ridges, sandy corridors, no vegetation).

### Sourced

- File page: https://commons.wikimedia.org/wiki/File%3A%E8%8C%AB%E5%B4%96_%E7%81%AB%E6%98%9F%E4%B8%80%E5%8F%B7%E5%85%AC%E8%B7%AF%E6%97%81%E7%9A%84%E9%9B%85%E4%B8%B9%E5%9C%B0%E8%B2%8C_06.jpg
- Source file name: "Mangya, yardangs beside Mars Road No. 1, 06" (Chinese
  title; 6000x4000, taken 2024-08-08). Qaidam Basin, Haixi, Qinghai, China.
- Author: Liuxingy (Own work)
- Licence: CC BY-SA 4.0 - https://creativecommons.org/licenses/by-sa/4.0/
  (read from the Commons API extmetadata, `AttributionRequired: true`)
- Attribution: "Yardangs beside Mars Road No. 1, Mangya" by Liuxingy,
  CC BY-SA 4.0, via Wikimedia Commons. Cropped and resized.
- Changes: top 25% (empty sky) cropped; resized to 1600x800, JPEG q75
  (176 KB). No landform cropped.
- Date sourced: 2026-11-09
- Why this one: a Qaidam yardang field (a place the brief names) seen
  across many low, flat-topped ridges all running one way, with a pale
  sand corridor between two of them in the foreground. No plants, people,
  roads or text. Caveat: faint pale salt-pan patches on the far horizon;
  they read as ground, not water, at slide size.

## Images this lesson does NOT need

- **`Fig. 2.22`'s oasis photograph (right panel).** It is a real
  photograph and would fit the oasis beat on s04, but `DeflationScene`
  shows the whole process that produces an oasis - wind in, sand out,
  water table exposed - in one place the learner can operate. A
  photograph of a lagoon ringed with palms shows the result and cannot
  show the cut-down, and it would sit on a slide whose whole argument is
  that the wind did **not** make the water. Left unsourced deliberately.
- **`Fig. 2.23`'s three dune photographs (bottom row).** Same reason,
  and stronger here: the slide that would carry them is s05, whose entire
  job is that a dune's shape is decided by wind direction and sand
  supply - which is something a photograph of a finished barchan cannot
  teach, and `DuneShapeScene` teaches by drawing all four from the two
  dials. The chapter's labels and each type's photographed appearance are
  both already recorded in `FIGURES.md` for Stage 3's scene work.
- **`Fig. 2.30`'s dust storm photograph.** It is named on the closing
  hook (s09) as a `reveal.images` entry keyed on a `<!-- STEP id="..." -->`
  sentinel, with `simulationStep` handing off to `WindDeskScene` on the
  next beat. `reveal.images` is a different attachment from `image.src`
  and the file is not listed under its own heading above because it is
  not a standalone `image.src`; the load-bearing details it must carry
  are written into s09's own `id` requirement in `blocks/L08/blk-l08-s09.json`
  and repeated here:

  - **A dense wall of airborne dust standing across the frame**, thick
    enough to hide the horizon and part of the sky. A wind-blown haze
    or a dust devil does not read as a storm; the wall does.
  - **Bare branches with leaves stripped or sparse**, so the scene is
    recognisably a living landscape being hit, not empty desert. The
    chapter's own account of why the ground is bare (prolonged drought,
    sparse vegetation cover) is what the closing slide asks the learner
    to reason back to.
  - **No sky full of clean sun, no water, no settlement** in the same
    frame.

  It is a real photograph of a real event and may not be generated or
  synthesised. It may be any real dust storm, anywhere - the chapter
  prints no location and the slide claims none.