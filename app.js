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
