(function () {
  "use strict";

  /* ---------- Apply Google Form URL everywhere from config.js ---------- */
  document.querySelectorAll(".js-apply-link").forEach(function (el) {
    el.setAttribute("href", SITE_CONFIG.GOOGLE_FORM_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  var emailLink = document.querySelector(".js-contact-email");
  if (emailLink) {
    emailLink.textContent = SITE_CONFIG.CONTACT_EMAIL;
    emailLink.setAttribute("href", "mailto:" + SITE_CONFIG.CONTACT_EMAIL);
  }

  var socialMap = {
    ".js-social-facebook": SITE_CONFIG.SOCIAL.facebook,
    ".js-social-instagram": SITE_CONFIG.SOCIAL.instagram,
    ".js-social-linkedin": SITE_CONFIG.SOCIAL.linkedin,
  };
  Object.keys(socialMap).forEach(function (selector) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute("href", socialMap[selector]);
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header shrink/border on scroll ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  navToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Active nav link highlighting ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".main-nav a[href^='#']");

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach(function (section) { sectionObserver.observe(section); });

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll("[data-reveal]");
  var revealObserver = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  revealTargets.forEach(function (el) { revealObserver.observe(el); });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      item.parentElement.querySelectorAll(".faq-item").forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
