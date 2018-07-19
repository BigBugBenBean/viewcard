const path = require('path');

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const webpackMergeDll = webpackMerge.strategy({ plugins: 'replace' });
const commonConfig = require('./webpack.common.js');

const AssetsPlugin = require('assets-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlElementsPlugin = require('./html-elements-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');

const packagejson = require('../package.json');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;
const HMR = helpers.hasProcessFlag('hot');
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');

const APP_ENTRY = helpers.getAppEntry();

const MSKS = {
    uri: `ws://localhost:8080/peripheral`,
    namespace: 'peripheral'
}

const METADATA = webpackMerge(commonConfig({ env: ENV, entry: APP_ENTRY }).metadata, {
    host: HOST,
    port: PORT,
    ENV: ENV,
    HMR: HMR,
    MSKS: MSKS,

    title: packagejson.description,
    baseUrl: helpers.getBaseUrl(),
    isDevServer: helpers.isWebpackDevServer(),
    apiroot: '/msksapi',
    API_TERMINAL: 'http://localhost:8080'
});

module.exports = function (options) {

    return webpackMerge(commonConfig({ env: ENV, entry: APP_ENTRY }), {

        entry: {
            'polyfills': './src/polyfills.browser.ts',
            'main': AOT ? './src/main.browser.aot.ts' :
                './src/main.browser.ts'
        },
        target: helpers.isWebpackDevServer() ? 'web' : 'electron-renderer',
        output: {
            /**
             * The output directory as absolute path (required).
             *
             * See: http://webpack.github.io/docs/configuration.html#output-path
             */
            path: path.join(helpers.root('dist'), 'webapp'),
            filename: '[name].js'
        },

        module: {
            rules: [
                /**
                 * Css loader support for *.css files (styles directory only)
                 * Loads external css styles into the DOM, supports HMR
                 *
                 */
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                    include: [helpers.root('src', 'styles')]
                },

                /**
                 * Sass loader support for *.scss files (styles directory only)
                 * Loads external sass styles into the DOM, supports HMR
                 *
                 */
                {
                    test: /\.scss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                    include: [helpers.root('src', 'styles')]
                },
            ]
        },

        plugins: [

            new AssetsPlugin({
                path: helpers.root('dist'),
                filename: 'webpack-assets.json',
                prettyPrint: true
            }),

            /**
             * Plugin LoaderOptionsPlugin (experimental)
             *
             * See: https://gist.github.com/sokra/27b24881210b56bbaff7
             */
            new LoaderOptionsPlugin({}),

            new ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery'
            }),
            new CopyWebpackPlugin([{
                from: 'src/assets',
                to: 'assets'
            }]),

            /**
             * Plugin LoaderOptionsPlugin (experimental)
             *
             * See: https://gist.github.com/sokra/27b24881210b56bbaff7
             */
            new LoaderOptionsPlugin({
                debug: true,
                options: {

                }
            }),
            new DllBundlesPlugin({
                bundles: {
                    polyfills: [
                        'core-js',
                        {
                            name: 'zone.js',
                            path: 'zone.js/dist/zone.js'
                        },
                        {
                            name: 'zone.js',
                            path: 'zone.js/dist/long-stack-trace-zone.js'
                        },
                    ],
                    vendor: [
                        '@angular/platform-browser',
                        '@angular/platform-browser-dynamic',
                        '@angular/core',
                        '@angular/common',
                        '@angular/forms',
                        '@angular/http',
                        '@angular/router',
                        '@angularclass/hmr',
                        'rxjs',
                        'hammerjs',
                        'jquery',
                        '@angular/material',
                        'angular2-text-mask',
                        { name: 'primeng', path: 'primeng/primeng' },
                    ]
                },
                dllDir: helpers.root('dll'),
                webpackConfig: webpackMergeDll(commonConfig({ env: ENV, entry: APP_ENTRY }), {
                    devtool: 'cheap-module-source-map',
                    plugins: []
                })
            }),
            /**
             * Plugin: AddAssetHtmlPlugin
             * Description: Adds the given JS or CSS file to the files
             * Webpack knows about, and put it into the list of assets
             * html-webpack-plugin injects into the generated html.
             *
             * See: https://github.com/SimenB/add-asset-html-webpack-plugin
             */
            new AddAssetHtmlPlugin([
                { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('polyfills')}`) },
                { filepath: helpers.root(`dll/${DllBundlesPlugin.resolveFile('vendor')}`) },
            ]),
            /**
             * Plugin: HtmlElementsPlugin
             * Description: Generate html tags based on javascript maps.
             *
             * If a publicPath is set in the webpack output configuration, it will be automatically added to
             * href attributes, you can disable that by adding a "=href": false property.
             * You can also enable it to other attribute by settings "=attName": true.
             *
             * The configuration supplied is map between a location (key) and an element definition object (value)
             * The location (key) is then exported to the template under then htmlElements property in webpack configuration.
             *
             * Example:
             *  Adding this plugin configuration
             *  new HtmlElementsPlugin({
             *    headTags: { ... }
             *  })
             *
             *  Means we can use it in the template like this:
             *  <%= webpackConfig.htmlElements.headTags %>
             *
             * Dependencies: HtmlWebpackPlugin
             */
            new HtmlElementsPlugin({
                headTags: require('./head-config.common')
            }),

            /**
             * Plugin: HtmlWebpackPlugin
             * Description: Simplifies creation of HTML files to serve your webpack bundles.
             * This is especially useful for webpack bundles that include a hash in the filename
             * which changes every compilation.
             *
             * See: https://github.com/ampedandwired/html-webpack-plugin
             */
            new HtmlWebpackPlugin({
                template: 'src/index.ejs',
                filename: 'index.html',
                title: METADATA.title,
                chunksSortMode: 'dependency',
                metadata: METADATA,
                inject: 'head'
            }),

            new DefinePlugin({
                'ENV': JSON.stringify(METADATA.ENV),
                'HMR': METADATA.HMR,
                'process.env': {
                    'ENV': JSON.stringify(METADATA.ENV),
                    'NODE_ENV': JSON.stringify(METADATA.ENV),
                    'HMR': METADATA.HMR,
                    'TARGET': helpers.isWebpackDevServer() ? JSON.stringify('web') : JSON.stringify('electron-renderer'),
                },
                'API_ROOT': METADATA.API_ROOT,
                'MSKS': JSON.stringify(MSKS),
                'API_TERMINAL': JSON.stringify(METADATA.API_TERMINAL)
            })
        ],

        /**
         * Webpack Development Server configuration
         * Description: The webpack-dev-server is a little node.js Express server.
         * The server emits information about the compilation state to the client,
         * which reacts to those events.
         *
         * See: https://webpack.github.io/docs/webpack-dev-server.html
         */
        devServer: {
            port: METADATA.port,
            host: METADATA.host,
            historyApiFallback: true,
            watchOptions: {
                // if you're using Docker you may need this
                // aggregateTimeout: 300,
                // poll: 1000,
                ignored: /node_modules/
            },
            proxy: {
                "/terminal": {
                    target: "http://localhost:8080"
                  }
            }
        },

        /**
         * Include polyfills or mocks for various node stuff
         * Description: Node configuration
         *
         * See: https://webpack.github.io/docs/configuration.html#node
         */
        node: {
            global: true,
            crypto: 'empty',
            fs: 'empty',
            process: true,
            module: false,
            clearImmediate: false,
            setImmediate: false
        }
    });
}