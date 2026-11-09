# Media provenance - L05

Per `docs/copyright-and-sourcing.md`: never extract a textbook's own photographs;
source an openly-licensed equivalent and record its source and licence here.

**This file is complete.** The one image referenced by
`blocks/L05/blk-l05-s10.json` exists on disk at the path below, so this lesson
has no dangling image reference.

The slide stands in for the source's *Fig. 3.9: Arrival of monsoon in the
mountains* (p.11 / book p.49, recorded in `FIGURES.md`), captioned "Arrival of
monsoon in the Mountains". **The textbook's own photograph was not extracted.**
An openly-licensed photograph of the same phenomenon was sourced from Wikimedia
Commons instead, and it was **opened and looked at** before being committed.

## monsoon-clouds-western-ghats.jpg

- Used by: `blocks/L05/blk-l05-s10.json` (`image.src`), shown from the first
  beat.
- Stands in for: the source's *Fig. 3.9* monsoon-cloud photograph (p.11 /
  book p.49). The textbook's own photograph is **not** to be extracted.
- What it shows: heavy monsoon cloud banking along a dark forested ridge,
  lit from below by a low orange sun near the horizon. The ridge runs across
  the lower two thirds of the frame; the cloud banks sit along and above the
  crest in horizontal white and slate-grey bands; a pale orange glow breaks
  under the cloud at the centre. Forested slopes and a few buildings are
  silhouetted in the foreground. Shot across the Panchgani plateau in the
  Western Ghats during the monsoon; the photographer is not in the frame. It
  was **verified by opening the downloaded file**: the frame does show a dense
  cloud bank lying along a mountain ridge with rain-bearing appearance, which
  is the one thing the slide's prose claims about the picture.
- Why this frame rather than a generated one: per `AGENTS.md` rule 11 a real
  photograph beats a generated one, and the slide's closing beat turns on the
  fact that the photograph **cannot** tell you when or where the rain arrived.
  That reading depends on it being an actual photograph of an actual ridge
  under an actual cloud bank, not an illustration of one.
- Licence: CC BY-SA 4.0, `AttributionRequired: true`. Recorded in
  `blk-l05-s10.json` as `image.caption` and `image.alt`.

### Licence record

| file | source | author | licence | added |
|---|---|---|---|---|
| monsoon-clouds-western-ghats.jpg | https://commons.wikimedia.org/wiki/File:Monsoon_clouds_in_Western_ghats.jpg | Cpangarkar | CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/) | 2026-10-02 |

The licence was read from the Commons API
(`action=query&prop=imageinfo&iiprop=extmetadata`) on the file named above, not
inferred from the file name or the source page's badge:

**monsoon-clouds-western-ghats.jpg** - `LicenseShortName` `CC BY-SA 4.0`,
`UsageTerms` `Creative Commons Attribution-Share Alike 4.0`, `LicenseUrl`
`https://creativecommons.org/licenses/by-sa/4.0/`, `AttributionRequired`
`true`, `Artist` `Cpangarkar`, `Credit` `Own work`, `DateTimeOriginal`
`2017-06-02`. Original 4640 x 2610; downloaded at 1400 px wide through the
Commons `Special:FilePath` endpoint. The Commons file description reads
"Monsoon climbing Western ghats of India at panchgani plateu".

Attribution and share-alike are satisfied two ways: the credit is written into
the block's own `image.caption`, which is what a learner sees beside the
picture, and the full record is here.

**If this file is ever replaced, the replacement's licence must be verified the
same way - read it from the file's own page - before it is committed. Do not
carry the present credit over to a different image.**