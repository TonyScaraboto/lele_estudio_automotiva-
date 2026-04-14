var chips = document.querySelectorAll(".topbar__link[data-category]");
var categories = document.querySelectorAll(".menu-category[data-category]");

function setActive(cat) {
  chips.forEach(function (chip) {
    chip.classList.toggle("is-active", chip.getAttribute("data-category") === cat);
  });
}

if (categories.length && chips.length) {
  var observer = new IntersectionObserver(
    function (entries) {
      var visible = entries
        .filter(function (e) {
          return e.isIntersecting;
        })
        .sort(function (a, b) {
          return b.intersectionRatio - a.intersectionRatio;
        })[0];
      if (visible && visible.target.getAttribute("data-category")) {
        setActive(visible.target.getAttribute("data-category"));
      }
    },
    {
      root: null,
      rootMargin: "-35% 0px -45% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    }
  );

  categories.forEach(function (section) {
    observer.observe(section);
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var cat = chip.getAttribute("data-category");
      if (cat) setActive(cat);
    });
  });

  function onScroll() {
    if (window.scrollY < 200) setActive("carros-lavagens");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* Carrossel desktop: faixa rolável .section-media__strip dentro de .section-media--quad (≥960px). */
(function () {
  var mq = window.matchMedia("(min-width: 960px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var quads = document.querySelectorAll(".section-media--quad");
  if (!quads.length) return;

  function gapPx(el) {
    var g = window.getComputedStyle(el).gap;
    if (!g || g === "normal") return 16;
    var px = g.match(/^([\d.]+)px$/);
    if (px) return parseFloat(px[1]);
    var rem = g.match(/^([\d.]+)rem$/);
    if (rem) {
      var fs = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
      return parseFloat(rem[1]) * fs;
    }
    return 16;
  }

  function cardStep(strip) {
    var first = strip.querySelector(".section-media__item");
    if (!first) return 0;
    return first.offsetWidth + gapPx(strip);
  }

  function scrollNext(strip, useSmooth) {
    var max = strip.scrollWidth - strip.clientWidth;
    if (max <= 4) return;
    var step = cardStep(strip);
    if (step < 8) {
      step = strip.clientWidth + gapPx(strip);
    }
    if (step < 8) return;
    var next = strip.scrollLeft + step;
    var behavior = reduce.matches || !useSmooth ? "auto" : "smooth";
    if (next >= max - 2) {
      strip.scrollTo({ left: 0, behavior: behavior });
    } else {
      strip.scrollTo({ left: next, behavior: behavior });
    }
  }

  function scrollPrev(strip) {
    var step = cardStep(strip);
    if (step < 8) {
      step = strip.clientWidth + gapPx(strip);
    }
    if (step < 8) return;
    var prev = Math.max(0, strip.scrollLeft - step);
    strip.scrollTo({ left: prev, behavior: reduce.matches ? "auto" : "smooth" });
  }

  function attach(quad) {
    var strip = quad.querySelector(".section-media__strip") || quad;
    var nextBtn = quad.querySelector(".section-media__next");
    var timer = null;
    var paused = false;
    var inView = false;
    var intervalMs = 1500;

    function clearTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function tick() {
      if (!mq.matches || paused || !inView || document.visibilityState !== "visible") return;
      scrollNext(strip, false);
    }

    function startTimer() {
      clearTimer();
      if (!mq.matches || !inView || document.visibilityState !== "visible") return;
      timer = setInterval(tick, intervalMs);
    }

    function pauseThenResume(ms) {
      paused = true;
      clearTimer();
      window.clearTimeout(strip._carouselPauseT);
      strip._carouselPauseT = window.setTimeout(function () {
        paused = false;
        if (inView && mq.matches) startTimer();
      }, ms);
    }

    function setTabindex() {
      if (mq.matches) {
        strip.setAttribute("tabindex", "0");
        strip.setAttribute("data-carousel-desktop", "");
      } else {
        strip.removeAttribute("tabindex");
        strip.removeAttribute("data-carousel-desktop");
      }
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          clearTimer();
          if (inView && mq.matches) startTimer();
        });
      },
      { root: null, rootMargin: "0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    io.observe(quad);

    strip.addEventListener("mouseenter", function () {
      paused = true;
      clearTimer();
    });
    strip.addEventListener("mouseleave", function () {
      paused = false;
      if (inView && mq.matches) startTimer();
    });
    strip.addEventListener("pointerdown", function () {
      paused = true;
      clearTimer();
    });
    strip.addEventListener("pointerup", function () {
      paused = false;
      if (inView && mq.matches) startTimer();
    });
    strip.addEventListener(
      "wheel",
      function () {
        pauseThenResume(3200);
      },
      { passive: true }
    );

    strip.addEventListener("keydown", function (e) {
      if (!mq.matches) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext(strip, true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev(strip);
      }
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        scrollNext(strip, true);
        pauseThenResume(3500);
      });
    }

    function onMqOrReduce() {
      setTabindex();
      clearTimer();
      if (inView && mq.matches) startTimer();
    }

    mq.addEventListener("change", onMqOrReduce);
    reduce.addEventListener("change", onMqOrReduce);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") clearTimer();
      else if (inView && mq.matches) startTimer();
    });

    window.addEventListener(
      "resize",
      function () {
        clearTimer();
        if (inView && mq.matches) startTimer();
      },
      { passive: true }
    );

    setTabindex();
  }

  quads.forEach(attach);
})();
