# Media provenance - L03

Per `docs/copyright-and-sourcing.md`: never extract a textbook's own
photographs or illustrations; source an openly-licensed equivalent or
generate original art, and record its source and licence here.

## No image files are needed for this lesson

**This lesson has no image file pending.** Every one of its ten slides
carries a scene instead of a picture, so there is no `image.src` anywhere in
`blocks/L03/` and no dangling image reference.

The one picture this lesson leans on is the **Bhadkeshwar Mahadev Temple at
Dwarka**, the temple on its rock in the sea with the stone path that the tide
covers and uncovers. That photograph belongs to the **previous** lesson: it is
`blocks/L02/blk-l02-s09.json`'s `image.src`, and its provenance is recorded in
`media/L02/README.md`. Slide `blk-l03-s01` only refers back to it in words
("the picture in the last lesson"), so nothing is duplicated here.

The lesson's own source figures are handled by the scenes, not by image files:

- `Fig. 1.5` (book p.6), the Sun-Earth-Moon schematic with the bulges, is
  redrawn as the `SunMoonEarthScene` canvas scene, so that the learner can
  drag the Moon round its orbit.
- `Fig. 1.6` (book p.6), the levels of spring and neap tides, is redrawn as
  the `TideRangeChartScene` chart, with a day marker added so the month can be
  read.
- `Fig. 1.7` (book p.7), the two panels of high and low tide and fishing, is
  redrawn as the `TideFishingScene` scene, with a tide switch in place of the
  two panels.

None of the three is lifted out of the textbook page.

The slides and the medium each one uses:

| slide | what it shows | medium |
|---|---|---|
| blk-l03-s01 | the Dwarka path, and a 24-hour clock of the tide | scene (`TideClockScene`) |
| blk-l03-s02 | the Sun, the Earth and the Moon, the predict | scene (`SunMoonEarthScene`) |
| blk-l03-s03 | the same panel, with the bulges and the verdicts | scene (`SunMoonEarthScene`) |
| blk-l03-s04 | a month of water level, spring and neap | scene (`TideRangeChartScene`) |
| blk-l03-s05 | a ship waiting for the tide at a harbour mouth | scene (`HarbourEntryScene`) |
| blk-l03-s06 | a fishing shore at high tide and at low tide | scene (`TideFishingScene`) |
| blk-l03-s07 | the Indian coast and three tidal-energy sites | scene (`TidalEnergyMapScene`) |
| blk-l03-s07b | the briefing for the challenge | no scene (prose only) |
| blk-l03-s08 | the challenge round | scene (`TideWindowGameScene`) |
| blk-l03-s09 | Norway and Labrador, and the question that closes the lesson | scene (`TwoCoastsScene`) |

### Licence records

(no image files in this lesson, so nothing to record)
