# Sourcing brief - chennai-tsunami-2004.jpg

Target file: `media/L06/chennai-tsunami-2004.jpg`
Referenced by: `blocks/L06/blk-l06-s01.json` -> `image.src`

**Stage 2 had no web access**, so this file could not be sourced. A later
pass with network access has to fetch it, save it under this exact filename,
and fill in the licence table in `media/L06/README.md`. The block's `credit`
and `license` fields carry the expected values and **must be corrected to
match the file that is actually downloaded**.

## Hard constraint: a real photograph of the 2004 damage

Never a generated "photograph", never an AI image, never a reconstruction,
and never a scan of the chapter PDF. The slide is about a real disaster on a
real coast, so the picture has to be a real photograph of it.

## Where to look

1. **Wikimedia Commons** - search "2004 Indian Ocean tsunami Chennai" or
   "tsunami 2004 Tamil Nadu". Check the **licence on the file page
   itself**, not on the category page. Acceptable: CC0 / public domain /
   CC BY / CC BY-SA. Refused: anything NonCommercial (NC) or NoDerivatives
   (ND) - the course is published under CC BY-SA 4.0 and the validator
   rejects NC and ND licences.
2. **Commons categories** - `Category:2004 Indian Ocean tsunami`,
   `Category:Chennai`, `Category:Tsunami damage in India`. Files from
   government or NGO archives are often uploaded with a free licence.
3. A news archive with a clear reuse licence, if the photograph is credited
   there. Record the URL and the photographer's name.

## What the picture must show

- **Damage in the open, on a coast** - debris, broken or roofless
  structures, scattered or wrecked boats - with the sea, a flooded street or
  a washed-out shoreline in the frame, so the reader can see that the wave
  came in from the sea. The source's own figure shows exactly this: a large
  tree, mud and wreckage across the ground, and roofless brick walls in the
  foreground.
- **Enough of the scene to read as a disaster's work on a coastal
  settlement**, so the slide's line about the damage following the coast
  means something.
- No identifiable victims and no graphic injury.

## If the photograph is not of Chennai

A photograph of the damage in the Andaman and Nicobar Islands, in Tamil Nadu
or in Kerala is acceptable and honest, as long as the caption and the
block's `image.alt` say where it is. The slide's prose does not claim that
the photograph is of Chennai - it says "the photograph beside this text shows
damage on the Indian coast where the wave came ashore" - so the caption must
not narrow the claim to Chennai unless the file really is Chennai.

## What to record when the file is produced

Fill the licence table in `media/L06/README.md`: the file's source page URL,
the photographer's name as given on that page, the exact licence string, and
the date added. Then set the block's `image.credit` and `image.license` to
the same values, and write a caption that describes what the photograph
actually shows.
