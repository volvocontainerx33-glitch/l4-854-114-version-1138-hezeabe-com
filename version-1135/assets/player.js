(function () {
    function setupMoviePlayer(options) {
        var root = document.querySelector(options.root);
        if (!root) {
            return;
        }

        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var streamUrl = options.source;
        var attached = false;
        var hlsInstance = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    maxBufferLength: 30
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }

            attached = true;
        }

        function playVideo() {
            attachStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.setAttribute("controls", "controls");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (!attached) {
                playVideo();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
