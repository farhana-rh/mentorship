(function () {
  "use strict";

  var grid = document.getElementById("mentorGrid");
  if (!grid) return;

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

  (SITE_CONFIG.MENTORS || []).forEach(function (mentor, i) {
    var card = el("article", { className: "mentor-card panel" });
    card.setAttribute("data-reveal", "");
    card.style.setProperty("--reveal-delay", (i % 4) * 60 + "ms");

    var portrait = el("div", { className: "mentor-portrait" });
    if (mentor.photo) {
      portrait.appendChild(el("img", { src: mentor.photo, alt: mentor.name, loading: "lazy" }));
    } else {
      var placeholder = el("div", { className: "mentor-portrait--placeholder", textContent: initials(mentor.name) });
      portrait.appendChild(placeholder);
    }
    card.appendChild(portrait);

    card.appendChild(el("h3", { textContent: mentor.name }));

    if (mentor.title) {
      card.appendChild(el("p", { className: "mentor-title", textContent: mentor.title }));
    }

    if (mentor.education) {
      card.appendChild(el("p", { className: "mentor-education", textContent: mentor.education }));
    }

    if (mentor.bio) {
      card.appendChild(el("p", { className: "mentor-bio", textContent: mentor.bio }));
    }

    if (mentor.tags && mentor.tags.length) {
      var tagWrap = el("div", { className: "mentor-tags" });
      mentor.tags.forEach(function (tag) {
        tagWrap.appendChild(el("span", { className: "tag", textContent: tag }));
      });
      card.appendChild(tagWrap);
    }

    grid.appendChild(card);
  });
})();
