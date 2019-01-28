/*!
 * Gulp SMPL Layout Builder
 *
 * @version 5.0.2
 * @author Artem Dordzhiev (Draft)
 * @type Module gulp
 * @license The MIT License (MIT)
 */

/* Get plugins */
const gulp = require('gulp');
const browserSync = require('browser-sync');
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json'));
const $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del', 'merge-stream']
});
const chalk = require('chalk');
const webpack = require('webpack-stream');

/* Environment */
global.isDev = process.env.NODE_ENV !== "production";

/* Helpers */
function errorHandler(task, title) {
    return function (err) {
        console.log(task ? chalk.red('[' + task + (title ? ' -> ' + title : '') + ']') : "", err.toString());
        this.emit('end');
    };
}

function getConfig() {
    return JSON.parse(fs.readFileSync('./config.json'));
}

/* Build task */
gulp.task('default', ['build']);
gulp.task('build', (done) => {
    global.isDev = false;
    $.sequence('clean:dist', 'icons', ['pug', 'sass', 'js'], 'copy:static', done);
});
gulp.task('serve', $.sequence('clean', 'icons', ['pug', 'sass', 'js'], 'browsersync', 'watch'));

/* Sass task */
gulp.task('sass', () => {
    const config = getConfig();
    const dist = global.isDev ? './tmp/assets/css/' : './dist/assets/css/';

    return gulp.src('./src/scss/main.scss')
        .pipe($.if(global.isDev || config.prodmaps, $.sourcemaps.init())).on('error', errorHandler('sass', 'sourcemaps:init'))
        .pipe($.sass({includePaths: "node_modules"})).on('error', errorHandler('sass', 'compile'))
        .pipe($.autoprefixer()).on('error', errorHandler('sass', 'autoprefixer'))
        .pipe($.if(config.rtl, $.rtlcss())).on('error', errorHandler('sass', 'rtl'))
        .pipe($.if(!global.isDev, $.cleanCss())).on('error', errorHandler('sass', 'cleanCSS'))
        .pipe($.if(global.isDev || config.prodmaps, $.sourcemaps.write('.'))).on('error', errorHandler('sass', 'sourcemaps:write'))
        .pipe(gulp.dest(dist))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

/* Pug task */
gulp.task('pug', () => {
    const config = getConfig();
    const locale = config.locale ? JSON.parse(fs.readFileSync('./src/locales/' + config.locale + '.json')) : null;
    const pugOptions = {
        basedir: "./src/pug/",
        pretty: true,
        locals: {
            "DEV": global.isDev,
            "PACKAGE": pkg,
            "__": locale
        }
    };
    const dist = global.isDev ? './tmp/' : './dist/';

    return gulp.src(['./src/pug/**/*.pug'])
        .pipe($.filter((file) => {
            return !/\/_/.test(file.path) && !/^_/.test(file.relative);
        }))
        .pipe($.pug(pugOptions)).on('error', errorHandler('pug', 'compile'))
        .pipe(gulp.dest(dist)).on('end', () => {
            browserSync.reload();
        });
});

/* JS task */
gulp.task('js', (done) => {
    const webpackMode = fs.existsSync('./webpack.config.js');
    $.sequence(webpackMode ? 'js:webpack' : 'js:copy', done);
});

gulp.task('js:copy', () => {
    const dist = global.isDev ? './tmp/assets/js' : './dist/assets/js';

    return gulp.src(['./src/js/**/*'])
        .pipe($.if(!global.isDev, $.uglify())).on('error', errorHandler('js', 'uglify'))
        .pipe(gulp.dest(dist));
});

gulp.task('js:webpack', () => {
    const dist = global.isDev ? './tmp/assets/js' : './dist/assets/js';

    return gulp.src(['./src/js/**/*'])
        .pipe(webpack(require('./webpack.config.js'))).on('error', errorHandler('js', 'webpack'))
        .pipe(gulp.dest(dist));
});

/* Icon tasks */
gulp.task('icons', ['icons:svgsprites', 'icons:sprites']);

gulp.task('icons:svgsprites', () => {
    if (fs.existsSync('./src/icons/')) {
        const dist = global.isDev ? './tmp/' : './dist/';
        const svgSpriteOptions = {
            mode: {
                symbol: {
                    dest: "assets/img/sprites/",
                    sprite: "svgsprites.svg",
                    render: {
                        scss: {
                            dest: '../../../../src/scss/generated/svgsprites.scss',
                            template: "./src/scss/templates/svgsprites.scss"
                        }
                    }
                }
            }
        };

        return gulp.src('./src/icons/*.svg')
            .pipe($.svgSprite(svgSpriteOptions))
            .pipe(gulp.dest(dist));
    }
});

gulp.task('icons:sprites', () => {
    if (fs.existsSync('./src/sprites/')) {
        const dist = global.isDev ? './tmp/assets/img/sprites/' : './dist/assets/img/sprites/';
        const spriteData = gulp.src('./src/sprites/**/*.png').pipe($.spritesmith({
            imgPath: '../img/sprites/sprites.png',
            imgName: 'sprites.png',
            retinaImgPath: '../img/sprites/sprites@2x.png',
            retinaImgName: 'sprites@2x.png',
            retinaSrcFilter: ['./src/sprites/**/**@2x.png'],
            cssName: 'sprites.scss',
            cssTemplate: "./src/scss/templates/sprites.scss",
            padding: 1
        }));

        const imgStream = spriteData.img
            .pipe(gulp.dest(dist));

        const cssStream = spriteData.css
            .pipe(gulp.dest('./src/scss/generated'));

        return $.mergeStream(imgStream, cssStream);
    }
});

/* Browsersync Server */
gulp.task('browsersync', () => {
    browserSync.init({
        server: ["./tmp", "./src/static"],
        notify: false,
        port: 64999,
        ui: false,
        online: true,
        tunnel: "aaxcubertodev",
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        }
    });
});

/* Watcher */
gulp.task('watch', () => {
    global.isWatching = true;

    $.watch("./src/scss/**/*.scss", () => {
        gulp.start('sass');
    });
    $.watch("./src/pug/**/*.pug", () => {
        gulp.start('pug');
    });
    $.watch("./src/locales/**/*.json", () => {
        gulp.start('pug');
    });
    $.watch("./src/js/**/*.js", () => {
        gulp.start('js');
    });
    $.watch("./config.json", () => {
        gulp.start('pug');
        gulp.start('js');
    });
});

/* FS tasks */
gulp.task('clean', () => {
    return $.del(['./dist/**/*', './tmp/**/*']);
});

gulp.task('clean:dist', () => {
    return $.del(['./dist/**/*']);
});

gulp.task('copy:static', () => {
    return gulp.src(['./src/static/**/*'])
        .pipe(gulp.dest('./dist/'));
});
