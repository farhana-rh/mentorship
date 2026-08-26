# INSB WIE Mentorship Program — Cohort 1 | 2026

A single-page, mobile-first registration site for the IEEE NSU SB WIE Affinity Group's mentorship program, built for QR-code and social-media traffic. Registration happens through a **custom-built, themed form** on the page itself, which submits to a **Google Apps Script Web App** that validates it, uploads the CV to Drive, and appends a row to a Google Sheet. There is no server to host — Google runs the backend script, but there's no traditional database, hosting, or authentication layer either.

## Architecture

```
Custom website  →  Custom-themed registration form  →  Apps Script Web App  →  Google Sheet + Drive (CVs)
```

The form fields, options, and styling all live in this repo; only the submission endpoint is Google-hosted. See [`apps-script/README.md`](apps-script/README.md) for backend setup.

## Stack

Plain HTML + CSS + vanilla JS. No build step, no dependencies, no Node.js required. Open `index.html` directly in a browser, or serve the folder with any static file server.

## File structure

```
index.html            All sections: hero, program highlights, what you gain, how it works, registration (custom form), FAQ, final CTA, footer
css/style.css          Mobile-first design tokens + components (thick outlines, offset shadows, decorative stars) + breakpoints, incl. form styling
js/config.js           Single source of truth for APPS_SCRIPT_URL, form field options, contact info, and social links
js/main.js             Header scroll state, staggered scroll-reveal, FAQ accordion, footer contact links
js/form.js             Builds the registration form's dropdowns/checkboxes from config, validates input, submits to Apps Script
apps-script/           Google Apps Script backend (Code.gs) + its own setup README
assets/images/          IEEE NSU SB and WIE Affinity Group logos + favicon (extracted from the program proposal doc)
```

## Before you launch: replace placeholders

Everything below lives in **`js/config.js`** — edit that one file and the whole site updates.

```js
APPS_SCRIPT_URL: "",  // TODO: set after deploying apps-script/Code.gs — see apps-script/README.md
CONTACT_EMAIL: "ieeewie.nsu@gmail.com",
CONTACT_PHONES: ["+8801710097856", "+8801684382112"],
SOCIAL: { facebook: "...", instagram: "...", linkedin: "..." }  // TODO: replace with real links
FORM_OPTIONS: { departments: [...], academicYears: [...], mentors: [...], ... }
```

- `APPS_SCRIPT_URL` must be set before the registration form can submit — see [`apps-script/README.md`](apps-script/README.md) for how to deploy the backend and get this URL.
- `FORM_OPTIONS.departments`, `FORM_OPTIONS.academicYears`, and `FORM_OPTIONS.mentors` are placeholders/empty — replace with the real lists before launch (mentors especially, since it starts empty). The rest of `FORM_OPTIONS` (CGPA ranges, interests, goals, meeting preferences) is filled in already.
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

Copy is drawn directly from the confirmed program brief (highlights, gains, how-it-works steps, FAQ answers, contact details). Nothing was invented; the editable placeholders are the social links, form option lists (departments/academic years/mentors), and `APPS_SCRIPT_URL` in `js/config.js`.
