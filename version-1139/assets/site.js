(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = $('.nav-toggle');
        var nav = $('.main-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = $('.hero-carousel');
        if (!hero) {
            return;
        }
        var slides = $$('.hero-slide', hero);
        var dots = $$('.hero-dot', hero);
        var prev = $('.hero-prev', hero);
        var next = $('.hero-next', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
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

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        var cards = $$('.category-movies .movie-card');
        if (!cards.length) {
            return;
        }
        var input = $('.filter-search');
        var year = $('.filter-year');
        var type = $('.filter-type');
        var empty = $('.empty-state');

        function apply() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category
                ].join(' ').toLowerCase();
                var ok = (!q || haystack.indexOf(q) !== -1) && (!y || card.dataset.year === y) && (!t || card.dataset.type === t);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, year, type].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="movie-cover" href="' + escapeHtml(movie.href) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
            '<span class="movie-badge">' + escapeHtml(movie.category) + '</span>',
            '<span class="play-dot">▶</span>',
            '</a>',
            '<div class="movie-info">',
            '<h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine || '') + '</p>',
            '<div class="movie-meta"><span>★ ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function initSearch() {
        var input = $('#globalSearchInput');
        var results = $('#searchResults');
        var status = $('#searchStatus');
        if (!input || !results || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function run() {
            var q = input.value.trim().toLowerCase();
            if (!q) {
                results.innerHTML = '';
                status.textContent = '输入关键词后可按片名、题材、地区、年份进行检索。';
                return;
            }
            var matched = window.SITE_MOVIES.filter(function (movie) {
                return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase().indexOf(q) !== -1;
            }).slice(0, 96);
            results.innerHTML = matched.map(movieCard).join('');
            status.textContent = matched.length ? '搜索结果' : '没有匹配的影片';
        }

        input.addEventListener('input', run);
        run();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initSearch();
    });
})();
