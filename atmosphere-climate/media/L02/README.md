# Media provenance - L02

Per `docs/copyright-and-sourcing.md`: never extract a textbook's own photographs;
source an openly-licensed equivalent and record its source and licence here.

**This file is complete.** The one image referenced by
`blocks/L02/blk-l02-s08.json` exists on disk at the path below, so this lesson
has no dangling image reference.

The slide stands in for the source's *Fig. 3.4: Aurora* (p.4 / book p.42,
recorded in `FIGURES.md`), captioned "Aurora". **The textbook's own photograph
was not extracted.** An openly-licensed photograph of the same phenomenon was
sourced from Wikimedia Commons instead, and it was **opened and looked at**
before being committed.

## aurora-abisko.jpg

- Used by: `blocks/L02/blk-l02-s08.json` (`image.src`), shown from the first
  beat.
- Stands in for: the source's *Fig. 3.4* aurora photograph (p.4 / book p.42).
  The textbook's own photograph is **not** to be extracted.
- What it shows: a real aurora borealis seen from a snow-covered ridge with bare
  trees in silhouette along the bottom of the frame. Broad soft green curtains
  hang from a star-filled sky, with a violet-magenta tint to the upper left and
  a paler green band low on the right. Shot looking roughly north across the
  Torneträsk valley; the photographer is not in the frame. It was **verified by
  opening the downloaded file**: the frame does show green vertical curtains
  over a dark ridge, and does show more than one colour - which is the one thing
  the slide's prose claims about the picture, that the colours are the gases'
  own.
- Why this frame rather than a composite: the slide's whole argument for using
  a photograph is that a drawing cannot improve on what a real light display
  looks like, and that argument only holds if the colours are the real ones.
- Licence: CC BY-SA 4.0, `AttributionRequired: true`. Recorded in
  `blk-l02-s08.json` as `image.caption` and `image.alt`.

### Licence record

| file | source | author | licence | added |
|---|---|---|---|---|
| aurora-abisko.jpg | https://commons.wikimedia.org/wiki/File:Aurora_in_Abisko_near_Tornetr%C3%A4sk.jpg | Pavel.shyshkouski | CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/) | 2026-10-02 |

The licence was read from the Commons API
(`action=query&prop=imageinfo&iiprop=extmetadata`) on the file named above, not
inferred from the file name or the source page's badge:

**aurora-abisko.jpg** - `LicenseShortName` `CC BY-SA 4.0`, `UsageTerms`
`Creative Commons Attribution-Share Alike 4.0`, `LicenseUrl`
`https://creativecommons.org/licenses/by-sa/4.0/`, `AttributionRequired`
`true`, `Artist` `Pavel.shyshkouski`, `Credit` `Own work`, `DateTimeOriginal`
`2018-03-09`. Original 5442 x 3628; downloaded at 1400 px wide through the
Commons `Special:FilePath` endpoint.

Attribution and share-alike are satisfied two ways: the credit is written into
the block's own `image.caption`, which is what a learner sees beside the
picture, and the full record is here.

**If this file is ever replaced, the replacement's licence must be verified the
same way - read it from the file's own page - before it is committed. Do not
carry the present credit over to a different image.**
