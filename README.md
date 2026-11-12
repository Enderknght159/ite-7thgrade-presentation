# ICT — 7th grade presentation

An Arabic presentation for a 7th-grade ICT class, built as a web page instead of slide software. It is meant to be opened in a browser and projected in the classroom, and it also works on a phone.

Published at https://enderknght159.github.io/ite-7thgrade-presentation/

The content follows the school book: computer hardware (CPU, memory, storage, motherboard, peripherals), networks and the internet, and malware — viruses, worms, trojans, spyware, adware and ransomware — with the protection against each one.

## Using it

Open `index.html`. The index on the side jumps to any slide, and the keyboard works too:

| Key | Action |
|---|---|
| `→` / `PageDown` | next slide |
| `←` / `PageUp` | previous slide |
| `Home` / `End` | first / last slide |
| `F` | fullscreen |
| `E` | edit panel (direct text editing, slide index, import/export) |
| `Escape` | close the index |

`#s12` in the URL opens slide 12 directly.

`compare.html` puts the old and the new slide design next to each other. It was made to judge the redesign on a real projector, and it is still the quickest way to do that.

## On a phone

Swipe left or right to change slides, or use the buttons at the bottom. The mobile layout lives in `styles-mobile.css`, entirely inside media queries for narrow screens, touch devices and short landscape windows, so the projector layout is untouched.

## Files

| File | What it is |
|---|---|
| `index.html` | the slides |
| `styles*.css` | layout, slides, and adjustments for projection |
| `styles-mobile.css` | phone-only overrides; nothing here applies on a desktop screen |
| `app.js` | navigation, slide state, swipe on touch screens |
| `demos.js`, `demos2.js` | the interactive parts inside some slides |
| `new-design/`, `old-design/` | the two visual versions |

## Deploying

Any push to `main` republishes the site through GitHub Pages (source: `main`, repository root). The `old-design/` and `new-design/` folders are archived copies used by `compare.html`, so edits to the root files do not change them.
