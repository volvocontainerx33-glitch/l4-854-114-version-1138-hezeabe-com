(function () {
  function setupPlayer() {
    var video = document.querySelector('[data-video-src]');
    if (!video) {
      return;
    }
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-play-button]');
    var hls = null;
    var ready = false;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function attach(autoPlay) {
      var source = video.getAttribute('data-video-src');
      if (!source) {
        return;
      }
      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          ready = true;
        } else if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          ready = true;
        } else {
          video.src = source;
          ready = true;
        }
      }
      hideOverlay();
      if (autoPlay) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        attach(true);
      });
    }

    video.addEventListener('click', function () {
      if (!ready) {
        attach(true);
      }
    });

    video.addEventListener('play', hideOverlay);

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
