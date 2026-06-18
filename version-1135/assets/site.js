(function () {
    function setupMobileNavigation() {
        document.querySelectorAll(".nav-toggle").forEach(function (button) {
            var header = button.closest(".site-header");
            var menu = header ? header.querySelector(".mobile-nav") : null;
            if (!menu) {
                return;
            }
            button.addEventListener("click", function () {
                var open = menu.classList.toggle("is-open");
                button.setAttribute("aria-expanded", open ? "true" : "false");
            });
        });
    }

    function setupHeroSlider() {
        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var next = slider.querySelector("[data-hero-next]");
            var prev = slider.querySelector("[data-hero-prev]");
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === active);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(active + 1);
                }, 6500);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            if (next) {
                next.addEventListener("click", function () {
                    show(active + 1);
                    restart();
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(active - 1);
                    restart();
                });
            }

            show(0);
            restart();
        });
    }

    function setupFilters() {
        document.querySelectorAll(".filter-scope").forEach(function (scope) {
            var panel = scope.querySelector(".filter-panel");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".searchable-card"));
            var empty = scope.querySelector(".filter-empty");
            if (!panel || !cards.length) {
                return;
            }

            function filterCards() {
                var keyword = (panel.querySelector('[data-filter="keyword"]') || {}).value || "";
                var year = (panel.querySelector('[data-filter="year"]') || {}).value || "";
                var region = (panel.querySelector('[data-filter="region"]') || {}).value || "";
                var type = (panel.querySelector('[data-filter="type"]') || {}).value || "";
                var category = (panel.querySelector('[data-filter="category"]') || {}).value || "";
                var lowered = keyword.trim().toLowerCase();
                var visible = 0;

                cards.forEach(function (card) {
                    var search = (card.getAttribute("data-search") || "").toLowerCase();
                    var match = true;
                    if (lowered && search.indexOf(lowered) === -1) {
                        match = false;
                    }
                    if (year && (card.getAttribute("data-year") || "") !== year) {
                        match = false;
                    }
                    if (region && (card.getAttribute("data-region") || "").indexOf(region) === -1) {
                        match = false;
                    }
                    if (type && (card.getAttribute("data-type") || "").indexOf(type) === -1) {
                        match = false;
                    }
                    if (category && (card.getAttribute("data-category") || "") !== category) {
                        match = false;
                    }
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            panel.addEventListener("input", filterCards);
            panel.addEventListener("change", filterCards);
            filterCards();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNavigation();
        setupHeroSlider();
        setupFilters();
    });
})();
