import $ from 'jquery';
import TweenMax from "gsap/TweenMaxBase";
import TimelineMax from "gsap/TimelineMax";
import {Power0, Power1, Power2, Expo, Elastic, Linear} from "gsap/EasePack";
import CSSPlugin from "gsap/CSSPlugin";
//import BezierPlugin from "gsap/BezierPlugin";
//import DrawSVGPlugin from "vendor/gsap/plugins/DrawSVGPlugin";
//import SplitText from "vendor/gsap/utils/SplitText";
import ScrollMagic from 'vendor/scrollmagic/ScrollMagic';
import 'vendor/scrollmagic/animation.gsap';
//import 'scrollmagic/scrollmagic/minified/plugins/debug.addIndicators.min';

const gsapPlugins = [CSSPlugin];

const screen = function (key) {
    const sizes = {
        "xs": 375,
        "sm": 768,
        "md": 1024,
        "lg": 1200,
        "ml": 1400,
        "xl": 1600,
        "ul": 1900
    };

    const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const size = sizes[key] ? sizes[key] : 0;

    return size <= w;
};

const lang = function (key) {
    return document.documentElement.lang === key;
};

const transitions = {
    home: {
        enter(tween) {
            const tl = new TimelineMax({paused: true});
            const hero = tween.find('.ax-hero').not('.-fixed');
            const header = hero.find('.ax-hero-header h1 > *').not('br');
            const more = hero.find('.ax-hero-more');
            const heroFixed = tween.find('.ax-hero.-fixed');
            const bgImg = hero.find('.ax-hero-bg-img');
            const bgRefRows = hero.find('.ax-hero-bg-ref-row');
            const bgRefHr = hero.find('.ax-hero-bg-ref-hr');

            tl.staggerFromTo(header, 3, {
                y: 80,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                force3D: true,
                ease: Expo.easeOut
            }, 0.15, 0);

            tl.fromTo(more, 3, {
                y: 80,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                force3D: true,
                ease: Expo.easeOut,
                clearProps: "y, opacity"
            }, 0.4);

            tl.staggerFromTo(bgRefRows, 2, {
                opacity: 0
            }, {
                opacity: 1
            }, 0.1, 0.7);

            if (screen('sm')) {
                tl.from(bgImg, 2.5, {
                    opacity: 0,
                    z: 20,
                    y: 300,
                    force3D: true,
                    ease: Expo.easeOut
                }, 0.4);

                tl.from(bgRefHr, 2.5, {
                    scaleX: 0,
                    opacity: 0,
                    force3D: true,
                    ease: Expo.easeOut
                }, 0.9);
            }

            tl.delay(0.8);

            return tl;
        },
        magic(tween, options = {mobile: false, controller: {}}) {
            const controller = new ScrollMagic.Controller(options.controller);

            if (!options.mobile) {
                tween.find('.ax-hero').each(function () {
                    const scene = new ScrollMagic.Scene({triggerHook: 0, duration: "120%", triggerElement: this});
                    const tl = transitions.hero.roll(tween);

                    scene.setTween(tl).addTo(controller);
                });

                tween.find('.ax-brief').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 0.3, triggerElement: this});
                    const tl = transitions.brief.show(container);

                    scene.on('enter', () => {
                        tl.timeScale(1).play();
                    });

                    scene.on('leave', () => {
                        tl.timeScale(2).reverse(0);
                    });

                    scene.addTo(controller);
                });

                tween.find('.ax-spec').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 0.4, triggerElement: this});
                    const tl = transitions.spec.show(container);

                    scene.on('enter', () => {
                        tl.timeScale(1).play();
                    });

                    scene.on('leave', () => {
                        tl.timeScale(2).reverse(0);
                    });

                    scene.addTo(controller);
                });

                tween.find('.ax-spec-grid.-bottom').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 0.8, triggerElement: this});
                    const tl = transitions.spec.showBottom(container);
                    const nums = tween.find('.ax-spec-feature-num');
                    const count = transitions.spec.count;
                    let countInt;

                    count(nums.eq(0), "0999999");
                    count(nums.eq(1), "00000");
                    count(nums.eq(2), "00000");

                    scene.on('enter', () => {
                        tl.timeScale(1).play();
                        clearInterval(countInt);
                        countInt = setTimeout(() => {
                            count(nums.eq(0), "2000000");
                            setTimeout(() => count(nums.eq(1), "00001"), 100);
                            setTimeout(() => count(nums.eq(2), "99999"), 200);
                        }, 600);
                    });

                    scene.on('leave', () => {
                        clearInterval(countInt);
                        count(nums.eq(0), "0999999");
                        count(nums.eq(1), "00000");
                        count(nums.eq(2), "00000");
                        tl.timeScale(2).reverse(0);
                    });

                    scene.addTo(controller);
                });

                tween.find('.ax-preview').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 1, duration: "135%", triggerElement: this});
                    const tl = transitions.preview.laptop.roll(container);

                    scene.setTween(tl).addTo(controller);
                });

                tween.find('.ax-feature').each(function () {
                    const container = $(this)
                    const list = container.find('.ax-feature-list').addClass('-selectable');
                    const header = container.find('.ax-feature-header');
                    const items = list.find('.ax-feature-list-item');

                    const scene = new ScrollMagic.Scene({
                        triggerHook: 0, duration: function () {
                            return list.outerHeight() - header.height();
                        }, triggerElement: this
                    });

                    scene.setPin(header[0]);
                    const spacer = header.parent();
                    spacer.width(header.width());

                    scene.on('enter', (e) => {
                        header.css({pointerEvents: "none"}).appendTo($("body"));
                    });

                    scene.on('leave', (e) => {
                        header.css({pointerEvents: "auto"}).prependTo(spacer);
                    });

                    scene.on('progress', (e) => {
                        const index = Math.round(e.progress * items.length) - 1;
                        items.removeClass('-active');
                        if (index > -1) {
                            items.eq(index).addClass('-active');
                        }
                    });

                    scene.addTo(controller);
                });


                tween.find('.ax-footnote-wrap').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 0.7, triggerElement: this});
                    const tl = transitions.footnote.show(container);

                    scene.on('enter', () => {
                        tl.timeScale(1).play();
                    });

                    scene.on('leave', () => {
                        tl.timeScale(2).reverse(0);
                    });

                    scene.addTo(controller);
                });

                tween.find('.ax-team-wrap').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 1, triggerElement: this});
                    const tl = transitions.team.show(container);
                    const owls = container.find('.owl-carousel');

                    scene.on('enter', () => {
                        tl.delay(0.3).play();
                    });

                    scene.on('leave', () => {
                        tl.pause(0);
                        owls.trigger('to.owl.carousel', [0]);
                    });

                    scene.addTo(controller);
                });

                tween.find('.ax-outro').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 0.4, triggerElement: this});
                    const tl = transitions.outro.show(container);

                    scene.on('enter', () => {
                        tl.timeScale(1).play();
                    });

                    scene.on('leave', () => {
                        tl.timeScale(2).reverse(0);
                    });

                    scene.addTo(controller);
                });

                tween.find('.ax-starring-social').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 0.7, triggerElement: this});
                    const tl = transitions.starring.social.show(container);

                    scene.on('enter', () => {
                        tl.timeScale(1).play();
                    });

                    scene.on('leave', () => {
                        tl.timeScale(2).reverse(0);
                    });

                    scene.addTo(controller);
                });

                tween.find('.ax-starring-access-grid').each(function () {
                    const container = $(this);
                    const scene = new ScrollMagic.Scene({triggerHook: 0.7, triggerElement: this});
                    const tl = transitions.starring.access.show(container);

                    scene.on('enter', () => {
                        tl.timeScale(1).play();
                    });

                    scene.on('leave', () => {
                        tl.timeScale(2).reverse(0);
                    });

                    scene.addTo(controller);
                });
            }

            tween.find('.ax-showcase').each(function () {
                const container = $(this);
                const itemsContainer = container.find('.ax-showcase-carousel-items');
                const itemsView = itemsContainer.find('.ax-showcase-carousel-items-view');
                const items = itemsContainer.find('.ax-showcase-carousel-item');
                const cur = container.find('.ax-showcase-carousel-num-cur');
                const progress = container.find('.ax-showcase-carousel-progress-track');
                const roll = container.find('.ax-showcase-carousel-roll');
                const tl = transitions.showcase.roll(container);

                const scene = new ScrollMagic.Scene({
                    triggerHook: 0, duration: "150%", triggerElement: tween.find('.ax-showcase-cutout')[0]
                });
                const sceneDisplay = new ScrollMagic.Scene({
                    triggerHook: 1, duration: "400%", triggerElement: tween.find('.ax-showcase-cutout')[0]
                });
                let lastIndex = 0;

                sceneDisplay.on('enter', () => {
                    container.show();
                });

                sceneDisplay.on('leave', () => {
                    container.hide();
                });

                sceneDisplay.on('end', (e) => {
                    if (e.progress === 1) {
                        container.hide();
                    } else {
                        container.show();
                    }
                });

                sceneDisplay.setTween(tl);

                scene.on('progress', (e) => {
                    const index = Math.round(e.progress * 2) + 1;

                    if (index !== lastIndex) {
                        cur.html("0" + index);
                        TweenMax.set(itemsView, {
                            x: -((index - 1) * 100) + "%"
                        });
                        progress.removeClass(function (index, className) {
                            return (className.match(/(^|\s)-active-\S+/g) || []).join(' ');
                        }).addClass('-active-' + index);
                        lastIndex = index;
                    }
                });

                scene.addTo(controller);
                sceneDisplay.addTo(controller);
            });

            return controller;
        }
    },
    hero: {
        roll(tween) {
            const tl = new TimelineMax();
            const body = tween.find('.ax-hero-body');
            const bg = tween.find('.ax-hero-bg');

            tl.fromTo(body, 0.2, {
                opacity: 1
            }, {
                opacity: 0,
                ease: Linear.easeNone
            }, 0);

            tl.fromTo(bg, 0.5, {
                y: "0%",
            }, {
                y: "30%",
                force3D: true,
                ease: Linear.easeNone
            }, 0);

            tl.fromTo(bg, 0.15, {
                opacity: 1
            }, {
                opacity: 0,
                ease: Linear.easeNone
            }, 0.30);

            return tl;
        }
    },
    brief: {
        show(tween) {
            const tl = new TimelineMax({paused: true});
            const header = tween.find('.ax-header > h2 > *').not('br');
            const text = tween.find('.ax-brief-text p');

            tl.staggerFromTo(header, 1, {
                y: 100,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                force3D: true,
                ease: Power2.easeOut
            }, 0.1, 0);

            tl.staggerFromTo(text, 1, {
                y: 150,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                force3D: true,
                ease: Power2.easeOut
            }, 0.05, 0.1);

            return tl;
        }
    },
    preview: {
        laptop: {
            roll(tween) {
                const tl = new TimelineMax();
                const laptop = tween.find('.ax-preview-img');
                const parts = tween.find('.ax-preview-img-parts img');

                tl.from(laptop, 0.5, {
                    opacity: 0
                }, 0);

                tl.from(parts[0], 0.2, {
                    y: "-27%",
                    x: "-10%",
                    opacity: 0,
                    force3D: true
                }, 0.2);

                tl.from(parts[1], 0.2, {
                    x: "-25%",
                    y: "-3%",
                    opacity: 0,
                    force3D: true
                }, 0.2);

                tl.from(parts[2], 0.2, {
                    x: "15%",
                    y: "-25%",
                    opacity: 0,
                    force3D: true
                }, 0.2);

                tl.from(parts[3], 0.2, {
                    x: "-20%",
                    y: "10%",
                    opacity: 0,
                    force3D: true
                }, 0.2);

                tl.from(parts[4], 0.2, {
                    x: "18%",
                    y: "-12%",
                    opacity: 0,
                    force3D: true
                }, 0.2);

                return tl;
            }
        }
    },
    spec: {
        show(tween) {
            const tl = new TimelineMax({paused: true});

            const header = tween.find('.ax-header > h2 > *').not('br');
            const phone = tween.find('.ax-spec-phone-img.-lg');
            const gridTop = tween.find('.ax-spec-grid.-top');
            const captions = gridTop.find('.ax-spec-feature-caption');
            const headers = gridTop.find('.ax-spec-feature-header h3 > *').not('br');
            const lines = gridTop.find('.ax-spec-feature-line');
            const pisces = [captions, headers];

            tl.fromTo(phone, 2, {
                scale: 0.95,
                rotationX: 40,
                opacity: 0,
            }, {
                scale: 1,
                rotationX: 0,
                opacity: 1,
                force3D: true
            }, 0);

            tl.staggerFromTo(header, 1, {
                y: 100,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                force3D: true,
                ease: Power2.easeOut
            }, 0.1, 0);

            tl.staggerFromTo(pisces, 1.5, {
                y: 100,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                ease: Expo.easeOut,
                force3D: true
            }, 0.1, 0.4);

            tl.fromTo(lines, 1, {
                scaleY: 0
            }, {
                scaleY: 1,
                ease: Expo.easeOut,
                force3D: true
            }, 0.5);

            return tl;
        },
        showBottom(tween) {
            const tl = new TimelineMax({paused: true});
            const lines = tween.find('.ax-spec-feature-line');
            const captions = tween.find('.ax-spec-feature-caption');
            const nums = tween.find('.ax-spec-feature-num');
            const vals = tween.find('.ax-spec-feature-val');
            const pisces = [captions, nums, vals];

            tl.fromTo(lines, 1, {
                scaleY: 0
            }, {
                scaleY: 1,
                ease: Expo.easeOut
            }, 0);

            tl.staggerFromTo(pisces, 1.5, {
                y: 100,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                ease: Expo.easeOut
            }, 0.1, 0.4);

            return tl;
        },
        count: (block, num) => {
            const nums = num.toString().split("");
            const digits = block.find('.ax-spec-feature-num-digit');

            for (var i = 0; i < nums.length; i++) {
                TweenMax.set(digits[i], {y: (nums[i] * -10) + "%"});
            }
        }
    },
    showcase: {
        roll(tween) {
            const tl = new TimelineMax();
            const roll = tween.find('.ax-showcase-carousel-roll');

            tl.fromTo(roll, 0.1, {
                x: "90%",
                y: "20%"
            }, {
                x: "-30%",
                y: "-70%",
                force3D: true,
                ease: Linear.easeNone
            });

            return tl;
        }
    },
    footnote: {
        show(tween) {
            const tl = new TimelineMax({paused: true});
            const header = tween.find('.ax-footnote-header h2 > *').not('br');
            const text = tween.find('.ax-footnote-text img, .ax-footnote-text p');
            const title = tween.find('.ax-footnote-title h3 > *').not('br');
            const caption = tween.find('.ax-footnote-caption');
            const namePhoto = tween.find('.ax-footnote-name-photo');
            const nameTitle = tween.find('.ax-footnote-name-title');
            const nameText = tween.find('.ax-footnote-name-text');
            const nameMore = tween.find('.ax-footnote-name-more');
            const pisces = header.add(text).add(title).add(caption).add(namePhoto).add(nameTitle).add(nameText).add(nameMore);

            tl.staggerFromTo(pisces, 0.8, {
                y: 100,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                ease: Power2.easeOut,
                clearProps: "y,opacity"
            }, 0.05, 0);

            return tl;
        }
    },
    team: {
        show(tween) {
            const tl = new TimelineMax({paused: true});

            const nav = tween.find('.ax-team-carousel-nav');
            const rows = tween.find('.ax-team-carousel-row');
            const itemsTop = rows.eq(0).find('.ax-team-carousel-item').not('.-cap').not('.-clone');
            const itemsBottom = rows.eq(1).find('.ax-team-carousel-item').not('.-cap');
            const info = tween.find('.ax-team-carousel-info');

            const collection = nav.add(itemsTop).add(itemsBottom);
            const infoIntersect = collection[itemsTop.length + 3];
            collection[itemsTop.length + 3] = [info, infoIntersect];

            tl.staggerFrom(collection, 0.6, {
                y: 100,
                opacity: 0,
                clearProps: "y,opacity",
                force3D: true,
                ease: Power2.easeOut
            }, 0.05, 0);

            return tl;
        }
    },
    outro: {
        show(tween) {
            const tl = new TimelineMax({paused: true});

            const text = tween.find('.ax-outro-quot-text p');
            const pisces = tween.find('.ax-outro-quot-photo, .ax-outro-quot-name');

            tl.staggerFromTo(text, 0.8, {
                y: 100,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                force3D: true,
                ease: Power2.easeOut
            }, 0.05, 0);

            tl.staggerFromTo(pisces, 0.8, {
                opacity: 0
            }, {
                opacity: 1
            }, 0.15, 0.5);

            return tl;
        }
    },
    starring: {
        social: {
            show(tween) {
                const tl = new TimelineMax({paused: true});
                const pisces = tween.find('.ax-starring-social-header, .ax-starring-social-item');

                tl.staggerFromTo(pisces, 0.8, {
                    y: 100,
                    opacity: 0
                }, {
                    y: 0,
                    opacity: 1,
                    ease: Power2.easeOut,
                    clearProps: "y,opacity"
                }, 0.05, 0);

                return tl;
            }
        },
        access: {
            show(tween) {
                const tl = new TimelineMax({paused: true});
                const phone = tween.find('.ax-starring-access-img');

                tl.staggerFromTo(phone, 0.8, {
                    y: 300,
                }, {
                    y: 0,
                    force3D: true,
                    ease: Power2.easeOut,
                    clearProps: "y"
                }, 0.2, 0);

                return tl;
            }
        }
    }
};

export default transitions;
