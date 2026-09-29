# Adding real photos for state/homepage backgrounds

The app automatically shows a real photo for a state's hero banner **if you
add one here** — no code changes needed. If no photo is found, it falls back
to the illustrated SVG motif automatically, so nothing ever breaks.

## Why there's no photo here already

We can't ship arbitrary photos found on the web inside this codebase —
licensing on random search results is unverifiable, and if you ever deploy
this publicly, an improperly-licensed image is a real legal risk for you.
So instead: the app is built to *use* a photo the moment you add one, sourced
from somewhere you know is actually free to use.

## Where to get free, legal photos

**Wikimedia Commons** (commons.wikimedia.org) is the best source — millions
of photos of Indian monuments, festivals, dance forms, and landscapes,
almost all under Creative Commons or public domain licenses that explicitly
allow reuse (including commercial use, in most cases). Steps:

1. Go to commons.wikimedia.org and search e.g. "Meenakshi Amman Temple",
   "Bharatanatyam", "Mysuru Palace", "Kerala backwaters".
2. Open a photo, check the license on its file page (look for "CC BY-SA",
   "CC0", or "Public Domain" — avoid anything marked "non-free" or with
   usage restrictions).
3. Click "Download" → choose a reasonably sized version (1600–2400px wide is
   plenty for a background image; no need for the full-resolution original).
4. If the license requires attribution (most CC BY-SA photos do), keep a note
   of the photographer's name and the Commons page URL somewhere you'll
   remember (e.g. a CREDITS.md file) — you're legally required to credit them
   if you use the image.

Other good free sources: **Unsplash** (unsplash.com) and **Pexels**
(pexels.com) also have India travel/heritage photography under their free
license, though the selection is less exhaustive than Commons for specific
monuments.

## File naming

Save the file into this folder (`frontend/public/images/states/`) named
after the state, lowercase, spaces replaced with hyphens, as `.jpg`, `.png`,
or `.webp`:

| State | Filename |
|---|---|
| Tamil Nadu | `tamil-nadu.jpg` |
| Kerala | `kerala.jpg` |
| Rajasthan | `rajasthan.jpg` |
| Karnataka | `karnataka.jpg` |
| (homepage) | `india.jpg` |

The pattern is: lowercase the state name, replace spaces/special characters
with hyphens. For example "Jammu and Kashmir" → `jammu-and-kashmir.jpg",
"Dadra and Nagar Haveli and Daman and Diu" → follow the same rule.

## Tips for a good result

- Pick a photo with a fairly dark or busy area on the left third — that's
  where the title text sits. A gradient overlay is applied automatically to
  help text stay readable over any photo, but starting with a reasonably
  cooperative image gives better results than a very bright, evenly-lit one.
- Landscape orientation, at least 1600px wide, works best — the image is
  cropped to fill the banner (`object-cover`), so very tall/narrow photos
  will lose their sides.
- You don't need to do all 36 states at once — add a few (Tamil Nadu,
  Kerala, Rajasthan) and see how they look before doing the rest.
