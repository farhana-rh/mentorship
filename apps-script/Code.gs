/**
 * INSB WIE Mentorship Program — registration backend.
 * Deploy this as a Google Apps Script Web App (see apps-script/README.md for setup steps).
 */

// ====== CONFIGURE THESE BEFORE DEPLOYING ======
var SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
var SHEET_NAME = 'Registrations';
var CV_FOLDER_ID = 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE';
var MAX_CV_BYTES = 2 * 1024 * 1024; // keep in sync with MAX_CV_SIZE_MB in js/config.js
var CONTACT_EMAIL = 'ieeewie.nsu@gmail.com'; // keep in sync with CONTACT_EMAIL in js/config.js
var PROGRAM_NAME = 'INSB WIE Mentorship Program (Cohort 1 | 2026)';

var HEADERS = [
  'Timestamp', 'Full Name', 'NSU ID', 'NSU Email', 'Department', 'Academic Year',
  'CGPA Range', 'Interest Areas', 'Interest Areas (Other)', 'Program Goals', 'Program Goals (Other)',
  'Why Join', 'Mentor Choice 1', 'Mentor Choice 2', 'Mentor Choice 3', 'Why This Mentor',
  'Mentor Qualities Valued', 'Meeting Format', 'Meeting Frequency', 'Meeting Time', 'CV Link',
  'Email Sent',
];

var REQUIRED_FIELDS = [
  'fullName', 'nsuId', 'nsuEmail', 'department', 'academicYear',
  'cgpaRange', 'whyJoin', 'mentorChoice1', 'meetingFormat', 'meetingFrequency', 'meetingTime',
];

// Column indexes (1-based) of NSU ID and NSU Email within HEADERS, used for the duplicate check.
var NSU_ID_COLUMN = 3;
var NSU_EMAIL_COLUMN = 4;
var FULL_NAME_COLUMN = 2;
// Column (1-based) stamped once an applicant's confirmation email has been sent.
var EMAIL_SENT_COLUMN = 22;

// Guard rails for the background email trigger (see sendPendingEmails).
var EMAIL_BATCH_LIMIT = 50;
var EMAIL_RUN_BUDGET_MS = 4 * 60 * 1000; // Apps Script kills a trigger at ~6 min; stop well short.

/**
 * The applicant is waiting on this response, so it does as little as possible: everything
 * that can happen after the row is safely written (notably the confirmation email) is
 * deferred to the sendPendingEmails trigger.
 */
function doPost(e) {
  var timer = startTimer();
  try {
    var data = JSON.parse(e.postData.contents);
    timer.mark('parse');

    var missing = findMissingFields(data);
    if (missing.length) {
      return jsonResponse({ status: 'error', message: 'Missing required fields: ' + missing.join(', ') });
    }

    var sheet = getSheet();
    timer.mark('openSheet');

    // Cheap unlocked pre-check: rejects an obvious duplicate before paying for the Drive
    // upload. The authoritative check still runs under the lock below.
    if (isDuplicate(sheet, data.nsuId, data.nsuEmail)) {
      return jsonResponse({ status: 'error', message: duplicateMessage() });
    }
    timer.mark('dupPreCheck');

    // Deliberately outside the lock — a multi-megabyte Drive upload is the slowest step here,
    // and holding the lock across it would make concurrent applicants queue behind each
    // other's uploads instead of just behind each other's row writes.
    var cv = saveCvToDrive(data.cv, data.fullName);
    timer.mark('uploadCv');

    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) {
      discardCv(cv);
      return jsonResponse({ status: 'error', message: 'Server is busy — please try submitting again in a moment.' });
    }
    timer.mark('acquireLock');

    try {
      // Re-check under the lock: another submission with the same ID or email may have
      // landed while this one was uploading its CV.
      if (isDuplicate(sheet, data.nsuId, data.nsuEmail)) {
        discardCv(cv);
        return jsonResponse({ status: 'error', message: duplicateMessage() });
      }
      timer.mark('dupRecheck');

      sheet.appendRow([
        new Date(),
        sanitize(data.fullName),
        sanitize(data.nsuId),
        sanitize(data.nsuEmail),
        sanitize(data.department),
        sanitize(data.academicYear),
        sanitize(data.cgpaRange),
        sanitize((data.interestAreas || []).join(', ')),
        sanitize(data.interestAreasOther || ''),
        sanitize((data.goals || []).join(', ')),
        sanitize(data.goalsOther || ''),
        sanitize(data.whyJoin),
        sanitize(data.mentorChoice1),
        sanitize(data.mentorChoice2 || ''),
        sanitize(data.mentorChoice3 || ''),
        sanitize(data.whyMentor || ''),
        sanitize((data.mentorQualities || []).join(', ')),
        sanitize(data.meetingFormat),
        sanitize(data.meetingFrequency),
        sanitize(data.meetingTime),
        cv.url,
        '', // Email Sent — filled in by the sendPendingEmails trigger.
      ]);
      timer.mark('appendRow');
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ status: 'ok' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  } finally {
    timer.log();
  }
}

