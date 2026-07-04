/* ============================================================
   B-Harvest — Main Script
   Vanilla JS, no external dependencies
   ============================================================ */

(function () {
  "use strict";

  /* --------------------------------------------------------
     Detect reduced motion preference
  -------------------------------------------------------- */
  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* --------------------------------------------------------
     1. NAVIGATION — Glass effect on scroll
  -------------------------------------------------------- */
  var navElement = document.getElementById("nav");

  function updateNav() {
    if (window.scrollY > 40) {
      navElement.classList.add("nav-solid", "nav-gelap");
    } else {
      navElement.classList.remove("nav-solid", "nav-gelap");
    }
  }

  updateNav();
  window.addEventListener("scroll", updateNav, { passive: true });

  /* --------------------------------------------------------
     2. MOBILE MENU — Open / Close
  -------------------------------------------------------- */
  var menuButton = document.getElementById("tombol-menu");
  var mobileMenu = document.getElementById("menu-mobile");

  menuButton.addEventListener("click", function () {
    var isHidden = mobileMenu.classList.contains("hidden");
    mobileMenu.classList.toggle("hidden");
    menuButton.setAttribute("aria-expanded", String(isHidden));
    /* Ensure nav solid when mobile menu opens */
    navElement.classList.add("nav-solid", "nav-gelap");
  });

  /* Close mobile menu when link is clicked */
  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.add("hidden");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  /* --------------------------------------------------------
     3. SMOOTH SCROLL
  -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId.length < 2) return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      var offset = 64; /* Nav height */
      var topPosition =
        target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: topPosition,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  });

  /* --------------------------------------------------------
     4. REVEAL ON SCROLL
  -------------------------------------------------------- */
  var revealElements = document.querySelectorAll(".reveal, .reveal-stagger");

  if ("IntersectionObserver" in window && !reducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    /* Fallback: show all immediately */
    revealElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* --------------------------------------------------------
     5. EXPORT PROCESS
  -------------------------------------------------------- */
  var routeWrapper = document.getElementById("bungkus-rute");

  if (routeWrapper) {
    var routeLine = document.getElementById("garis-rute");
    var routePoints = routeWrapper.querySelectorAll(".titik-rute");

    var routeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* Draw line */
            if (routeLine) routeLine.classList.add("drawn");
            /* Pop-in each point sequentially */
            routePoints.forEach(function (point, i) {
              setTimeout(
                function () {
                  point.classList.add("show");
                },
                250 + i * 220,
              );
            });
            routeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 },
    );

    routeObserver.observe(routeWrapper);
  }

  /* --------------------------------------------------------
     6. COUNTER STATISTICS
  -------------------------------------------------------- */
  var allCounters = document.querySelectorAll("[data-jumlah]");

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-jumlah"), 10);
    if (reducedMotion) {
      el.textContent = target.toLocaleString("id-ID");
      return;
    }
    var duration = 1400;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      el.textContent = Math.round(eased * target).toLocaleString("id-ID");
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (allCounters.length) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    allCounters.forEach(function (c) {
      statObserver.observe(c);
    });
  }

  /* --------------------------------------------------------
     7. PARALLAX HERO
  -------------------------------------------------------- */
  var heroImage = document.getElementById("gambar-hero");

  if (heroImage && !reducedMotion) {
    window.addEventListener(
      "scroll",
      function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroImage.style.transform =
            "translateY(" + y * 0.18 + "px) scale(1.08)";
        }
      },
      { passive: true },
    );
  }

  /* --------------------------------------------------------
     8. RIPPLE BUTTON
  -------------------------------------------------------- */
  document.querySelectorAll(".tombol-ripple").forEach(function (button) {
    button.addEventListener("click", function (e) {
      var rect = button.getBoundingClientRect();
      var ripple = document.createElement("span");
      var size = Math.max(rect.width, rect.height) * 1.2;

      ripple.className = "lingkaran-ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";

      button.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 650);
    });
  });

  /* --------------------------------------------------------
     9. TESTIMONIAL CAROUSEL — Responsive, Accessible, Auto-play
     Supports 3+ slides with dynamic dot navigation
  -------------------------------------------------------- */
  var testimonialTrack = document.getElementById("jalur-testi");
  var dotContainer = document.getElementById("dot-testi");
  var prevButton = document.getElementById("testi-prev");
  var nextButton = document.getElementById("testi-next");

  if (testimonialTrack) {
    /* Carousel config */
    var carouselConfig = {
      totalSlides: testimonialTrack.children.length,
      currentSlide: 0,
      autoplayInterval: 6000,
      autoplayTimer: null,
    };

    /* Create dot navigation for each slide */
    function createDotNavigation() {
      for (var i = 0; i < carouselConfig.totalSlides; i++) {
        var dot = document.createElement("button");
        dot.setAttribute("aria-label", "Testimonial " + (i + 1));
        dot.setAttribute("data-slide", i);
        dot.className =
          "w-2 h-2 rounded-full transition-colors " +
          (i === 0 ? "bg-leaf" : "bg-ink/20");

        dot.addEventListener("click", function () {
          goToSlide(parseInt(this.getAttribute("data-slide"), 10));
        });

        dotContainer.appendChild(dot);
      }
    }

    /* Update slide and indicator appearance */
    function renderSlide() {
      var offsetX = -carouselConfig.currentSlide * 100;
      testimonialTrack.style.transform = "translateX(" + offsetX + "%)";

      /* Update all dot styles */
      Array.prototype.forEach.call(dotContainer.children, function (dot, i) {
        var isActive = i === carouselConfig.currentSlide;
        dot.className =
          "w-2 h-2 rounded-full transition-colors " +
          (isActive ? "bg-leaf" : "bg-ink/20");
        dot.setAttribute("aria-pressed", isActive);
      });
    }

    /* Go to specific slide (with wrapping) */
    function goToSlide(idx) {
      carouselConfig.currentSlide =
        (idx + carouselConfig.totalSlides) % carouselConfig.totalSlides;
      renderSlide();
      /* Reset autoplay timer */
      startAutoplay();
    }

    /* Autoplay logic */
    function startAutoplay() {
      if (carouselConfig.autoplayTimer) {
        clearInterval(carouselConfig.autoplayTimer);
      }
      carouselConfig.autoplayTimer = setInterval(function () {
        goToSlide(carouselConfig.currentSlide + 1);
      }, carouselConfig.autoplayInterval);
    }

    /* Event listeners */
    prevButton.addEventListener("click", function () {
      goToSlide(carouselConfig.currentSlide - 1);
    });

    nextButton.addEventListener("click", function () {
      goToSlide(carouselConfig.currentSlide + 1);
    });

    /* Pause autoplay on hover, resume on leave */
    var testimonialSection = testimonialTrack.closest("section");
    testimonialSection.addEventListener("mouseenter", function () {
      if (carouselConfig.autoplayTimer) {
        clearInterval(carouselConfig.autoplayTimer);
      }
    });
    testimonialSection.addEventListener("mouseleave", function () {
      startAutoplay();
    });

    /* Initialize */
    createDotNavigation();
    renderSlide();
    startAutoplay();
  }

  /* --------------------------------------------------------
     10. CONTACT FORM
  -------------------------------------------------------- */
  var contactForm = document.getElementById("form-kontak");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var successMessage = document.getElementById("pesan-sukses");
      successMessage.classList.remove("hidden");

      /* Disable all inputs after submit */
      contactForm
        .querySelectorAll("input, textarea, select")
        .forEach(function (field) {
          if (field.type !== "submit") field.disabled = true;
        });
    });
  }

  /* --------------------------------------------------------
     11. TRANSLATION
  -------------------------------------------------------- */

  const LANG_KEY = "site-lang";
  const DEFAULT_LANG = "id";
  const SUPPORTED = ["id", "en"];

  let dict = {};
  let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;

  // Ambil nilai dari object nested pakai key string, contoh: "nav.produk"
  function getNested(obj, path) {
    return path
      .split(".")
      .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }

  async function loadDictionary(lang) {
    const res = await fetch(`lang/${lang}.json`);
    if (!res.ok) throw new Error(`Gagal memuat file bahasa: ${lang}`);
    return res.json();
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = getNested(dict, key);
      if (value !== undefined) {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const value = getNested(dict, key);
      if (value !== undefined) el.setAttribute("placeholder", value);
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      const value = getNested(dict, key);
      if (value !== undefined) el.setAttribute("alt", value);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      const value = getNested(dict, key);
      if (value !== undefined) el.setAttribute("aria-label", value);
    });

    document.documentElement.setAttribute("lang", currentLang);
    updateSwitcherUI();
  }

  function updateSwitcherUI() {
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      const isActive = btn.getAttribute("data-lang-switch") === currentLang;
      btn.classList.toggle("lang-active", isActive);
    });
  }

  async function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) return;
    try {
      dict = await loadDictionary(lang);
      currentLang = lang;
      localStorage.setItem(LANG_KEY, lang);
      applyTranslations();
    } catch (err) {
      console.error(err);
    }
  }

  function initLanguageSwitcher() {
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang-switch");
        setLanguage(lang);
      });
    });

    // Toggle sederhana (satu tombol, ganti ID <-> EN)
    document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = currentLang === "id" ? "en" : "id";
        setLanguage(next);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLanguageSwitcher();
    setLanguage(currentLang);
  });

  // Expose kalau perlu dipanggil manual dari script lain
  window.i18n = { setLanguage, getCurrentLang: () => currentLang };
})();
