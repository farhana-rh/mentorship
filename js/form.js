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

  /* ---------- Whitespace-only values ----------
   *
   * `required` is satisfied by a value made only of spaces, and the payload trimmed only
   * at build time — so a blank name cleared the browser and was caught a round trip later
   * by the server. Normalising each field to its trimmed value before validation makes
   * `required` behave correctly. Done this way rather than with pattern=".*\S.*" because
   * <textarea> has no pattern attribute, and "Why join" is a textarea.
   */
  var TRIMMABLE = 'input[type="text"], input[type="email"], textarea';

  function trimField(field) {
    var trimmed = field.value.trim();
    // Only write when it actually differs — assigning .value moves the caret to the end.
    if (field.value !== trimmed) field.value = trimmed;
  }

  function trimAllFields() {
    Array.prototype.forEach.call(form.querySelectorAll(TRIMMABLE), trimField);
  }

  // On blur rather than on input: trimming while they type would swallow the space
  // between first and last name the moment it's pressed. Capture phase, since blur
  // doesn't bubble.
  form.addEventListener("blur", function (evt) {
    if (evt.target && evt.target.matches && evt.target.matches(TRIMMABLE)) trimField(evt.target);
  }, true);

  /* ---------- NSU ID format ----------
   *
   * The pattern attribute does the blocking (this input is visible, so the native bubble
   * works properly here — unlike the chip radios). This only replaces the browser's
   * generic "Please match the requested format" with something that says what the format
   * actually is.
   */
  var nsuIdInput = document.getElementById("nsuId");
  var nsuIdError = document.getElementById("nsuIdError");
  var NSU_ID_MESSAGE = "Your NSU ID is 10 digits, like 2211234042.";

  function refreshNsuIdValidity() {
    if (!nsuIdInput) return;
    // Clear first: a custom message makes the control invalid, which would otherwise mask
    // the browser's own re-evaluation of pattern/minlength on the new value.
    nsuIdInput.setCustomValidity("");
    var badFormat = nsuIdInput.validity.patternMismatch || nsuIdInput.validity.tooShort;
    if (badFormat) nsuIdInput.setCustomValidity(NSU_ID_MESSAGE);
    if (nsuIdError) {
      nsuIdError.textContent = badFormat ? NSU_ID_MESSAGE : "";
      nsuIdError.classList.toggle("is-hidden", !badFormat);
    }
  }

  if (nsuIdInput) {
    nsuIdInput.addEventListener("input", refreshNsuIdValidity);
    nsuIdInput.addEventListener("blur", refreshNsuIdValidity);
  }

  /* ---------- Required single-choice groups ----------
   *
   * These are radios rendered as chips, and .chip input is opacity:0 — a native `required`
   * would anchor the browser's validation bubble to an invisible control, so the applicant
   * gets a bubble pointing at nothing. They're checked here instead, the same way the
   * required checkbox groups are, so the error lands on the group itself.
   */
  var REQUIRED_CHOICE_GROUPS = [
    { group: "meetingFormatGroup", error: "meetingFormatError" },
    { group: "meetingFrequencyGroup", error: "meetingFrequencyError" },
    { group: "meetingTimeGroup", error: "meetingTimeError" },
  ];

  function markChoiceGroup(entry, chosen) {
    var errorEl = document.getElementById(entry.error);
    var groupEl = document.getElementById(entry.group);
    if (errorEl) errorEl.classList.toggle("is-hidden", chosen);
    if (groupEl) groupEl.setAttribute("aria-invalid", chosen ? "false" : "true");
    return groupEl;
  }

  function validateChoiceGroups() {
    var firstMissing = null;
    REQUIRED_CHOICE_GROUPS.forEach(function (entry) {
      var chosen = Boolean(radioValue(entry.group));
      var groupEl = markChoiceGroup(entry, chosen);
      if (!chosen && !firstMissing) firstMissing = groupEl;
    });

    if (!firstMissing) return true;

    // Availability sits at the bottom of a long form; without this the applicant gets an
    // error for a group that's scrolled off screen.
    firstMissing.scrollIntoView({ block: "center", behavior: "smooth" });
    // preventScroll because focus() would otherwise jump instantly and fight the smooth
    // scroll above. The visible highlight comes from [aria-invalid] in the stylesheet, not
    // from a focus ring — the input is opacity:0 and programmatic focus doesn't match
    // :focus-visible, so there'd be nothing to see.
    var firstInput = firstMissing.querySelector('input[type="radio"]');
    if (firstInput) firstInput.focus({ preventScroll: true });
    return false;
  }

  // Clear the error as soon as they pick something, rather than making them submit again
  // to find out it's resolved.
  REQUIRED_CHOICE_GROUPS.forEach(function (entry) {
    var groupEl = document.getElementById(entry.group);
    if (groupEl) {
      groupEl.addEventListener("change", function () { markChoiceGroup(entry, true); });
    }
  });

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
        var dataUrl = String(reader.result);
        resolve({
          // slice off the "data:application/pdf;base64," prefix rather than split(","),
          // which allocates an array plus a second copy of a multi-megabyte string.
          base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
          mimeType: file.type,
          fileName: file.name,
          sizeBytes: file.size,
        });
      };
      reader.onerror = function () { reject(new Error("Could not read the selected file.")); };
      reader.readAsDataURL(file);
    });
  }

  /* Warn about a slow submit at pick time rather than capping the size. Measured: a 1.9MB
   * CV takes ~33s on Fast-3G and ~63s on Slow-3G (base64 adds ~35% to the body). Telling
   * them up front lets them choose a smaller file or a better connection; rejecting the
   * file outright would turn a slow submission into no submission. */
  var LARGE_CV_BYTES = 1024 * 1024;
  var cvSizeNote = document.getElementById("cvSizeNote");

  function noteCvSize(file) {
    if (!cvSizeNote) return;
    var large = file.size > LARGE_CV_BYTES;
    if (large) {
      cvSizeNote.textContent =
        "This CV is " + (file.size / (1024 * 1024)).toFixed(1) + " MB. On a slow mobile " +
        "connection, submitting may take up to a minute — a smaller PDF will be quicker.";
    }
    cvSizeNote.classList.toggle("is-hidden", !large);
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
      if (cvSizeNote) cvSizeNote.classList.add("is-hidden");
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
      noteCvSize(file);
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

  /* ---------- Submit with a time-out ----------
   *
   * Measured worst case is ~63s (1.9MB CV on Slow-3G), so this sits well above it while
   * still bounding a stalled connection, which would otherwise leave the bar running
   * forever.
   */
  var SUBMIT_TIMEOUT_MS = 90000;

  function postWithTimeout(url, body) {
    // Plain-string body keeps this a "simple request" (no custom Content-Type), which
    // avoids a CORS preflight that the Apps Script Web App can't answer. AbortController
    // is safe here precisely because it adds no header and no upload listener — see the
    // "Submit progress" note above on why xhr.upload cannot be used.
    var options = { method: "POST", body: body };

    if (typeof AbortController === "undefined") return fetch(url, options);

    var controller = new AbortController();
    var timedOut = false;
    var timer = setTimeout(function () {
      timedOut = true;
      controller.abort();
    }, SUBMIT_TIMEOUT_MS);
    options.signal = controller.signal;

    return fetch(url, options).then(
      function (res) {
        clearTimeout(timer);
        return res;
      },
      function (err) {
        clearTimeout(timer);
        if (!timedOut) throw err;
        // Aborting stops us waiting; it does not stop Apps Script, which may well have
        // saved the row already. Retrying is safe — the server rejects a duplicate NSU ID
        // or email — so point them at that rather than claiming it failed.
        throw new Error(
          "This is taking longer than expected, so we stopped waiting. Your application " +
          "may still have been saved — please try submitting again, and we'll tell you if " +
          "it already went through."
        );
      }
    );
  }

  /* ---------- Timing ----------
   *
   * Printed to the browser console on every submission so a slow submit can be attributed
   * without guesswork:
   *
   *   payload          building the JSON body (waiting on FileReader if the CV was picked
   *                    a moment ago; ~0ms otherwise, since encoding starts at pick time)
   *   network+server   the fetch itself: uploading the base64 CV, the redirect Apps Script
   *                    web apps always issue, container start-up, and doPost
   *   Apps Script      what doPost itself measured, reported back in the response
   *
   * network+server minus Apps Script is upload time plus container cold start, neither of
   * which any code here can shorten.
   */
  function now() {
    return (window.performance && performance.now) ? performance.now() : Date.now();
  }

  function logTiming(t0, tSent, tDone, serverMs) {
    if (!window.console || !console.log) return;
    var parts = [
      "payload " + Math.round(tSent - t0) + "ms",
      "network+server " + Math.round(tDone - tSent) + "ms",
    ];
    if (serverMs != null) parts.push("of which Apps Script " + serverMs + "ms");
    parts.push("total " + Math.round(tDone - t0) + "ms");
    console.log("[submit] " + parts.join(" | "));
  }

  /* Runs fn after the browser has painted. requestAnimationFrame fires BEFORE the paint,
   * so the work goes in a setTimeout nested inside it. The extra timer is a backstop:
   * requestAnimationFrame never fires in a backgrounded tab, and the submission must start
   * regardless of whether the applicant switched away. */
  function afterPaint(fn) {
    var ran = false;
    function once() {
      if (ran) return;
      ran = true;
      fn();
    }
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(function () { setTimeout(once, 0); });
    }
    setTimeout(once, 100);
  }

  form.addEventListener("submit", function (evt) {
    evt.preventDefault();
    setStatus("", "");
    if (cvError) cvError.textContent = "";

    // Must run before reportValidity(), so `required` sees the trimmed value. Assigning
    // .value doesn't fire an input event, so the NSU ID's custom message is refreshed by
    // hand rather than left stale from the untrimmed value.
    trimAllFields();
    refreshNsuIdValidity();

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
    if (!validateChoiceGroups()) {
      setStatus("Please complete your meeting preferences below.", "error");
      return;
    }

    if (!SITE_CONFIG.APPS_SCRIPT_URL) {
      setStatus("Registration isn't connected yet — please email " + SITE_CONFIG.CONTACT_EMAIL + " instead.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Submitting…";
    showProgress();

    var t0 = now();
    var tSent = t0;

    /* Everything below is deferred until the disabled button and progress bar have
     * actually been painted. JSON.stringify over a base64 CV is a multi-megabyte
     * synchronous string operation, and running it in the same task as the click meant the
     * button still looked idle for the few hundred milliseconds it took — which is exactly
     * the moment applicants press it again. */
    afterPaint(function () {
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

          var body = JSON.stringify(payload);
          tSent = now();
          return postWithTimeout(SITE_CONFIG.APPS_SCRIPT_URL, body);
        })
        .then(function (res) { return res.text(); })
        .then(function (text) {
          var tDone = now();
          var data = null;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            data = null;
          }
          logTiming(t0, tSent, tDone, data && data.ms);
          if (!data) {
            // The backend answered with something other than JSON (typically an Apps Script
            // error page). The submission may still have been saved, so don't tell the
            // applicant it failed outright and push them into submitting twice.
            throw new Error(
              "We couldn't confirm your submission. It may have gone through — please email " +
              SITE_CONFIG.CONTACT_EMAIL + " to check before submitting again."
            );
          }
          // Success is shown only from here: the backend has written the row and said so.
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
  });
})();