/**
 * Per-stage timing for doPost, written to the Apps Script "Executions" log.
 *
 * IMPORTANT when reading the output: these numbers start when doPost begins, which is
 * AFTER Google has spun up the script container. If Executions reports a total noticeably
 * larger than 'total' below, that gap is container cold start — it happens before any of
 * this code runs and cannot be optimized away. Submitting twice in quick succession makes
 * the second request warm, which is how you tell the two apart.
 */
function startTimer() {
  var started = Date.now();
  var last = started;
  var parts = [];
  return {
    mark: function (label) {
      var now = Date.now();
      parts.push(label + ' ' + (now - last) + 'ms');
      last = now;
    },
    log: function () {
      console.log('doPost: ' + parts.join(' | ') + ' | total ' + (Date.now() - started) + 'ms');
    },
  };
}

function duplicateMessage() {
  return 'It looks like you\'ve already registered with this NSU ID or email.';
}

function findMissingFields(data) {
  var missing = REQUIRED_FIELDS.filter(function (key) { return !data[key]; });
  if (!data.interestAreas || !data.interestAreas.length) missing.push('interestAreas');
  if (!data.goals || !data.goals.length) missing.push('goals');
  if (!data.cv || !data.cv.base64) missing.push('cv');
  return missing;
}

function isDuplicate(sheet, nsuId, nsuEmail) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var values = sheet.getRange(2, NSU_ID_COLUMN, lastRow - 1, NSU_EMAIL_COLUMN - NSU_ID_COLUMN + 1).getValues();
  var id = String(nsuId).trim().toLowerCase();
  var email = String(nsuEmail).trim().toLowerCase();
  return values.some(function (row) {
    return String(row[0]).trim().toLowerCase() === id || String(row[1]).trim().toLowerCase() === email;
  });
}

