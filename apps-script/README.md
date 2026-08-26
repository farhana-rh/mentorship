# Registration backend setup

The custom registration form on the site (`js/form.js`) POSTs directly to a Google Apps Script Web App, which validates the submission, uploads the CV to Drive, and appends a row to a Google Sheet. There is no server to host — Google runs the script.

## 1. Create the Sheet

Create a new Google Sheet (or reuse an existing one) to collect responses. Copy its ID from the URL:
`https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

## 2. Create a Drive folder for CVs

Create a Drive folder that uploaded CVs will be saved into. Copy its ID from the URL:
`https://drive.google.com/drive/folders/`**`THIS_PART`**

## 3. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Delete the default `Code.gs` contents and paste in this repo's `apps-script/Code.gs`.
3. At the top of the file, replace:
   - `SPREADSHEET_ID` with the Sheet ID from step 1
   - `CV_FOLDER_ID` with the folder ID from step 2
4. Save the project (give it a name, e.g. "WIE Mentorship Registration").

## 4. Deploy as a Web App

1. **Deploy → New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. **Deploy**, then authorize the script when prompted (it needs access to the Sheet and Drive).
6. Copy the resulting **Web app URL** (ends in `/exec`).

## 5. Point the site at it

Paste the URL into `js/config.js`:

```js
APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycb.../exec",
```

## Updating the script later

If you edit `Code.gs` after the first deploy, you must create a **new deployment version** (or use **Manage deployments → Edit → New version**) for the changes to go live — saving the file alone does not update the deployed `/exec` URL's behavior.

## Notes

- The sheet header row and column order are created automatically on first submission, from the `HEADERS` array in `Code.gs`.
- `MAX_CV_BYTES` in `Code.gs` should stay in sync with `MAX_CV_SIZE_MB` in `js/config.js` — one is enforced client-side, the other server-side.
- Every submission is written as a new row; nothing is ever overwritten or deleted by the script.
- A `LockService` lock serializes concurrent submissions so simultaneous registrations can't collide when appending rows.
