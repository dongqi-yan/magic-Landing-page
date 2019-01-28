const webpack = require('webpack');
const config = require('./config.json');

const webpackConfig = {
    entry: "./src/js/app.js",

    output: {
        path: __dirname,
        filename: "bundle.js",
        publicPath: "/assets/js/"
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /(node_modules|bower_components)/,
                options: {
                    compact: true
                }
            },
            {
                test: /\.js$/,
                loader: 'imports-loader?define=>false'
            }
        ]
    },

    resolve: {
        modules: ['./src/js', 'node_modules']
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        })
    ],

    devtool: "eval",
    mode: "development"
};

if (!global.isDev) {
    webpackConfig.devtool = "source-map";
    webpackConfig.mode = "production";
}

module.exports = webpackConfig;
