/*!
 * Cuberto Parallaxy
 *
 * @version 2.0.5
 * @date 04.07.2018
 * @author Artem Dordzhiev (Draft)
 * @licence Copyright (c) 2018, Cuberto. All rights reserved.
 */

import $ from 'jquery';

export default class Parallaxy {
    constructor(options) {
        const defaults = {
            "multiply": 0.1,
            "dir": "up",
            "speed": 0.01
        };

        this.options = $.extend(defaults, options);
        this.stopped = false;
        this.items = [];

        this.update();
    }

    update() {
        this.stop();
        this.items = $("[data-parallaxy]");
        this.itemsOptions = {};

        if (!this.items.length) {
            return false;
        }

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const options = $(item).data('parallaxy');
            this.itemsOptions[i] = $.extend({}, this.options, options);
            this.itemsOptions[i].delta = 0;
        }

        this.start();
    }

    animate() {
        const pageOffset = window.pageYOffset;

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const itemOptions = this.itemsOptions[i];

            const scrollTop = pageOffset - $(item).offset().top;
            const currentDelta = itemOptions.delta;
            let newDelta = (0 - (scrollTop * itemOptions.multiply));

            if (itemOptions.dir === "down") {
                newDelta = (1 + (scrollTop * itemOptions.multiply));
            }

            const tweenDelta = (currentDelta - ((currentDelta - newDelta) * itemOptions.speed));
            this.itemsOptions[i].delta = tweenDelta;

            item.style.transform = "translate3d(0px," + tweenDelta + "px, 0px)";
            item.style.webkitTransform = "translate3d(0px," + tweenDelta + "px, 0px)";
        }

        if (!this.stopped) {
            window.requestAnimationFrame(this.animate.bind(this));
        }
    }

    start() {
        this.stopped = false;
        this.animate();
    }

    stop() {
        this.stopped = true;
    }

    destroy() {
        this.stop();
        this.items = [];
        this.itemsOptions = [];
    }
}
