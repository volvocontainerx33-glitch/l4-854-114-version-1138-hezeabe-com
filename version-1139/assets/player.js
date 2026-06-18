(function () {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    var box = document.querySelector('.player-box');
    var holder = document.getElementById('movie-stream');
    if (!video || !overlay || !holder) {
        return;
    }

    var streamUrl = '';
    try {
        streamUrl = JSON.parse(holder.textContent || '{}').url || '';
    } catch (error) {
        streamUrl = '';
    }

    var ready = false;

    function loadVideo() {
        if (ready || !streamUrl) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function play() {
        loadVideo();
        if (box) {
            box.classList.add('is-playing');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
        if (!ready || video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        if (box) {
            box.classList.add('is-playing');
        }
    });
    video.addEventListener('pause', function () {
        if (box && video.currentTime === 0) {
            box.classList.remove('is-playing');
        }
    });
})();
