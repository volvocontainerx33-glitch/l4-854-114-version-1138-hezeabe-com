(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener('click', function () { show(index - 1); play(); });
    if (next) next.addEventListener('click', function () { show(index + 1); play(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); play(); });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var sortSelect = document.querySelector('[data-sort-cards]');
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.filter-card'));

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (input && query) input.value = query;

    function apply() {
      var q = normalize(input ? input.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.textContent
        ].join(' '));
        var okQuery = !q || haystack.indexOf(q) !== -1;
        var okType = !type || normalize(card.dataset.type) === type;
        var okYear = !year || normalize(card.dataset.year) === year;
        card.classList.toggle('is-hidden', !(okQuery && okType && okYear));
      });
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();
      if (mode === 'year') {
        sorted.sort(function (a, b) { return Number(b.dataset.year || 0) - Number(a.dataset.year || 0); });
      } else if (mode === 'score') {
        sorted.sort(function (a, b) { return Number(b.dataset.score || 0) - Number(a.dataset.score || 0); });
      } else {
        sorted.sort(function (a, b) { return cards.indexOf(a) - cards.indexOf(b); });
      }
      sorted.forEach(function (card) { grid.appendChild(card); });
      apply();
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) control.addEventListener('input', apply);
      if (control) control.addEventListener('change', apply);
    });
    if (sortSelect) sortSelect.addEventListener('change', sortCards);
    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-overlay');
      var stream = player.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;
      if (!video || !button || !stream) return;

      function start() {
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        button.classList.add('hidden-layer');
        video.setAttribute('controls', 'controls');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      }

      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) start();
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) hlsInstance.destroy();
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
