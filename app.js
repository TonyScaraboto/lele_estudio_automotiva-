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

/* Carrossel desktop: .section-media--quad (≥960px). Abaixo de 960px mantém-se só a grelha. */
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

  function cardStep(el) {
    var first = el.querySelector(".section-media__item");
    if (!first) return 0;
    return first.offsetWidth + gapPx(el);
  }

  function scrollNext(el) {
    var max = el.scrollWidth - el.clientWidth;
    if (max <= 4) return;
    var step = cardStep(el);
    if (step < 8) return;
    var next = el.scrollLeft + step * 0.98;
    var behavior = reduce.matches ? "auto" : "smooth";
    if (next >= max - 2) {
      el.scrollTo({ left: 0, behavior: behavior });
    } else {
      el.scrollTo({ left: next, behavior: behavior });
    }
  }

  function scrollPrev(el) {
    var step = cardStep(el);
    if (step < 8) return;
    var prev = Math.max(0, el.scrollLeft - step * 0.98);
    el.scrollTo({ left: prev, behavior: reduce.matches ? "auto" : "smooth" });
  }

  function attach(el) {
    var timer = null;
    var paused = false;
    var inView = false;
    var intervalMs = 4200;

    function clearTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function tick() {
      if (!mq.matches || reduce.matches || paused || !inView || document.visibilityState !== "visible") return;
      scrollNext(el);
    }

    function startTimer() {
      clearTimer();
      if (!mq.matches || reduce.matches || !inView || document.visibilityState !== "visible") return;
      timer = setInterval(tick, intervalMs);
    }

    function setTabindex() {
      if (mq.matches) {
        el.setAttribute("tabindex", "0");
        el.setAttribute("data-carousel-desktop", "");
      } else {
        el.removeAttribute("tabindex");
        el.removeAttribute("data-carousel-desktop");
      }
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          clearTimer();
          if (inView && mq.matches && !reduce.matches) startTimer();
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    io.observe(el);

    el.addEventListener("mouseenter", function () {
      paused = true;
      clearTimer();
    });
    el.addEventListener("mouseleave", function () {
      paused = false;
      if (inView && mq.matches && !reduce.matches) startTimer();
    });
    el.addEventListener("pointerdown", function () {
      paused = true;
      clearTimer();
    });
    el.addEventListener("pointerup", function () {
      paused = false;
      if (inView && mq.matches && !reduce.matches) startTimer();
    });
    el.addEventListener(
      "wheel",
      function () {
        paused = true;
        clearTimer();
        window.clearTimeout(el._carouselWheelT);
        el._carouselWheelT = window.setTimeout(function () {
          paused = false;
          if (inView && mq.matches && !reduce.matches) startTimer();
        }, 3200);
      },
      { passive: true }
    );

    el.addEventListener("keydown", function (e) {
      if (!mq.matches) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext(el);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev(el);
      }
    });

    function onMqOrReduce() {
      setTabindex();
      clearTimer();
      if (inView && mq.matches && !reduce.matches) startTimer();
    }

    mq.addEventListener("change", onMqOrReduce);
    reduce.addEventListener("change", onMqOrReduce);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") clearTimer();
      else if (inView && mq.matches && !reduce.matches) startTimer();
    });

    window.addEventListener(
      "resize",
      function () {
        clearTimer();
        if (inView && mq.matches && !reduce.matches) startTimer();
      },
      { passive: true }
    );

    setTabindex();
  }

  quads.forEach(attach);
})();
