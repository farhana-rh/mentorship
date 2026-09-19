# Registration backend setup

The custom registration form on the site (`js/form.js`) POSTs directly to a Google Apps Script Web App, which validates the submission, uploads the CV to Drive, and appends a row to a Google Sheet. There is no server to host — Google runs the script.

## 1. Create the Sheet

Create a new Google Sheet (or reuse an existing one) to collect responses. Copy its ID from the URL:
`https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

## 2. Create a Drive folder for CVs

Create a Drive folder that uploaded CVs will be saved into. Copy its ID from the URL:
`https://drive.google.com/drive/folders/`**`THIS_PART`**

Uploaded CVs are **not** made link-shareable — they contain applicants' personal data, and setting per-file sharing also costs an extra Drive call on every submission. Instead, share this one folder (Drive → right-click the folder → Share) with the committee members who need to read CVs. Anyone with folder access can open the CV links in the Sheet; anyone else will see a "request access" page.

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

## 5. Turn on confirmation emails

Confirmation emails are **not** sent by the web app itself — `MailApp.sendEmail` takes 1–3 seconds, and that time would be added to every applicant's wait on the submit button. They're sent by a background trigger instead.

In the Apps Script editor, pick **`createEmailTrigger`** from the function dropdown and press **Run**, once. Authorize it when prompted. From then on, `sendPendingEmails` runs every 5 minutes and emails any row whose **Email Sent** column is still blank.

Applicants therefore get their confirmation up to ~5 minutes after registering, rather than instantly. If you skip this step, registrations are still saved correctly — nobody just gets a confirmation email.

## 6. Point the site at it

Paste the URL into `js/config.js`:

```js
APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycb.../exec",
```

## Updating the script later

If you edit `Code.gs` after the first deploy, you must create a **new deployment version** (or use **Manage deployments → Edit → New version**) for the changes to go live — saving the file alone does not update the deployed `/exec` URL's behavior.

## Notes

- The sheet header row and column order are created automatically on first submission, from the `HEADERS` array in `Code.gs`.
- `MAX_CV_BYTES` in `Code.gs` should stay in sync with `MAX_CV_SIZE_MB` in `js/config.js` — one is enforced client-side, the other server-side; the server independently re-checks the actual decoded file size and rejects anything that isn't a real PDF, since the client-reported values can't be trusted (anyone can POST to this URL directly, bypassing the site).
- Every submission is written as a new row; nothing is ever overwritten or deleted by the script.
- A `LockService` lock serializes concurrent submissions so simultaneous registrations can't collide when appending rows; if the lock can't be acquired within 30s, the submission is rejected with a "server is busy" message rather than failing silently. The lock covers only the duplicate re-check and the row append — **not** the CV upload, which is the slowest step. Holding the lock across a multi-megabyte Drive upload would make concurrent applicants queue behind each other's uploads rather than just their row writes.
- Duplicate registrations (same NSU ID or NSU email as an existing row) are rejected server-side. The check runs twice: once before the CV upload, so an obvious duplicate doesn't pay for the upload at all, and once under the lock, which is the authoritative one. If a duplicate only shows up on the second check (two people racing with the same ID), the CV that was already uploaded is moved to the Drive trash so abandoned files don't accumulate.
- Free-text fields are sanitized before being written to the Sheet to prevent spreadsheet formula injection (a value starting with `=`, `+`, `-`, or `@`).
- Confirmation emails are sent by the `sendPendingEmails` trigger, not by the web app — see step 5. Each row's **Email Sent** column holds the send timestamp, or `FAILED: <reason>` if that address was rejected (clearing the cell re-queues the row). The reply-to is `CONTACT_EMAIL` from the top of `Code.gs`.
- **Email sending quota**: `MailApp` on a personal Gmail account allows roughly 100 emails/day. That's plenty for organic registration traffic spread over days/weeks. Unlike before, exceeding it no longer silently loses the email: rows that couldn't be sent stay blank in **Email Sent** and go out on the next day's runs automatically.
- `MailApp.sendEmail(...)` means the script needs Gmail permission, and the trigger needs permission to run on your behalf — the **next deployment** and the first `createEmailTrigger` run will each prompt you to re-authorize.
- The **Email Sent** column (column V) is added to an existing sheet automatically on the next submission — you don't need to add it by hand or start a new sheet.

## Updating the deployed script

Whenever `Code.gs` changes (including the fixes above), you must push the update to your live Apps Script project and redeploy:

1. Open your project at [script.google.com](https://script.google.com).
2. Replace the file contents with the latest `apps-script/Code.gs`, keeping your own `SPREADSHEET_ID` and `CV_FOLDER_ID` values.
3. **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy.**
4. If you haven't already, run **`createEmailTrigger`** once (step 5 above) — without it, confirmation emails are never sent.

Saving alone does not update the live `/exec` URL's behavior — only a new deployment version does.
