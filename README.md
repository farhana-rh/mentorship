# INSB WIE Mentorship Program — Cohort 1 | 2026

A single-page, mobile-first registration site for the IEEE NSU SB WIE Affinity Group's mentorship program, built for QR-code and social-media traffic. Registration itself happens through an **embedded Google Form** (Google handles storage via the linked Sheet) — there is no backend, database, authentication, or custom form-submission code.

## Architecture

```
Custom website  →  Branded registration section  →  Embedded Google Form  →  Google Sheet
```

The site is informational + conversion-focused; the Google Form is the actual registration mechanism, embedded directly in the page (not just linked out to).

## Stack

Plain HTML + CSS + vanilla JS. No build step, no dependencies, no Node.js required. Open `index.html` directly in a browser, or serve the folder with any static file server.

## File structure

```
index.html            All sections: hero, program highlights, what you gain, how it works, registration (embedded form), FAQ, final CTA, footer
css/style.css          Mobile-first design tokens + components (thick outlines, offset shadows, decorative stars) + breakpoints
js/config.js           Single source of truth for GOOGLE_FORM_URL, contact info, and social links
js/main.js             Wires the form embed, header scroll state, staggered scroll-reveal, FAQ accordion
assets/images/          IEEE NSU SB and WIE Affinity Group logos + favicon (extracted from the program proposal doc)
```

## Before you launch: replace placeholders

Everything below lives in **`js/config.js`** — edit that one file and the whole site updates.

```js
GOOGLE_FORM_URL: "https://docs.google.com/forms/d/e/.../viewform?embedded=true",
CONTACT_EMAIL: "ieeewie.nsu@gmail.com",
CONTACT_PHONES: ["+8801710097856", "+8801684382112"],
SOCIAL: { facebook: "...", instagram: "...", linkedin: "..." }  // TODO: replace with real links
```

- `GOOGLE_FORM_URL` is already set to the form you provided. To swap forms later: open the new form → **Send** → the `<>` embed tab → copy the `src="..."` URL (it must end in `?embedded=true`) → paste it in as this constant. `js/main.js` sets the registration `<iframe>`'s `src` from this value on load, and also derives the "open in a new tab" fallback link by stripping `?embedded=true` from it — no other file needs to change.
- `SOCIAL` links are placeholders — replace with real accounts, or remove the footer icons if not ready.

## Local preview

Just open `index.html` in a browser. If your browser blocks local file access for fonts, run a quick local server instead:

```
# Python
python -m http.server 8080

# Node (npx, no install needed)
npx serve .
```

Then visit `http://localhost:8080`.

## Deploying

Static site — drop the folder as-is into any static host:

- **GitHub Pages**: push to a repo, enable Pages on the `main` branch.
- **Netlify / Vercel**: drag-and-drop the folder, or connect the repo. No build command needed.

## Design system notes

Mobile-first CSS (base styles target ~360px, scaling up via `min-width` breakpoints at 480/640/768/1024/1180px) with a playful/retro visual language: soft lavender background, purple primary accent, thick black (`3px`) outlines, hard purple offset shadows (no blur), rounded panels, and small floating star/dot decorations. All animation respects `prefers-reduced-motion` (see the media query near the top of `css/style.css` and the check in `js/main.js`).

## Content notes

Copy is drawn directly from the confirmed program brief (highlights, gains, how-it-works steps, FAQ answers, contact details). Nothing was invented; the only editable placeholders are the social links in `js/config.js`.
