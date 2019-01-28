import $ from 'jquery';
import svg4everybody from 'svg4everybody';
import browser from 'browser-detect';
import Scrollbar from 'smooth-scrollbar';
import debounce from 'lodash.debounce';

const page = {
    init: function (app) { // On first load

        // Base components
        app.window = $(window);
        app.document = $(document);
        app.html = $("html");
        app.body = $("body");
        app.viewport = $("html,body");
        app.view = $("#view-main");
        app.loader = $(".ax-loader_overlay");
        app.navbar = $(".ax-navbar:first");
        app.scrollnav = $('.ax-nav_scroll');

        // App params
        app.browser = browser();
        app.mobile = app.browser.mobile;
        app.html.removeClass('no-js').addClass(app.mobile ? "mobile" : "desktop").addClass(app.browser.name);

        // svg4everybody | Init
        if (!app.mobile) {
            svg4everybody();
        }

        // Smooth Scrollbar | Init
        //if (!app.mobile) {
        app.scrollbar = Scrollbar.init(app.view.find('main')[0], {damping: app.mobile ? 0.08 : 0.1});
        app.scrollbar.addListener((e) => app.window.trigger('scrolling', e.offset.y, e.offset.x));
        //} else {
        //    app.window.on('scroll', (e) => app.window.trigger('scrolling', window.pageYOffset, window.pageXOffset));
        //}

        app.scrollHeight = () => {
            return (app.scrollbar ? app.scrollbar.limit.y : window.pageYOffset);
        };

        app.scrollTop = () => {
            return (app.scrollbar ? app.scrollbar.scrollTop : window.pageYOffset);
        };

        app.scrollLeft = () => {
            return (app.scrollbar ? app.scrollbar.scrollLeft : window.pageXOffset);
        };

        app.scrollTo = (y, x = 0, options) => {
            let target, targetY, targetX;
            const pars = $.extend(true, {
                offsetY: 0,
                offsetX: 0,
                duration: 500,
                callback: null,
                targetCenter: false
            }, options ? options : typeof(x) === "object" ? x : {});

            if (typeof (y) !== "number") {
                target = $(y);

                if (!target[0]) {
                    return false;
                }

                targetY = target.offset().top;
                targetX = target.offset().left;
                targetY += app.scrollbar ? app.scrollbar.scrollTop : window.pageYOffset;
                targetX += app.scrollbar ? app.scrollbar.scrollLeft : window.pageXOffset;

                if (pars.targetCenter) {
                    targetX += target.width() / 4;
                    targetY += target.height() / 4;
                }
            } else {
                targetY = y;
                targetX = x;
            }

            if (app.scrollbar) {
                app.scrollbar.scrollTo(targetX + pars.offsetX, targetY + pars.offsetY, pars.duration, pars);
            } else {
                pars.complete = pars.callback;
                app.viewport.animate({scrollTop: targetY + pars.offsetY, scrollLeft: targetX + pars.offsetX}, pars);
            }
        };

        // Navbar | Init
        app.navbar.each(function () {
            let lastPageYOffset;

            app.window.on('scrolling', (e, y, x) => {
                app.navbar.toggleClass('-fixed', y > 10);
                app.navbar.toggleClass('-visible', y > 10 && lastPageYOffset > y);
                lastPageYOffset = y;
            });

            app.navbar.find('.ax-navbar-logo a').on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                app.scrollTo(0);
            });

            app.navbar.find('.ax-navbar-action button').on('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                app.scrollTo('.ax-starring-access', {duration: 0, targetCenter: true});
            })
        });

        // Nav Scroll | Init
        app.scrollnav.each(function () {
            const container = $(this);
            const track = container.find('.ax-nav_scroll-track');
            const items = container.find('.ax-nav_scroll-item');
            const sections = $('[data-section]');
            let sectionsOffset = {}, lockToggle = false, scrollHeight = 0;

            const setActive = (id) => {
                track.removeClass(function (index, className) {
                    return (className.match(/(^|\s)-active-\S+/g) || []).join(' ');
                });
                if (id) {
                    track.addClass('-active-' + id);
                    items.removeClass('-active').eq(id - 1).addClass('-active');
                }
            };

            const calcSections = () => {
                sections.each(function () {
                    const self = $(this);
                    sectionsOffset[self.data('section')] = parseInt(self.offset().top + app.scrollTop());
                });
                scrollHeight = app.scrollHeight();
            };

            const checkSections = (e, y, x) => {
                if (scrollHeight !== app.scrollHeight()) {
                    calcSections();
                }
                if (!lockToggle) {
                    let lastSection = 0;
                    for (var k in sectionsOffset) {
                        if (y >= sectionsOffset[k]) lastSection = k;
                    }
                    setActive(lastSection);
                }
            };

            items.on('click', function (e) {
                e.preventDefault();
                lockToggle = true;
                const sectionId = $(this).data('nav-section');
                app.scrollTo(sections.filter(`[data-section=${sectionId}]`), 0, {
                    offsetY: sectionId === 4 ? 100 : 0,
                    duration: 700,
                    callback: () => lockToggle = false
                });
                setActive(sectionId);
            });

            calcSections();
            app.window.on('scrolling', debounce(checkSections, 300, {maxWait: 300}));
        });

        // Dropdowns
        app.navbar.find('.ax-dropdown').each(function () {
            const container = $(this);
            const toggle = container.find('.ax-dropdown_select-toggle');
            const toggleText = container.find('.ax-dropdown_select-toggle-text');
            const items = container.find('.ax-dropdown_select-menu-item');

            toggle.on('click', () => {
                container.toggleClass('-open');
            });

            items.on('click', function () {
                const self = $(this);
                container.toggleClass('-open');
                toggleText.text(self.data('short') || self.text());
            });

            container.on('blur', () => {
                container.removeClass('-open');
            });
        });

        // Modals | Init
        app.modalOpen = function (id) {
            const modal = $(id);
            modal.show();
            setTimeout(() => modal.addClass('-visible'), 10);
        };

        app.modalClose = function (id) {
            const modal = $(id);
            modal.removeClass('-visible');
            setTimeout(() => modal.hide(), 800);
        };

        app.body.on('click', '[data-modal-toggle]', function (e) {
            e.preventDefault();
            app.modalOpen($(this).data('modal-toggle'));
        });

        app.body.on('click', '[data-modal-close]', function (e) {
            e.preventDefault();
            app.modalClose($(this).data('modal-close'));
        });
    },
    away: function (app) { // Before ajax

    },
    update: function (app) { // Ajax update
        const html = app.req.html;
        const view = html.filter('#view-main');
        const navbar = html.filter('.ax-navbar');

        // Title | Update
        document.title = html.filter('title').text();

        // View | Update
        app.view.replaceWith(view);
        app.view = view;
        app.viewport.scrollTop(0);

        // Navbar | Update
        app.navbar.replaceWith(navbar);
        app.navbar = navbar;
    },
    refresh: function (app) { // After ajax update

        // Loader | Hide
        setTimeout(() => {
            app.loader.removeClass('-visible');
            setTimeout(() => app.scrollnav.addClass('-visible'), 700);
        }, 1000);
    },
    complete: function (app) { // After all animations

    }
};

export default page;
