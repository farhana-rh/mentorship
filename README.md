# INSB WIE Mentorship Program 2026 — Website

A static, responsive recruitment/registration site for the IEEE NSU SB WIE Affinity Group's mentorship program. Informational only — all "Apply as a Mentee" buttons link out to an external Google Form. There is no backend, database, or custom form handling.

## Stack

Plain HTML + CSS + vanilla JS. No build step, no dependencies, no Node.js required. Open `index.html` directly in a browser, or serve the folder with any static file server.

## File structure

```
index.html            All page sections (hero, about, gains, how it works, focus areas, FAQ, final CTA, footer)
css/style.css          Design tokens + component + section styles, responsive breakpoints
js/config.js           Single source of truth for the Google Form URL and other site constants
js/main.js             Nav toggle, scroll reveal, active-link highlighting, FAQ accordion
assets/images/          IEEE NSU SB and WIE Affinity Group logos + favicon (extracted from the program proposal doc)
```

## Before you launch: replace placeholders

Everything below lives in **`js/config.js`** — edit that one file and every button/link on the site updates automatically.

```js
GOOGLE_FORM_URL: "https://forms.gle/REPLACE_WITH_REAL_FORM_ID",
CONTACT_EMAIL: "wie.nsu@ieee.org",
SOCIAL: { facebook: "...", instagram: "...", linkedin: "..." }
```

1. Create your mentee registration Google Form.
2. Copy its shareable link (Send → Link → the `https://forms.gle/...` or `https://docs.google.com/forms/...` URL).
3. Paste it into `GOOGLE_FORM_URL` in `js/config.js`.
4. Update `CONTACT_EMAIL` and the `SOCIAL` links to your real accounts.

No other file needs to change — every "Apply as a Mentee" button (hero, header, final CTA) reads from this one constant.

## Local preview

Just open `index.html` in a browser. If your browser blocks local file access for fonts/fetch, run a quick local server instead, e.g.:

```
# Python
python -m http.server 8080

# Node (npx, no install needed)
npx serve .
```

Then visit `http://localhost:8080`.

## Deploying

This is a static site — drop the folder as-is into any static host:

- **GitHub Pages**: push to a repo, enable Pages on the `main` branch.
- **Netlify / Vercel**: drag-and-drop the folder, or connect the repo. No build command needed.

## Content notes

Program details (duration, meeting cadence, matching ratio, focus areas, FAQ answers) are drawn from the WIE Mentorship Program proposal. The only placeholder content is the Google Form URL and the contact email/social links in `js/config.js` — replace those before publishing.
