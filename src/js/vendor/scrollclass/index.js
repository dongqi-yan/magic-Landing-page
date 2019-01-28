/*!
 * Cuberto Scroll Spy
 *
 * @version 2.1.0
 * @date 04.07.2018
 * @author Artem Dordzhiev (Draft)
 * @licence Copyright (c) 2018, Cuberto. All rights reserved.
 */

import $ from 'jquery';

export default class scrollClass {

    constructor(options) {
        this.options = $.extend({
            container: window,
            offset: "auto",
            checkVisibility: true,
            checkIndex: false,
            forceOverride: false
        }, options);

        if (this.options.handler) {
            this.container = $(this.options.container);
            this.options.selector = this.options.selector || "[data-" + this.options.handler + "]";
            this.update();
            this.registerScroll();
        }
    }

    update() {
        this.items = $(this.options.selector);
        this.target = $(this.options.target);
        this.offset = this.options.offset === "auto" ? this.target.position().top + (this.target.outerHeight(true) / 2) : this.options.offset;

        if(this.classes) {
            this.target.removeClass(this.classes.join(" "));
        }

        this.positions = [];
        this.classes = [];

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items.eq(i);

            if (this.options.checkVisibility && !item.is(':visible')) {
                continue;
            }

            const y = item.offset().top;
            const name = item.data(this.options.handler);

            this.classes.push(name);
            this.positions.push({
                y: y,
                c: name
            });
        }

        this.check();
    }

    check() {
        const scrollTop = this.container.scrollTop() + this.offset;
        let newClass = null;

        for (let i = 0; i < this.positions.length; i++) {
            if (scrollTop >= this.positions[i].y) {
                newClass = this.positions[i].c;
            } else {
                break;
            }
        }

        if (!this.target.hasClass(newClass) && !this.options.forceOverride) {
            this.target.removeClass(this.classes.join(" ")).addClass(newClass);
        }
    }

    registerScroll() {
        $(this.container).on('scroll', () => {
            this.check();
        }).resize(() => {
            this.update();
        });
    }
}
