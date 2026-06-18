// HLS player initialization for static detail pages.
import { H as Hls } from './hls.js';

function setupPlayer(shell) {
  var video = shell.querySelector('.js-hls-player');
  var toggle = shell.querySelector('[data-player-toggle]');

  if (!video) {
    return;
  }

  var primarySource = video.getAttribute('data-src');
  var fallbackSource = video.getAttribute('data-fallback-src');
  var hls = null;
  var usingFallback = false;
  var attached = false;

  function attachSource(source) {
    if (!source) {
      return;
    }

    if (hls) {
      hls.destroy();
      hls = null;
    }

    attached = true;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal && fallbackSource && !usingFallback) {
          usingFallback = true;
          attachSource(fallbackSource);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }
  }

  function playVideo() {
    if (!attached) {
      attachSource(primarySource || fallbackSource);
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (fallbackSource && !usingFallback) {
          usingFallback = true;
          attachSource(fallbackSource);
          video.play().catch(function () {});
        }
      });
    }
  }

  attachSource(primarySource || fallbackSource);

  if (toggle) {
    toggle.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });

  video.addEventListener('ended', function () {
    shell.classList.remove('is-playing');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.player-shell').forEach(setupPlayer);
});
