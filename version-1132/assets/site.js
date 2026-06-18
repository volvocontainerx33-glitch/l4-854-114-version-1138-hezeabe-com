(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function setupFilters() {
    selectAll('[data-search-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var year = scope.querySelector('[data-year-filter]');
      var genre = scope.querySelector('[data-genre-filter]');
      var cards = selectAll('[data-movie-card]', scope);
      var empty = scope.querySelector('[data-empty-state]');
      if (!cards.length && (input || year || genre)) {
        cards = selectAll('[data-movie-card]', document);
        empty = document.querySelector('[data-empty-state]');
      }
      if (!cards.length) {
        return;
      }

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : '';
      }

      function filter() {
        var keyword = valueOf(input);
        var yearValue = valueOf(year);
        var genreValue = valueOf(genre);
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
          var cardGenre = String(card.getAttribute('data-genre') || '').toLowerCase();
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !yearValue || cardYear === yearValue;
          var matchGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1 || text.indexOf(genreValue) !== -1;
          var show = matchKeyword && matchYear && matchGenre;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener('input', filter);
          control.addEventListener('change', filter);
        }
      });
    });
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var mask = document.getElementById(options.maskId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function startPlay() {
      attachSource();
      video.controls = true;
      if (mask) {
        mask.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (mask) {
      mask.addEventListener('click', startPlay);
    }
    if (button) {
      button.addEventListener('click', startPlay);
    }
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        startPlay();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
