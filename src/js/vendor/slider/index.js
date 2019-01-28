/*!
 * Cuberto Tricky Slider
 *
 * @version 2.1.0
 * @date 04.07.2018
 * @author Artem Dordzhiev (Draft)
 * @licence Copyright (c) 2018, Cuberto. All rights reserved.
 */

import $ from 'jquery';
import WheelIndicator from 'wheel-indicator';

export default class Slider {

    constructor(options) {
        const defaults = {
            selector: null,
            itemsSelector: null,
            inClass: "-in",
            outClass: "-out",
            nextClass: "-next",
            nextClassPositive: true,
            openClass: "-open",
            initClass: "-init",
            keyboardScrolling: true,
            keyboardKeys: {
                prev: [33, 38],
                next: [32, 34, 40],
                first: [36],
                last: [35]
            },
            keyboardFocus: true,
            touchScrolling: true,
            touchThreshold: 80,
            mousewheelScrolling: true,
            loop: false
        };

        this.options = $.extend(defaults, options);
        this.events = [];

        this.current = null;
        this.prev = null;
        this.next = null;

        this.block = false;
        this.triggered = false;
        this.opened = false;
        this.container = null;
        this.items = null;

        this.init();
        return this;
    }

    init() {
        this.getItems();
        this.setTriggers(true);
        this.container.addClass(this.options.initClass);
        this.trigger('init', {
            items: this.items,
            container: this.container,
            options: this.options
        });
        return this;
    }

    getItems() {
        this.container = $(this.options.selector);
        this.items = this.container.find(this.options.itemsSelector);
        return this.items;
    }

    /* Internal events */
    on(event, callback) {
        if (!$.isArray(this.events[event])) {
            this.off(event);
        }
        this.events[event].push(callback);
        return this;
    };

    off(event) {
        this.events[event] = [];
        return this;
    };

    trigger(event, params) {
        const callbacks = this.events[event] || [];
        const e = params ? params : this.getEventData();
        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i].call(this, e);
        }
        return this;
    };

    getEventData() {
        return {
            prevItem: this.getPrevItem(),
            prevIndex: this.prev,
            currentItem: this.getCurrentItem(),
            currentIndex: this.current,
            nextItem: this.getNextItem(),
            nextIndex: this.next
        };
    };

    /* Control Handlers */
    setTriggers(value) {
        this.triggered = value;
        this.setMousewheel(value ? this.options.mousewheelScrolling : false);
        this.setKeyboard(value ? this.options.keyboardScrolling : false);
        this.setTouch(value ? this.options.touchScrolling : false);
    }

    setMousewheel(value) {
        const self = this;

        if (!this.wheelIndicator) {
            this.wheelIndicator = new WheelIndicator({
                elem: this.container[0],
                callback: function (e) {
                    if (e.direction === "down") {
                        self.goNext();
                    } else {
                        self.goPrev();
                    }
                }
            });
        }

        if (!value) {
            this.wheelIndicator.turnOff();
        }

        return this;
    }

    setKeyboard(value) {
        const self = this;

        this.container.off('keyup');

        if (value) {
            this.container.on('keyup', function (e) {
                e.preventDefault();
                if (e.keyCode) {
                    if ($.inArray(e.keyCode, self.options.keyboardKeys.prev) > -1) {
                        self.goPrev();
                    }
                    if ($.inArray(e.keyCode, self.options.keyboardKeys.next) > -1) {
                        self.goNext();
                    }
                    if ($.inArray(e.keyCode, self.options.keyboardKeys.first) > -1) {
                        self.goFirst();
                    }
                    if ($.inArray(e.keyCode, self.options.keyboardKeys.last) > -1) {
                        self.goLast();
                    }
                }
            }).attr('tabindex', '0');

            if (self.options.keyboardFocus) {
                this.container.focus();
            }
        }

        return this;
    }

    setTouch(value) {
        const self = this;

        this.container.off('touchstart touchmove touchend touchcancel');

        if (value) {
            let lastY;
            let lastX;

            this.container.on('touchstart', function (e) {
                lastY = e.originalEvent.touches ? e.originalEvent.touches[0].clientY : 0;
                lastX = e.originalEvent.touches ? e.originalEvent.touches[0].clientX : 0;
            });

            this.container.on('touchmove', function (e) {
                e.preventDefault();

                let currentY = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].clientY : 0;
                //let currentX = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].clientX : 0;

                if (Math.abs(currentY - lastY) >= self.options.touchThreshold) {

                    if (currentY > lastY) {
                        self.goPrev();
                    } else {
                        self.goNext();
                    }

                }

            });
        }

        return this;
    }

    setBlock(value) {
        this.block = value;
        return this;
    }

    /* Getters Data */
    getPrevItem() {
        return this.prev !== "null" ? this.items.eq(this.prev) : null;
    }

    getCurrentItem() {
        return this.items.eq(this.current);
    };

    getNextItem() {
        return this.next !== "null" ? this.items.eq(this.next) : null;
    };

    /* Slider navigation */
    goTo(index, params) {
        const self = this;

        if (typeof(index) === "string") {
            index = this.items.index(this.items.filter("[data-slide-name='" + index + "']"))
        }

        if (index === self.current || this.block) {
            return false;
        }

        self.prev = typeof (self.current) !== "null" ? self.current : null;
        self.current = index;
        self.next = this.getNextIndex(self.options.nextClassPositive);

        self.items.removeClass(self.options.outClass).removeClass(self.options.inClass).removeClass(self.options.nextClass);

        const e = this.getEventData();

        if (typeof (e.prevIndex) === "number") {
            e.prevItem.addClass(self.options.outClass);
        }

        e.currentItem.addClass(self.options.inClass);

        if (typeof (e.nextIndex) === "number") {
            e.nextItem.addClass(self.options.nextClass);
        }

        this.trigger('slide', $.extend(true, e, params));

        return true;
    };

    /* Index calculation */
    getNextIndex(positive) {
        let index = this.current + 1;

        if (index >= this.items.length) {
            if (this.options.loop === true || this.options.loop === "forward") {
                index = positive ? 1 : 0;
            } else {
                index = false;
            }
        }

        return index;
    };

    getPrevIndex(force) {
        let index = this.current - 1;

        if (index < 0) {
            if (force && (this.options.loop === true || this.options.loop === "backward")) {
                index = this.items.length - 1;
            } else {
                index = false;
            }
        }

        return index;
    };

    /* Fast triggers */
    goNext(positive) {
        const index = this.getNextIndex(positive);

        return index !== false ? this.goTo(index) : false;
    };

    goPrev(force) {
        const index = this.getPrevIndex(force);

        return index !== false ? this.goTo(index) : false;
    };

    goFirst() {
        this.goTo(0);
    };

    goLast() {
        this.goTo(this.items.length - 1);
    };

    /* Opening */
    open() {
        const self = this;

        self.setTriggers(false);
        self.container.addClass(self.options.openClass);
        self.opened = true;

        this.trigger('open');
    };

    close() {
        const self = this;

        self.setTriggers(true);
        self.container.removeClass(self.options.openClass);
        self.opened = false;

        this.trigger('close');
    }
}
