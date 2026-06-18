(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                var active = dotIndex === current;
                dot.classList.toggle("active", active);
                dot.setAttribute("aria-pressed", active ? "true" : "false");
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                play();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                play();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        showSlide(0);
        play();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
        var scope = panel.parentElement || document;
        var textInput = panel.querySelector("[data-filter-text]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var categorySelect = panel.querySelector("[data-filter-category]");
        var emptyState = panel.querySelector("[data-empty-state]");
        var items = Array.prototype.slice.call(scope.querySelectorAll(".searchable-item"));

        function normalized(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalized(textInput && textInput.value);
            var year = normalized(yearSelect && yearSelect.value);
            var region = normalized(regionSelect && regionSelect.value);
            var category = normalized(categorySelect && categorySelect.value);
            var visible = 0;

            items.forEach(function (item) {
                var haystack = normalized([
                    item.dataset.title,
                    item.dataset.region,
                    item.dataset.type,
                    item.dataset.year,
                    item.dataset.genre,
                    item.dataset.tags,
                    item.textContent
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || normalized(item.dataset.year) === year;
                var matchesRegion = !region || normalized(item.dataset.region).indexOf(region) !== -1 || haystack.indexOf(region) !== -1;
                var matchesCategory = !category || haystack.indexOf(category) !== -1;
                var matches = matchesKeyword && matchesYear && matchesRegion && matchesCategory;

                item.hidden = !matches;

                if (matches) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [textInput, yearSelect, regionSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
})();
