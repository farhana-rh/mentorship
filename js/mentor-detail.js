(function () {
  "use strict";

  var content = document.getElementById("mentorDetailContent");
  var notFound = document.getElementById("mentorNotFound");
  if (!content) return;

  function el(tag, props) {
    var node = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (key) { node[key] = props[key]; });
    return node;
  }

  function initials(name) {
    var parts = name
      .replace(/,.*$/, "")
      .split(/\s+/)
      .filter(function (part) { return part && !/^(dr|mr|mrs|ms|prof)\.?$/i.test(part); });
    if (!parts.length) return "";
    var first = parts[0][0];
    var last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  // Shared with js/mentors.js — must stay identical so links generated there resolve here.
  function slugify(name) {
    return name
      .toLowerCase()
      .replace(/[.,]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function roleLine(title) {
    return title.replace(/ at ([^·]*)$/, " · $1");
  }

  function sectionHeading(text) {
    return el("h3", { className: "mentor-side-heading", textContent: text });
  }

  var slug = new URLSearchParams(window.location.search).get("slug") || "";
  var mentor = (SITE_CONFIG.MENTORS || []).find(function (m) { return slugify(m.name) === slug; });

  if (!mentor) {
    if (notFound) notFound.classList.remove("is-hidden");
    return;
  }

  document.title = mentor.name + " — INSB WIE Mentorship Program";
  var metaDescription = document.getElementById("pageDescription");
  if (metaDescription) {
    metaDescription.setAttribute("content", mentor.name + (mentor.title ? ", " + mentor.title : "") + " — INSB WIE Mentorship Program mentor.");
  }

  /* ---------- Hero ---------- */
  var hero = el("div", { className: "mentor-hero" });

  var avatar = el("div", { className: "mentor-hero-avatar" });
  if (mentor.photo) {
    avatar.appendChild(el("img", { src: mentor.photo, alt: mentor.name }));
  } else {
    avatar.appendChild(el("div", { className: "mentor-hero-avatar--placeholder", textContent: initials(mentor.name) }));
  }
  hero.appendChild(avatar);

  var heroInfo = el("div", { className: "mentor-hero-info" });
  heroInfo.appendChild(el("h1", { className: "mentor-hero-name", textContent: mentor.name }));
  if (mentor.title) {
    heroInfo.appendChild(el("p", { className: "mentor-hero-role", textContent: roleLine(mentor.title) }));
  }

  var actions = el("div", { className: "mentor-hero-actions" });
  actions.appendChild(el("a", {
    className: "mentor-btn mentor-btn--primary",
    href: "index.html#register",
    textContent: "Request mentorship",
  }));
  heroInfo.appendChild(actions);
  hero.appendChild(heroInfo);
  content.appendChild(hero);

  /* ---------- Two-column body ---------- */
  var body = el("div", { className: "mentor-body" });

  var about = el("section", { className: "mentor-about" });
  about.appendChild(el("h2", { className: "mentor-section-heading", textContent: "About" }));
  var paragraphs = Array.isArray(mentor.bio) ? mentor.bio : String(mentor.bio || "").split(/\n+/);
  paragraphs
    .filter(function (text) { return text.trim(); })
    .forEach(function (text) {
      about.appendChild(el("p", { className: "mentor-about-text", textContent: text.trim() }));
    });
  body.appendChild(about);

  var side = el("aside", { className: "mentor-side" });

  if (mentor.tags && mentor.tags.length) {
    var areas = el("section", { className: "mentor-side-section" });
    areas.appendChild(sectionHeading("Mentors in"));
    var pills = el("div", { className: "mentor-side-pills" });
    mentor.tags.forEach(function (tag) {
      pills.appendChild(el("span", { className: "mentor-pill", textContent: tag }));
    });
    areas.appendChild(pills);
    side.appendChild(areas);
  }

  if (mentor.education && mentor.education.length) {
    var edu = el("section", { className: "mentor-side-section" });
    edu.appendChild(sectionHeading("Education"));
    var eduList = el("ul", { className: "mentor-edu-list" });
    mentor.education.forEach(function (entry) {
      var item = el("li", { className: "mentor-edu-item" });
      item.appendChild(el("span", { className: "mentor-edu-degree", textContent: entry.degree }));
      if (entry.institution) {
        item.appendChild(el("span", { className: "mentor-edu-school", textContent: entry.institution }));
      }
      eduList.appendChild(item);
    });
    edu.appendChild(eduList);
    side.appendChild(edu);
  }

  var glanceRows = [
    { label: "Experience", value: mentor.experience },
    { label: "Location", value: mentor.location },
    { label: "Availability", value: mentor.availability || SITE_CONFIG.DEFAULT_AVAILABILITY, isAvailability: true },
  ].filter(function (row) { return row.value; });

  if (glanceRows.length) {
    var glance = el("section", { className: "mentor-side-section" });
    glance.appendChild(sectionHeading("At a glance"));
    var list = el("dl", { className: "mentor-glance" });
    glanceRows.forEach(function (row) {
      var wrap = el("div", { className: "mentor-glance-row" });
      wrap.appendChild(el("dt", { className: "mentor-glance-label", textContent: row.label }));
      wrap.appendChild(el("dd", {
        className: "mentor-glance-value" + (row.isAvailability ? " mentor-glance-value--open" : ""),
        textContent: row.value,
      }));
      list.appendChild(wrap);
    });
    glance.appendChild(list);
    side.appendChild(glance);
  }

  body.appendChild(side);
  content.appendChild(body);
})();
