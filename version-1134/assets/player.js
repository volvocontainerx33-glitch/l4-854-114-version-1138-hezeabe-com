(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        if (window.Hls) {
          resolve(window.Hls);
        }
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js');
  }

  window.createMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !cover || !options.source) {
      return;
    }

    function attemptPlay() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    function setup() {
      if (loaded) {
        attemptPlay();
        return;
      }
      loaded = true;
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
        attemptPlay();
        return;
      }
      getHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(options.source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            attemptPlay();
          });
          attemptPlay();
        } else {
          video.src = options.source;
          attemptPlay();
        }
      }).catch(function () {
        video.src = options.source;
        attemptPlay();
      });
    }

    function start() {
      cover.classList.add('is-hidden');
      setup();
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!loaded) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };
})();
