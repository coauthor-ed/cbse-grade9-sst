# Sourcing brief - tsunami-detection-buoy.jpg

Target file: `media/L06/tsunami-detection-buoy.jpg`
Referenced by: `blocks/L06/blk-l06-s06.json` -> `image.src`

**Stage 2 had no web access**, so this file could not be sourced. A later
pass with network access has to fetch it, save it under this exact filename,
and fill in the licence table in `media/L06/README.md`. The block's `credit`
and `license` fields carry the expected values and **must be corrected to
match the file that is actually downloaded**.

## Hard constraint: an Indian tsunami detection buoy, in real water

Never a generated "photograph", never an AI image, and never a scan of the
chapter PDF. The slide is about the hardware India actually put in the sea,
so the picture has to be of that hardware.

**A NOAA DART buoy is not the same thing and will not do.** The DART buoys
are the yellow-and-black moored cylinders of the US network; the Indian
buoys in the source's figure are a yellow float carrying a frame of
instruments above the water with a tether running down into the sea. If the
only photograph you can find is of a DART buoy, use it only if it shows a
buoy of the same Indian design, and say so in the caption - otherwise keep
looking.

## Where to look

1. **Indian Tsunami Early Warning Centre (ITEWC)** and **INCOIS** -
   government pages and publications on the Indian tsunami detection buoy
   network. Indian Government works are often published under GODL-India,
   which allows redistribution with attribution. Record the URL.
2. **NIOT / National Institute of Ocean Technology**, which built the
   Indian buoy network.
3. **Wikimedia Commons** - search "tsunami detection buoy India" or
   "Indian tsunami buoy". Check the **licence on the file page itself**.
   Acceptable: CC0 / public domain / CC BY / CC BY-SA. Refused: anything
   NonCommercial (NC) or NoDerivatives (ND) - the course is published under
   CC BY-SA 4.0 and the validator rejects NC and ND licences.

## What the picture must show

- **The buoy afloat on open sea**, with the frame of instruments above the
  water, so the reader can see that it is a floating instrument, not a
  shore station.
- Ideally the **tether running down from the float into the water**, which is
  what the slide describes; a photograph without it is acceptable but
  weaker.
- The float's own markings, if the photograph carries them - the source's
  figure shows a yellow float lettered with the words "TSUNAMI DETECT".
- Daylight and a view in which the sea around the buoy is obvious.

## What to record when the file is produced

Fill the licence table in `media/L06/README.md`: the file's source page URL,
the photographer's name as given on that page, the exact licence string, and
the date added. Then set the block's `image.credit` and `image.license` to
the same values, and write a caption that describes what the photograph
actually shows.
