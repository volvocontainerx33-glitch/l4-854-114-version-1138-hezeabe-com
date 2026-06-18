(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('[data-slider-track]');
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-dot]'));
    var previous = slider.querySelector('[data-prev]');
    var next = slider.querySelector('[data-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!track || slides.length === 0) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var container = panel.closest('main') || document;
    var searchInput = panel.querySelector('[data-card-search]');
    var filterButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var sortButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-sort-value]'));
    var grid = container.querySelector('[data-card-grid]');
    var empty = container.querySelector('[data-empty-state]');
    var activeCategory = 'all';
    var activeSort = 'default';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function cards() {
      if (!grid) {
        return [];
      }
      return Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    }

    function apply() {
      var query = normalize(searchInput ? searchInput.value : '');
      var visible = [];

      cards().forEach(function (card) {
        var matchesCategory = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
        var searchText = normalize(card.getAttribute('data-search'));
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var keep = matchesCategory && matchesQuery;
        card.classList.toggle('hidden-by-filter', !keep);
        if (keep) {
          visible.push(card);
        }
      });

      if (activeSort !== 'default') {
        visible.sort(function (a, b) {
          if (activeSort === 'rating') {
            return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
          }
          if (activeSort === 'year') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          if (activeSort === 'views') {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          }
          return 0;
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (empty) {
        empty.classList.toggle('show', visible.length === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        searchInput.value = query;
      }
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-filter-value') || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    sortButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeSort = button.getAttribute('data-sort-value') || 'default';
        sortButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    apply();
  });
}());

window.initMoviePlayer = function (source) {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var cover = player.querySelector('[data-player-cover]');
  var playButton = player.querySelector('[data-play-button]');
  var muteButton = player.querySelector('[data-mute-button]');
  var fullButton = player.querySelector('[data-full-button]');
  var loaded = false;
  var hls = null;

  function load() {
    if (loaded || !video) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hls) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });
      return;
    }

    video.src = source;
  }

  function play() {
    load();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  function toggle() {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (playButton) {
    playButton.addEventListener('click', toggle);
  }

  if (video) {
    video.addEventListener('click', toggle);
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.textContent = '暂停';
      }
    });
    video.addEventListener('pause', function () {
      if (playButton) {
        playButton.textContent = '播放';
      }
    });
  }

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      video.muted = !video.muted;
      muteButton.textContent = video.muted ? '开声' : '静音';
    });
  }

  if (fullButton) {
    fullButton.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
};
