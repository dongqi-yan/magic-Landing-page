import $ from 'jquery';
import transitions from 'transitions';
import "owl.carousel";

const homeController = {
    init: function (app, resolver) {
        const view = app.view;

        // Team | Carousel
        view.find('.ax-team').each(function () {
            const container = $(this);
            const rows = container.find('.ax-team-carousel-row');
            const navs = container.find('.ax-team-carousel-nav-control-item');
            const navPrev = navs.filter('.-prev');
            const navNext = navs.filter('.-next');
            const owlDefaults = {
                items: 1,
                autoWidth: true,
                dots: false,
                nav: true,
                loop: false,
                margin: 0,
                smartSpeed: 500,
                checkVisible: false,
                responsive: {
                    768: {
                        items: 4
                    }
                }
            };

            const owlPrimary = rows.eq(0).addClass('owl-carousel').owlCarousel(owlDefaults);
            const owlSecondary = rows.eq(1).addClass('owl-carousel').owlCarousel($.extend(false, owlDefaults, {
                smartSpeed: 600
            }));

            const owlPrimaryNext = owlPrimary.find('.owl-next');
            let owlPrimaryTimeout, owlSecondaryTimeout, owlIndex = 0, lastIndex = 0;

            const isAdvancedMode = function () {
                return Math.max(document.documentElement.clientWidth, window.innerWidth || 0) >= 768;
            };

            const goPrev = function () {
                //if (isAdvancedMode()) {
                //    owlPrimary.trigger('to.owl.carousel', Math.floor((owlIndex - 1) / 3.0) * 3);
                //} else {
                if (owlIndex === 2) {
                    owlPrimary.trigger('to.owl.carousel', 0);
                } else {
                    owlPrimary.trigger('prev.owl.carousel');
                }
                //}
            };

            const goNext = function (e) {
                //if (isAdvancedMode()) {
                //    owlPrimary.trigger('to.owl.carousel', Math.ceil((owlIndex + 1) / 3.0) * 3);
                //} else {
                if (owlIndex === 0) {
                    owlPrimary.trigger('to.owl.carousel', 2);
                } else {
                    owlPrimary.trigger('next.owl.carousel');
                }
                //}
            };

            // owlPrimary.on('drag.owl.carousel', function (e) {
            //     lastIndex = e.item.index;
            // });
            //
            // owlPrimary.on('dragged.owl.carousel', function (e) {
            //     if(isAdvancedMode()) {
            //         if (e.item.index > lastIndex) {
            //             owlPrimary.trigger('to.owl.carousel', 3);
            //         } else {
            //             owlPrimary.trigger('to.owl.carousel', 0);
            //         }
            //     }
            // });

            owlPrimary.on('changed.owl.carousel', function (e) {
                if (isAdvancedMode()) {
                    clearInterval(owlPrimaryTimeout);
                    owlPrimaryTimeout = setTimeout(() => {
                        owlSecondary.trigger('to.owl.carousel', [e.item.index]);
                    }, 100);
                }

                navPrev.toggleClass('-disabled', e.item.index < 1);
                navNext.toggleClass('-disabled', owlPrimaryNext.hasClass('disabled'));
                owlIndex = e.item.index;
            });

            // owlSecondary.on('drag.owl.carousel', function (e) {
            //     lastIndex = e.item.index;
            // });
            //
            // owlSecondary.on('dragged.owl.carousel', function (e) {
            //     if(isAdvancedMode()) {
            //         if (e.item.index > lastIndex) {
            //             owlSecondary.trigger('to.owl.carousel', 3);
            //         } else {
            //             owlSecondary.trigger('to.owl.carousel', 0);
            //         }
            //     }
            // });

            owlSecondary.on('changed.owl.carousel', function (e) {
                clearInterval(owlSecondaryTimeout);
                owlSecondaryTimeout = setTimeout(() => {
                    owlPrimary.trigger('to.owl.carousel', [e.item.index]);
                }, 100);
            });

            navPrev.on('click', goPrev);
            navNext.on('click', goNext);
        });

        // Get Early Access anchors | Scroll
        view.find('.ax-hero-more button').on('click', (e) => {
            e.preventDefault();
            app.scrollTo('.ax-starring-access', {duration: 0, targetCenter: true});
        });

        // Modal refer | Demo
        view.find('.ax-starring-access form').on('submit', (e) => {
            e.preventDefault();
            app.modalOpen("#modal-refer");
        });

        app.body.find('.ax-refer').each(function () {
            const container = $(this);
            const action = container.find('.ax-refer-action');
            const actionButtons = action.find('button');
            const form = container.find('.ax-refer-form');
            const messages = container.find('.ax-refer-message');

            actionButtons.on('click', () => {
                action.addClass('-hidden');
                form.find(':input[type=email]').val('');
                form.addClass('-visible');
                messages.removeClass('-visible');
            });

            form.on('submit', (e) => {
                e.preventDefault();
                form.removeClass('-visible');
                messages.filter('.-success').addClass('-visible');
                action.removeClass('-hidden').addClass('-next');
            })
        });

        // Enter animation
        if (!app.mobile) {
            this.tlEnter = transitions.home.enter(view);
        }

        // Magic animation
        setTimeout(() => {
            this.magic = transitions.home.magic(view, {
                mobile: app.mobile,
                controller: {
                    refreshInterval: app.scrollbar ? 0 : null,
                    container: app.scrollbar ? view[0] : null
                }
            });
            if (app.scrollbar) {
                app.scrollbar.addListener(() => this.magic.update());
                app.window.on('resize', () => setTimeout(() => {
                    app.body.find(".owl-carousel").trigger('refresh.owl.carousel');
                    this.magic.refresh();
                }));
                this.magic.scrollPos(() => app.scrollTop());
            }
            setTimeout(() => resolver.resolve(), 300);
        }, 300);
    },
    enter: function (app, resolver) {
        const view = app.view;
        const tl = this.tlEnter;

        if (tl) {
            tl.eventCallback('onComplete', () => resolver.resolve());
            tl.play();
        } else {
            resolver.resolve();
        }
    },
    leave: function (app, resolver) {
        const view = app.view;

        resolver.resolve();
    }
};

export default homeController;
