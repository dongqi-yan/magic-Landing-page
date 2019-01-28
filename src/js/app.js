import $ from 'jquery';
import page from './page';
import homeController from 'controllers/home';

const app = {
    req: {
        url: window.location.href
    },
    controllers: {
        homeController
    }
};

app.init = function () {

    // Init page
    this.page = page;
    this.page.init(app);
    this.page.refresh(app);

    // Loader promises
    let loadResolver = $.Deferred();
    app.window.on('load', function () {
        loadResolver.resolve();
    });
    this.loaders = [loadResolver.promise()];

    // Init controller
    let ctrl = this.view.data('controller');
    if (ctrl && app.controllers[ctrl]) {
        var controller = app.controllers[ctrl];
        let initResolver = $.Deferred();
        controller.init(app, initResolver);
        this.loaders.push(initResolver.promise());
    }

    // Loader wait
    $.when.apply($, this.loaders).done(function () {

        // Enter animation
        if (ctrl && controller && controller.enter) {
            const enterResolver = $.Deferred();
            controller.enter(app, enterResolver);
            enterResolver.done(() => page.complete(app));
        } else {
            page.complete(app);
        }
    });

    // Prevent scroll restoration
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }
};

app.updateTitle = function (title) {
    if (title) document.title = title;
};

app.updateContent = function (obj) {
    this.view.replaceWith(obj);
    this.view = obj;
};

app.reqPage = function (params) {
    const options = params || this.req;
    const req = $.ajax({
        url: options.url,
        data: options.query
    });

    page.away(app);

    req.done(function (data) {
        app.req.html = $(data);

        let ctrl = app.req.html.filter('#view-main').data('controller');
        let loaders = [];

        setTimeout(() => {

            // Update data & refresh page
            page.update(app);
            page.refresh(app);

            // Callback
            if (typeof(options.onDone) === "function") {
                options.onDone.call(app);
            }

            // Init controller
            if (ctrl && app.controllers[ctrl]) {
                var controller = app.controllers[ctrl];
                let initResolver = $.Deferred();
                controller.init(app, initResolver);
                loaders.push(initResolver.promise());
            }

            // Enter animation
            if (options.triggerEnter && ctrl && controller && controller.enter) {
                const enterResolver = $.Deferred();
                controller.enter(app, enterResolver);
                enterResolver.done(() => page.complete(app));
            } else {
                page.complete(app);
            }
        }, 700);
    });

    req.fail(function (jqXHR, textStatus) {
        alert(textStatus);
        app.goTo('/', {triggerLeave: false});
    });

    return req;
};

app.goTo = function (url, params = {}) {
    const prevCtrl = app.view.data('controller');
    const defaults = {
        replace: false,
        query: {},
        triggerLeave: true,
        triggerEnter: true,
        prevCtrl: prevCtrl,
        onDone: null
    };

    if (typeof(url) === "string") {
        params.url = url;
    } else {
        params = url;
    }

    let options = $.extend(defaults, params);
    app.req = options;

    // Trigger Leave
    if (options.triggerLeave && prevCtrl) {
        const leaveResovler = $.Deferred();

        if (app.controllers[prevCtrl] && app.controllers[prevCtrl].leave) {
            app.controllers[prevCtrl].leave(app, leaveResovler);
        }

        leaveResovler.done(() => {
            app.reqPage();
        });
    }

    if (options.replace) {
        window.history.replaceState({}, '', options.url);
    } else {
        window.history.pushState({}, '', options.url);
    }

    // Make request
    if (!options.triggerLeave) {
        app.reqPage();
    }
};

app.handleNavigation = function () {
    const checkDomain = function (url) {
        if (url.indexOf('//') === 0) {
            url = window.location.protocol + url;
        }
        return url.toLowerCase().replace(/([a-z])?:\/\//, '$1').split('/')[0];
    };

    const isExternal = function (url) {
        return ((url.indexOf(':') > -1 || url.indexOf('//') > -1) && checkDomain(window.location.href) !== checkDomain(url));
    };

    this.body.on("click", "a", function (e) {
        const self = $(this);
        const href = self.attr('href');

        if (href && typeof (href) === "string" && !isExternal(href)) {
            e.preventDefault();
            app.goTo(href);
        }
    });
};

app.handleHistory = function () {
    window.addEventListener('popstate', function () {
        app.goTo(window.location.pathname);
    });
};

app.init();
app.handleHistory();
app.handleNavigation();
