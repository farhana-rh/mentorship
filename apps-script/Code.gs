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

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = JSON.parse(e.postData.contents);

    var missing = findMissingFields(data);
    if (missing.length) {
      return jsonResponse({ status: 'error', message: 'Missing required fields: ' + missing.join(', ') });
    }

    var cvLink = saveCvToDrive(data.cv, data.fullName);

    getSheet().appendRow([
      new Date(),
      data.fullName,
      data.nsuId,
      data.nsuEmail,
      data.department,
      data.academicYear,
      data.cgpaRange,
      (data.interestAreas || []).join(', '),
      data.interestAreasOther || '',
      (data.goals || []).join(', '),
      data.goalsOther || '',
      data.whyJoin,
      data.mentorChoice1,
      data.mentorChoice2 || '',
      data.mentorChoice3 || '',
      data.whyMentor || '',
      (data.mentorQualities || []).join(', '),
      data.meetingFormat,
      data.meetingFrequency,
      data.meetingTime,
      cvLink,
    ]);

    return jsonResponse({ status: 'ok' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  } finally {
    lock.releaseLock();
  }
}

function findMissingFields(data) {
  var missing = REQUIRED_FIELDS.filter(function (key) { return !data[key]; });
  if (!data.interestAreas || !data.interestAreas.length) missing.push('interestAreas');
  if (!data.goals || !data.goals.length) missing.push('goals');
  if (!data.cv || !data.cv.base64) missing.push('cv');
  return missing;
}

function saveCvToDrive(cv, fullName) {
  if (cv.sizeBytes && cv.sizeBytes > MAX_CV_BYTES) {
    throw new Error('CV exceeds the maximum allowed size.');
  }
  var folder = DriveApp.getFolderById(CV_FOLDER_ID);
  var blob = Utilities.newBlob(
    Utilities.base64Decode(cv.base64),
    cv.mimeType || 'application/pdf',
    (fullName || 'applicant') + ' - CV.pdf'
  );
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
