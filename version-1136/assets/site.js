// Site interactions for the static movie website.
(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = $('[data-hero-carousel]');

    if (!root) {
      return;
    }

    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    var next = $('[data-hero-next]', root);
    var prev = $('[data-hero-prev]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    play();
  }

  function setupFilters() {
    var input = $('[data-filter-input]');
    var year = $('[data-filter-year]');
    var cards = $all('[data-movie-card]');
    var count = $('[data-filter-count]');
    var empty = $('[data-empty-state]');

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function matches(card, text, selectedYear) {
      var blob = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var textOk = !text || blob.indexOf(text) !== -1;
      var yearOk = !selectedYear || cardYear === selectedYear;

      return textOk && yearOk;
    }

    function applyFilter() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var isVisible = matches(card, text, selectedYear);
        card.hidden = !isVisible;

        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (year) {
      year.addEventListener('change', applyFilter);
    }

    applyFilter();
  }

  function setupImageFallbacks() {
    $all('img[data-cover]').forEach(function (img) {
      function markFallback() {
        var frame = img.closest('.cover-frame');

        if (frame) {
          frame.classList.add('is-fallback');
        }

        img.remove();
      }

      img.addEventListener('error', markFallback);

      if (img.complete && img.naturalWidth === 0) {
        markFallback();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupImageFallbacks();
  });
})();
