(function () {
  "use strict";

  var grid = document.getElementById("mentorGrid");
  if (!grid) return;

  var MAX_PILLS = 3;

  function el(tag, props) {
    var node = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (key) { node[key] = props[key]; });
    return node;
  }

  function initials(name) {
    var parts = name
      .replace(/,.*$/, "") // drop trailing suffixes like ", Ph.D."
      .split(/\s+/)
      .filter(function (part) { return part && !/^(dr|mr|mrs|ms|prof)\.?$/i.test(part); });
    if (!parts.length) return "";
    var first = parts[0][0];
    var last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }

  // Shared with js/mentor-detail.js — must stay identical so links generated here resolve there.
  function slugify(name) {
    return name
      .toLowerCase()
      .replace(/[.,]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  // Card shows a compact "Role · Company" line; the full title still lives on the profile page.
  function cardTitle(title) {
    return title.replace(/ at ([^·]*)$/, " · $1");
  }

  (SITE_CONFIG.MENTORS || []).forEach(function (mentor, i) {
    var slug = slugify(mentor.name);
    var card = el("a", {
      className: "mentor-card",
      href: "mentor.html?slug=" + encodeURIComponent(slug),
    });
    card.setAttribute("aria-label", "View " + mentor.name + "'s mentor profile");
    card.setAttribute("data-reveal", "");
    card.style.setProperty("--reveal-delay", (i % 4) * 60 + "ms");

    var identity = el("div", { className: "mentor-card-identity" });

    var avatar = el("div", { className: "mentor-card-avatar" });
    if (mentor.photo) {
      avatar.appendChild(el("img", { src: mentor.photo, alt: mentor.name, loading: "lazy" }));
    } else {
      avatar.appendChild(el("div", { className: "mentor-card-avatar--placeholder", textContent: initials(mentor.name) }));
    }
    identity.appendChild(avatar);

    var info = el("div", { className: "mentor-card-info" });
    info.appendChild(el("h3", { className: "mentor-card-name", textContent: mentor.name }));
    if (mentor.title) {
      info.appendChild(el("p", { className: "mentor-card-role", textContent: cardTitle(mentor.title) }));
    }
    identity.appendChild(info);

    var chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chevron.setAttribute("class", "mentor-card-go");
    chevron.setAttribute("viewBox", "0 0 24 24");
    chevron.setAttribute("fill", "none");
    chevron.setAttribute("stroke", "currentColor");
    chevron.setAttribute("stroke-width", "2.6");
    chevron.setAttribute("stroke-linecap", "round");
    chevron.setAttribute("stroke-linejoin", "round");
    chevron.setAttribute("aria-hidden", "true");
    var chevronPath = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    chevronPath.setAttribute("points", "9 6 15 12 9 18");
    chevron.appendChild(chevronPath);
    identity.appendChild(chevron);

    card.appendChild(identity);

    if (mentor.tags && mentor.tags.length) {
      card.appendChild(el("hr", { className: "mentor-card-divider" }));

      var areas = el("div", { className: "mentor-card-areas" });
      areas.appendChild(el("p", { className: "mentor-card-areas-label", textContent: "Mentors in" }));

      var pillWrap = el("div", { className: "mentor-card-pills" });
      var tags = mentor.tags;
      var shown = tags.length > MAX_PILLS ? tags.slice(0, MAX_PILLS - 1) : tags;
      shown.forEach(function (tag) {
        pillWrap.appendChild(el("span", { className: "mentor-pill", textContent: tag }));
      });
      if (tags.length > MAX_PILLS) {
        var remaining = tags.length - shown.length;
        pillWrap.appendChild(el("span", { className: "mentor-pill mentor-pill--more", textContent: "+" + remaining + " more" }));
      }
      areas.appendChild(pillWrap);
      card.appendChild(areas);
    }

    grid.appendChild(card);
  });
})();
