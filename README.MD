## Common setup

`yarn install` or `npm install`

## Production

`gulp` or `gulp build` build an optimized version of app to /dist

## Development

`gulp serve` build a deploy version of app and start browsersync server + watchers

## Configuration

Build settings are conveniently exposed in `config.js`.

## File structure

```bash
├── /dist/                      # Production directory (minified, optimized and compiled files)
└── /src/                       # The source code of the application
    ├── /icons/                 # SVG only icons
    ├── /js/                    # Javascript source
    ├── /locales/               # JSON localizations strings
    ├── /pug/                   # Pug templates
        └── /_includes/         # Pug partials that are included / extended
    ├── /scss/                  # SCSS styles
        └── /templates/         # SCSS templates for generator tasks (icons, sprites, etc..)
        └── /generates/         # Generated styles
    ├── /sprites/               # Sprites raster images
    ├── /static/                # Static files (fonts, images, videos, etc..)
├── /tmp/                       # Deploy temporary served files
├── .babelrc                    # Babel config file
├── .editorconfig               # EditorConfig.org file
├── config.json                 # Build config
├── package.json                # Dependencies for NPM/Yarn
├── webpack.config              # Webpack config file
├── yarn.lock                   # Yarn lock file
```

## Other gulp tasks

`gulp pug` compile Pug files

`gulp sass` compile SASS files

`gulp js` proceed all JS files

`gulp js:webpack` build bundle use Webpack + Babel

`gulp js:copy` just copy and compress all JS files

`gulp icons` proceed all icons and sprites

`gulp icons:sprites` compile spritesheet and style based on sprites in /src/sprites

`gulp icons:svgsprite` compile svg spritesheet and style based on images in /src/icons

`gulp copy:static` copy static files from /src to /dist

`gulp browsersync` start a browser sync server

`gulp watch` start watching stream

`gulp clean` remove temporary files

`gulp clean:dist` clean /dist directory