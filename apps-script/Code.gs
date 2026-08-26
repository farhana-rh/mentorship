/**
 * INSB WIE Mentorship Program — registration backend.
 * Deploy this as a Google Apps Script Web App (see apps-script/README.md for setup steps).
 */

// ====== CONFIGURE THESE BEFORE DEPLOYING ======
var SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';
var SHEET_NAME = 'Registrations';
var CV_FOLDER_ID = 'PASTE_YOUR_DRIVE_FOLDER_ID_HERE';
var MAX_CV_BYTES = 5 * 1024 * 1024; // keep in sync with MAX_CV_SIZE_MB in js/config.js

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

    // Honeypot: a hidden field real applicants never fill in. If it's populated, silently
    // report success without writing anything, so bots don't learn to adapt.
    if (data.website) {
      return jsonResponse({ status: 'ok' });
    }

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
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
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
