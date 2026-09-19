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
];

var REQUIRED_FIELDS = [
  'fullName', 'nsuId', 'nsuEmail', 'department', 'academicYear',
  'cgpaRange', 'whyJoin', 'mentorChoice1', 'meetingFormat', 'meetingFrequency', 'meetingTime',
];

// Column indexes (1-based) of NSU ID and NSU Email within HEADERS, used for the duplicate check.
var NSU_ID_COLUMN = 3;
var NSU_EMAIL_COLUMN = 4;

function doPost(e) {
  var lock = LockService.getScriptLock();
  var haveLock = false;
  try {
    haveLock = lock.tryLock(30000);
    if (!haveLock) {
      return jsonResponse({ status: 'error', message: 'Server is busy — please try submitting again in a moment.' });
    }

    var data = JSON.parse(e.postData.contents);

    var missing = findMissingFields(data);
    if (missing.length) {
      return jsonResponse({ status: 'error', message: 'Missing required fields: ' + missing.join(', ') });
    }

    var sheet = getSheet();
    if (isDuplicate(sheet, data.nsuId, data.nsuEmail)) {
      return jsonResponse({ status: 'error', message: 'It looks like you\'ve already registered with this NSU ID or email.' });
    }

    var cvLink = saveCvToDrive(data.cv, data.fullName);

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
      cvLink,
    ]);

    sendConfirmationEmail(data);

    return jsonResponse({ status: 'ok' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  } finally {
    if (haveLock) lock.releaseLock();
  }
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
  return folder.createFile(blob).getUrl();
}

function sendConfirmationEmail(data) {
  try {
    var subject = "We've received your " + PROGRAM_NAME + " application";
    var body =
      'Hi ' + data.fullName + ',\n\n' +
      "Thanks for applying to the " + PROGRAM_NAME + ". We've received your application, and it's now with the organizing committee for review.\n\n" +
      "We'll follow up by email once mentor-mentee matching is complete. If you have any questions in the meantime, reach out to " + CONTACT_EMAIL + ".\n\n" +
      'Thanks,\n' +
      'IEEE NSU SB WIE Affinity Group';

    MailApp.sendEmail({
      to: data.nsuEmail,
      replyTo: CONTACT_EMAIL,
      subject: subject,
      body: body,
    });
  } catch (err) {
    // Never fail a good registration just because the email didn't send, but do log the
    // reason so it shows up in the Apps Script "Executions" view.
    console.error('Confirmation email failed for ' + data.nsuEmail + ': ' + err.message);
  }
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
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
