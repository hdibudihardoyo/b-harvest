/* ============================================================
   TropicalHarvest — Script Utama
   Vanilla JS, tidak ada dependensi eksternal
   ============================================================ */

(function () {
  "use strict";

  /* --------------------------------------------------------
     Deteksi preferensi reduced motion
  -------------------------------------------------------- */
  var gerakDikurangi = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* --------------------------------------------------------
     1. NAVIGASI — Efek kaca saat scroll
  -------------------------------------------------------- */
  var nav = document.getElementById("nav");

  function perbaruiNav() {
    if (window.scrollY > 40) {
      nav.classList.add("nav-solid", "nav-gelap");
    } else {
      nav.classList.remove("nav-solid", "nav-gelap");
    }
  }

  perbaruiNav();
  window.addEventListener("scroll", perbaruiNav, { passive: true });

  /* --------------------------------------------------------
     2. MENU MOBILE — Buka / tutup
  -------------------------------------------------------- */
  var tombolMenu = document.getElementById("tombol-menu");
  var menuMobile = document.getElementById("menu-mobile");

  tombolMenu.addEventListener("click", function () {
    var sedangTersembunyi = menuMobile.classList.contains("hidden");
    menuMobile.classList.toggle("hidden");
    tombolMenu.setAttribute("aria-expanded", String(sedangTersembunyi));
    /* Pastikan nav solid saat menu mobile terbuka */
    nav.classList.add("nav-solid", "nav-gelap");
  });

  /* Tutup menu mobile ketika link diklik */
  menuMobile.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menuMobile.classList.add("hidden");
      tombolMenu.setAttribute("aria-expanded", "false");
    });
  });

  /* --------------------------------------------------------
     3. SCROLL HALUS
  -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (tautan) {
    tautan.addEventListener("click", function (e) {
      var idTarget = this.getAttribute("href");
      if (idTarget.length < 2) return;
      var target = document.querySelector(idTarget);
      if (!target) return;
      e.preventDefault();
      var offset = 64; /* Tinggi nav */
      var posisiAtas =
        target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: posisiAtas,
        behavior: gerakDikurangi ? "auto" : "smooth",
      });
    });
  });

  /* --------------------------------------------------------
     4. REVEAL ON SCROLL
  -------------------------------------------------------- */
  var elemenReveal = document.querySelectorAll(".reveal, .reveal-stagger");

  if ("IntersectionObserver" in window && !gerakDikurangi) {
    var io = new IntersectionObserver(
      function (entri) {
        entri.forEach(function (entri) {
          if (entri.isIntersecting) {
            entri.target.classList.add("is-visible");
            io.unobserve(entri.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    elemenReveal.forEach(function (el) {
      io.observe(el);
    });
  } else {
    /* Fallback: langsung tampilkan semua */
    elemenReveal.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* --------------------------------------------------------
     5. JALUR EKSPOR 
  -------------------------------------------------------- */
  var bungkusRute = document.getElementById("bungkus-rute");

  if (bungkusRute) {
    var garisRute = document.getElementById("garis-rute");
    var titikRute = bungkusRute.querySelectorAll(".titik-rute");

    var ioRute = new IntersectionObserver(
      function (entri) {
        entri.forEach(function (entri) {
          if (entri.isIntersecting) {
            /* Gambar garis */
            if (garisRute) garisRute.classList.add("sudah-digambar");
            /* Pop-in setiap titik secara berurutan */
            titikRute.forEach(function (titik, i) {
              setTimeout(
                function () {
                  titik.classList.add("tampil");
                },
                250 + i * 220,
              );
            });
            ioRute.unobserve(entri.target);
          }
        });
      },
      { threshold: 0.25 },
    );

    ioRute.observe(bungkusRute);
  }

  /* --------------------------------------------------------
     6. COUNTER STATISTIK 
  -------------------------------------------------------- */
  var semuaCounter = document.querySelectorAll("[data-jumlah]");

  function animasiCounter(el) {
    var target = parseInt(el.getAttribute("data-jumlah"), 10);
    if (gerakDikurangi) {
      el.textContent = target.toLocaleString("id-ID");
      return;
    }
    var durasi = 1400;
    var mulai = null;

    function langkah(ts) {
      if (!mulai) mulai = ts;
      var progres = Math.min((ts - mulai) / durasi, 1);
      var eased = 1 - Math.pow(1 - progres, 3); /* ease-out cubic */
      el.textContent = Math.round(eased * target).toLocaleString("id-ID");
      if (progres < 1) requestAnimationFrame(langkah);
    }

    requestAnimationFrame(langkah);
  }

  if (semuaCounter.length) {
    var ioStat = new IntersectionObserver(
      function (entri) {
        entri.forEach(function (entri) {
          if (entri.isIntersecting) {
            animasiCounter(entri.target);
            ioStat.unobserve(entri.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    semuaCounter.forEach(function (c) {
      ioStat.observe(c);
    });
  }

  /* --------------------------------------------------------
     7. PARALLAX HERO
  -------------------------------------------------------- */
  var gambarHero = document.getElementById("gambar-hero");

  if (gambarHero && !gerakDikurangi) {
    window.addEventListener(
      "scroll",
      function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          gambarHero.style.transform =
            "translateY(" + y * 0.18 + "px) scale(1.08)";
        }
      },
      { passive: true },
    );
  }

  /* --------------------------------------------------------
     8. RIPPLE BUTTON 
  -------------------------------------------------------- */
  document.querySelectorAll(".tombol-ripple").forEach(function (tombol) {
    tombol.addEventListener("click", function (e) {
      var rect = tombol.getBoundingClientRect();
      var lingk = document.createElement("span");
      var ukuran = Math.max(rect.width, rect.height) * 1.2;

      lingk.className = "lingkaran-ripple";
      lingk.style.width = lingk.style.height = ukuran + "px";
      lingk.style.left = e.clientX - rect.left - ukuran / 2 + "px";
      lingk.style.top = e.clientY - rect.top - ukuran / 2 + "px";

      tombol.appendChild(lingk);
      setTimeout(function () {
        lingk.remove();
      }, 650);
    });
  });

  /* --------------------------------------------------------
     9. CAROUSEL TESTIMONI 
  -------------------------------------------------------- */
  var jalurTesti = document.getElementById("jalur-testi");
  var bungkusDot = document.getElementById("dot-testi");
  var tombolPrev = document.getElementById("testi-prev");
  var tombolNext = document.getElementById("testi-next");

  if (jalurTesti) {
    var totalSlide = jalurTesti.children.length;
    var slideAktif = 0;

    /* Buat dot navigasi */
    for (var i = 0; i < totalSlide; i++) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Testimoni ke-" + (i + 1));
      dot.className =
        "w-2 h-2 rounded-full transition-colors " +
        (i === 0 ? "bg-leaf" : "bg-ink/20");

      dot.addEventListener(
        "click",
        (function (idx) {
          return function () {
            pindahSlide(idx);
          };
        })(i),
      );

      bungkusDot.appendChild(dot);
    }

    function renderSlide() {
      jalurTesti.style.transform = "translateX(-" + slideAktif * 100 + "%)";
      Array.prototype.forEach.call(bungkusDot.children, function (d, i) {
        d.className =
          "w-2 h-2 rounded-full transition-colors " +
          (i === slideAktif ? "bg-leaf" : "bg-ink/20");
      });
    }

    function pindahSlide(idx) {
      slideAktif = (idx + totalSlide) % totalSlide;
      renderSlide();
    }

    tombolPrev.addEventListener("click", function () {
      pindahSlide(slideAktif - 1);
    });
    tombolNext.addEventListener("click", function () {
      pindahSlide(slideAktif + 1);
    });

    /* Autoplay setiap 6 detik, berhenti saat di-hover */
    var autoplay = setInterval(function () {
      pindahSlide(slideAktif + 1);
    }, 6000);
    jalurTesti.closest("section").addEventListener("mouseenter", function () {
      clearInterval(autoplay);
    });
  }

  /* --------------------------------------------------------
     10. FORMULIR KONTAK 
  -------------------------------------------------------- */
  var formKontak = document.getElementById("form-kontak");

  if (formKontak) {
    formKontak.addEventListener("submit", function (e) {
      e.preventDefault();
      var pesanSukses = document.getElementById("pesan-sukses");
      pesanSukses.classList.remove("hidden");

      /* Nonaktifkan semua input setelah kirim */
      formKontak
        .querySelectorAll("input, textarea, select")
        .forEach(function (field) {
          if (field.type !== "submit") field.disabled = true;
        });
    });
  }
})();