// Neutralizes spreadsheet formula injection: a value starting with =, +, -, or @ would
// otherwise be evaluated as a formula when the sheet owner opens it.
function sanitize(value) {
  var str = String(value == null ? '' : value);
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

function saveCvToDrive(cv, fullName) {
  var decoded = Utilities.base64Decode(cv.base64);
  if (decoded.length > MAX_CV_BYTES) {
    throw new Error('CV exceeds the maximum allowed size.');
  }
  var isPdf = decoded.length > 4 && decoded[0] === 0x25 && decoded[1] === 0x50 && decoded[2] === 0x44 && decoded[3] === 0x46; // "%PDF"
  if (!isPdf) {
    throw new Error('CV must be a valid PDF file.');
  }
  var folder = DriveApp.getFolderById(CV_FOLDER_ID);
  var blob = Utilities.newBlob(decoded, 'application/pdf', (fullName || 'applicant') + ' - CV.pdf');
  // No setSharing() call: it costs an extra Drive round-trip on every submission, and CVs
  // contain personal data that shouldn't be readable by anyone with the link. Share the CV
  // folder itself with the committee once instead — see apps-script/README.md.
  var id = folder.createFile(blob).getId();
  // The link is built by hand rather than with file.getUrl(), which would be another Drive
  // round-trip on the applicant's critical path for a URL of an entirely predictable shape.
  return { id: id, url: 'https://drive.google.com/file/d/' + id + '/view' };
}

// Removes a CV uploaded for a submission that turned out to be rejected, so abandoned
// files don't pile up in the folder.
function discardCv(cv) {
  try {
    DriveApp.getFileById(cv.id).setTrashed(true);
  } catch (err) {
    console.error('Could not trash orphaned CV ' + cv.id + ': ' + err.message);
  }
}

/**
 * Sends confirmation emails for any rows that do not have one yet.
 *
 * MailApp.sendEmail is synchronous and takes 1-3s, so it is not run inside doPost — that
 * time would land on every applicant's wait. Install this on a time-driven trigger instead
 * by running createEmailTrigger() once (see apps-script/README.md).
 */
function sendPendingEmails() {
  var lock = LockService.getScriptLock();
  // If the previous run is still going, let it finish — the next tick picks up the rest.
  if (!lock.tryLock(1000)) return;

  try {
    var sheet = getSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    var rowCount = lastRow - 1;
    var names = sheet.getRange(2, FULL_NAME_COLUMN, rowCount, 1).getValues();
    var emails = sheet.getRange(2, NSU_EMAIL_COLUMN, rowCount, 1).getValues();
    var sentColumn = sheet.getRange(2, EMAIL_SENT_COLUMN, rowCount, 1);
    var sent = sentColumn.getValues();

    var quota = MailApp.getRemainingDailyQuota();
    var startedAt = Date.now();
    var processed = 0;
    var changed = false;

    for (var i = 0; i < rowCount; i++) {
      if (String(sent[i][0]).trim()) continue;      // already handled
      if (!String(emails[i][0]).trim()) continue;   // nothing to send to
      if (processed >= EMAIL_BATCH_LIMIT) break;
      if (quota <= 0) break;                        // out of quota; the next day's runs catch up
      if (Date.now() - startedAt > EMAIL_RUN_BUDGET_MS) break;

      sent[i][0] = sendConfirmationEmail(names[i][0], emails[i][0]);
      changed = true;
      processed++;
      quota--;
    }

    // One write for the whole batch rather than a setValue per row.
    if (changed) sentColumn.setValues(sent);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Returns the value to stamp into the 'Email Sent' column: a timestamp on success, or a
 * FAILED marker so a permanently undeliverable address is not retried on every tick.
 * Clearing the cell re-queues that row.
 */
function sendConfirmationEmail(fullName, nsuEmail) {
  try {
    var subject = "We've received your " + PROGRAM_NAME + " application";
    var body =
      'Hi ' + fullName + ',\n\n' +
      "Thanks for applying to the " + PROGRAM_NAME + ". We've received your application, and it's now with the organizing committee for review.\n\n" +
      "We'll follow up by email once mentor-mentee matching is complete. If you have any questions in the meantime, reach out to " + CONTACT_EMAIL + ".\n\n" +
      'Thanks,\n' +
      'IEEE NSU SB WIE Affinity Group';

    MailApp.sendEmail({
      to: nsuEmail,
      replyTo: CONTACT_EMAIL,
      subject: subject,
      body: body,
    });
    return new Date();
  } catch (err) {
    // Never let one bad address stall the batch, but leave a trace in the sheet and in the
    // Apps Script "Executions" view.
    console.error('Confirmation email failed for ' + nsuEmail + ': ' + err.message);
    return 'FAILED: ' + err.message;
  }
}

/**
 * Run this ONCE from the Apps Script editor to start sending confirmation emails in the
 * background. Safe to re-run: it replaces any trigger it previously created.
 */
function createEmailTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'sendPendingEmails') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('sendPendingEmails').timeBased().everyMinutes(5).create();
  console.log('Trigger installed: sendPendingEmails runs every 5 minutes.');
}

/**
 * Run this manually from the Apps Script editor to test email sending on its own.
 * Change the address first, then press Run and check your inbox (and the Executions log).
 */
function testEmail() {
  MailApp.sendEmail({
    to: CONTACT_EMAIL,
    replyTo: CONTACT_EMAIL,
    subject: 'WIE Mentorship — test email',
    body: 'If you are reading this, MailApp is authorized and working.',
  });
  console.log('Sent. Remaining quota today: ' + MailApp.getRemainingDailyQuota());
}

function getSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  } else if (sheet.getLastColumn() < HEADERS.length) {
    // Backfills headers added after this sheet was first created (e.g. 'Email Sent'), so an
    // existing sheet doesn't have to be rebuilt by hand.
    var firstNew = sheet.getLastColumn() + 1;
    sheet.getRange(1, firstNew, 1, HEADERS.length - firstNew + 1)
      .setValues([HEADERS.slice(firstNew - 1)])
      .setFontWeight('bold');
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
