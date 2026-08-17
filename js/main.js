(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Wire up the Google Form embed from config.js ---------- */
  var formFrame = document.getElementById("registrationForm");
  if (formFrame) {
    formFrame.setAttribute("src", SITE_CONFIG.GOOGLE_FORM_URL);
  }

  var fallbackLink = document.getElementById("formFallbackLink");
  if (fallbackLink) {
    fallbackLink.setAttribute("href", SITE_CONFIG.GOOGLE_FORM_URL.replace("?embedded=true", ""));
  }

  /* ---------- Footer contact + social from config.js ---------- */
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

  /* ---------- Header scroll state ---------- */
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

  /* ---------- Scroll reveal (with per-element stagger via --reveal-delay) ---------- */
  var revealTargets = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
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
  }

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
