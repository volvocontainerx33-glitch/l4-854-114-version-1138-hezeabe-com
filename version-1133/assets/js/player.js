(function () {
    function mountPlayer(shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-overlay");
        var stream = shell.getAttribute("data-stream");
        var hls = null;

        if (!video || !button || !stream) {
            return;
        }

        function attachStream() {
            if (video.dataset.ready === "true") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.dataset.ready = "true";
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.dataset.ready = "true";
                return;
            }

            video.src = stream;
            video.dataset.ready = "true";
        }

        function start() {
            attachStream();
            shell.classList.add("is-playing");
            video.controls = true;
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        button.addEventListener("click", start);

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(mountPlayer);
})();
