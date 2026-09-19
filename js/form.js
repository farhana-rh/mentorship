(function () {
  "use strict";

  var form = document.getElementById("registrationForm");
  if (!form) return;

  var OPTIONS = SITE_CONFIG.FORM_OPTIONS;

  function el(tag, props) {
    var node = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (key) { node[key] = props[key]; });
    return node;
  }

  function populateSelect(id, options, placeholder) {
    var select = document.getElementById(id);
    if (!select) return;
    select.appendChild(el("option", { value: "", disabled: true, selected: true, textContent: placeholder }));
    options.forEach(function (opt) {
      select.appendChild(el("option", { value: opt, textContent: opt }));
    });
  }

  function populateChips(containerId, name, options, type) {
    var container = document.getElementById(containerId);
    if (!container) return;
    options.forEach(function (opt, i) {
      var input = el("input", {
        type: type,
        name: type === "checkbox" ? name + "[]" : name,
        id: name + "_" + i,
        value: opt,
      });
      var label = el("label", { className: "chip" });
      label.appendChild(input);
      label.appendChild(el("span", { textContent: opt }));
      container.appendChild(label);
    });
  }

  populateSelect("department", OPTIONS.departments, "Select your department");
  populateSelect("academicYear", OPTIONS.academicYears, "Select your year");
  populateSelect("cgpaRange", OPTIONS.cgpaRanges, "Select your CGPA range");

  var mentorNames = (SITE_CONFIG.MENTORS || []).map(function (m) { return m.name; });
  var mentorPlaceholders = {
    mentorChoice1: "Select your first-choice mentor",
    mentorChoice2: "Select your second-choice mentor (optional)",
    mentorChoice3: "Select your third-choice mentor (optional)",
  };
  Object.keys(mentorPlaceholders).forEach(function (id) {
    populateSelect(id, mentorNames, mentorPlaceholders[id]);
  });

  populateChips("interestAreasGroup", "interestAreas", OPTIONS.interestAreas, "checkbox");
  populateChips("goalsGroup", "goals", OPTIONS.goals, "checkbox");
  populateChips("mentorQualitiesGroup", "mentorQualities", OPTIONS.mentorQualities, "checkbox");
  populateChips("meetingFormatGroup", "meetingFormat", OPTIONS.meetingFormats, "radio");
  populateChips("meetingFrequencyGroup", "meetingFrequency", OPTIONS.meetingFrequencies, "radio");
  populateChips("meetingTimeGroup", "meetingTime", OPTIONS.meetingTimes, "radio");

  /* ---------- "Other" free-text reveal ---------- */
  function wireOtherReveal(groupId, otherInputId) {
    var group = document.getElementById(groupId);
    var otherInput = document.getElementById(otherInputId);
    if (!group || !otherInput) return;
    group.addEventListener("change", function () {
      var otherChecked = Array.prototype.some.call(
        group.querySelectorAll('input[type="checkbox"]'),
        function (cb) { return cb.value === "Other" && cb.checked; }
      );
      otherInput.classList.toggle("is-hidden", !otherChecked);
      if (!otherChecked) otherInput.value = "";
    });
  }
  wireOtherReveal("interestAreasGroup", "interestAreasOther");
  wireOtherReveal("goalsGroup", "goalsOther");

  /* ---------- Mentor choices must be distinct ---------- */
  var mentorSelects = ["mentorChoice1", "mentorChoice2", "mentorChoice3"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var mentorError = document.getElementById("mentorChoiceError");

  function validateMentorChoices() {
    var values = mentorSelects.map(function (s) { return s.value; }).filter(Boolean);
    var unique = values.filter(function (v, i) { return values.indexOf(v) === i; });
    var valid = values.length === unique.length;
    if (mentorError) mentorError.classList.toggle("is-hidden", valid);
    return valid;
  }
  mentorSelects.forEach(function (s) { s.addEventListener("change", validateMentorChoices); });

  /* ---------- CV file read + validation ---------- */
  var cvInput = document.getElementById("cvFile");
  var cvError = document.getElementById("cvFileError");
  var MAX_CV_BYTES = (SITE_CONFIG.MAX_CV_SIZE_MB || 5) * 1024 * 1024;

  function fileProblem(file) {
    if (!file) return "Please attach your CV.";
    if (file.type !== "application/pdf") return "Please upload your CV as a PDF file.";
    if (file.size > MAX_CV_BYTES) {
      return "Your CV must be smaller than " + (SITE_CONFIG.MAX_CV_SIZE_MB || 5) + " MB.";
    }
    return "";
  }

  function encodeCv(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve({
          base64: String(reader.result).split(",")[1],
          mimeType: file.type,
          fileName: file.name,
          sizeBytes: file.size,
        });
      };
      reader.onerror = function () { reject(new Error("Could not read the selected file.")); };
      reader.readAsDataURL(file);
    });
  }

  // Encode as soon as the file is picked, so submitting doesn't wait on FileReader.
  var cvCache = null;
  if (cvInput) {
    cvInput.addEventListener("change", function () {
      cvCache = null;
      if (cvError) {
        cvError.textContent = "";
        cvError.classList.add("is-hidden");
      }
      var file = cvInput.files && cvInput.files[0];
      if (!file) return;
      var problem = fileProblem(file);
      if (problem) {
        if (cvError) {
          cvError.textContent = problem;
          cvError.classList.remove("is-hidden");
        }
        return;
      }
      cvCache = { file: file, promise: encodeCv(file) };
    });
  }

  function readCvAsBase64() {
    var file = cvInput && cvInput.files && cvInput.files[0];
    var problem = fileProblem(file);
    if (problem) return Promise.reject(new Error(problem));
    if (cvCache && cvCache.file === file) return cvCache.promise;
    return encodeCv(file);
  }

  /* ---------- Collect + submit ---------- */
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");
  var submitLabel = submitBtn.querySelector(".btn-label");

  function checkedValues(groupId) {
    var group = document.getElementById(groupId);
    if (!group) return [];
    return Array.prototype.filter
      .call(group.querySelectorAll('input[type="checkbox"]'), function (cb) { return cb.checked; })
      .map(function (cb) { return cb.value; });
  }

  function radioValue(groupId) {
    var group = document.getElementById(groupId);
    var checked = group && group.querySelector('input[type="radio"]:checked');
    return checked ? checked.value : "";
  }

  function setStatus(message, kind) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status" + (kind ? " is-" + kind : "");
  }

  /* ---------- Submit progress ----------
   *
   * This bar is deliberately INDETERMINATE — it never shows a percentage, because a
   * percentage is impossible here. Real upload progress needs XMLHttpRequest's
   * xhr.upload events, and per the Fetch spec, registering any xhr.upload listener sets
   * the request's "upload listener flag", which disqualifies it from being a CORS simple
   * request and forces an OPTIONS preflight. Apps Script Web Apps have no doOptions
   * handler and cannot answer a preflight, so the request fails outright. Do not
   * reintroduce xhr.upload here — it breaks submission entirely.
   *
   * What the bar can honestly show is that work is still happening, plus elapsed time,
   * which is what stops applicants assuming the form has frozen and submitting twice.
   */
  var progressEl = document.getElementById("formProgress");
  var progressLabel = document.getElementById("formProgressLabel");
  var progressTimer = null;

  // Escalating reassurance: on a slow mobile connection a 2MB CV can take 20s+, and
  // silence past the 10s mark is when people start hitting the button again.
  function progressMessage(seconds) {
    if (seconds < 10) return "Sending your application…";
    if (seconds < 25) return "Still sending — large CVs take a while on slow connections…";
    return "Still working — please don't close this page or submit again…";
  }

  function showProgress() {
    if (!progressEl) return;
    var startedAt = Date.now();

    function tick() {
      var seconds = Math.floor((Date.now() - startedAt) / 1000);
      if (progressLabel) {
        progressLabel.textContent = progressMessage(seconds) + " (" + seconds + "s)";
      }
    }

    progressEl.classList.remove("is-hidden");
    tick();
    clearInterval(progressTimer);
    progressTimer = setInterval(tick, 1000);
  }

  function hideProgress() {
    clearInterval(progressTimer);
    progressTimer = null;
    if (progressEl) progressEl.classList.add("is-hidden");
  }

  form.addEventListener("submit", function (evt) {
    evt.preventDefault();
    setStatus("", "");
    if (cvError) cvError.textContent = "";

    if (!form.reportValidity()) return;
    if (!validateMentorChoices()) return;

    var interestAreas = checkedValues("interestAreasGroup");
    var goals = checkedValues("goalsGroup");
    if (!interestAreas.length) {
      setStatus("Please select at least one area of interest.", "error");
      return;
    }
    if (!goals.length) {
      setStatus("Please select at least one program goal.", "error");
      return;
    }

    if (!SITE_CONFIG.APPS_SCRIPT_URL) {
      setStatus("Registration isn't connected yet — please email " + SITE_CONFIG.CONTACT_EMAIL + " instead.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Submitting…";
    showProgress();

    readCvAsBase64()
      .then(function (cv) {
        var payload = {
          fullName: form.fullName.value.trim(),
          nsuId: form.nsuId.value.trim(),
          nsuEmail: form.nsuEmail.value.trim(),
          department: form.department.value,
          academicYear: form.academicYear.value,
          cgpaRange: form.cgpaRange.value,
          interestAreas: interestAreas,
          interestAreasOther: form.interestAreasOther.value.trim(),
          goals: goals,
          goalsOther: form.goalsOther.value.trim(),
          whyJoin: form.whyJoin.value.trim(),
          mentorChoice1: form.mentorChoice1.value,
          mentorChoice2: form.mentorChoice2.value,
          mentorChoice3: form.mentorChoice3.value,
          whyMentor: form.whyMentor.value.trim(),
          mentorQualities: checkedValues("mentorQualitiesGroup"),
          meetingFormat: radioValue("meetingFormatGroup"),
          meetingFrequency: radioValue("meetingFrequencyGroup"),
          meetingTime: radioValue("meetingTimeGroup"),
          cv: cv,
        };

        // Plain-string body keeps this a "simple request" (no custom Content-Type),
        // which avoids a CORS preflight that the Apps Script Web App can't answer.
        return fetch(SITE_CONFIG.APPS_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      })
      .then(function (res) { return res.text(); })
      .then(function (text) {
        var data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          // The backend answered with something other than JSON (typically an Apps Script
          // error page). The submission may still have been saved, so don't tell the
          // applicant it failed outright and push them into submitting twice.
          throw new Error(
            "We couldn't confirm your submission. It may have gone through — please email " +
            SITE_CONFIG.CONTACT_EMAIL + " to check before submitting again."
          );
        }
        if (data.status !== "ok") throw new Error(data.message || "Something went wrong. Please try again.");
        form.reset();
        document.querySelectorAll(".other-input").forEach(function (i) { i.classList.add("is-hidden"); });
        setStatus("You're registered! We'll be in touch by email.", "success");
      })
      .catch(function (err) {
        setStatus(err.message || ("Something went wrong. Please try again, or email " + SITE_CONFIG.CONTACT_EMAIL + "."), "error");
      })
      .then(function () {
        hideProgress();
        submitBtn.disabled = false;
        submitLabel.textContent = "Submit Application";
      });
  });
})();
