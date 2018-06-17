const path = require('path');
const helpers = require('./helpers');

/**
 * Webpack Plugins
 *
 * problem with copy-webpack-plugin
 */
const AssetsPlugin = require('assets-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (options) {

    isProd = options.env === 'production';

    return {
        /**
         * Options affecting the resolving of modules.
         *
         * See: http://webpack.github.io/docs/configuration.html#resolve
         */
        resolve: {

            /**
             * An array of extensions that should be used to resolve modules.
             *
             * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
             */
            extensions: ['.ts', '.js', '.json'],

            /**
             * An array of directory names to be resolved to the current directory
             */
            modules: [helpers.root('src'), helpers.root('node_modules')],

        },
        /**
         * Options affecting the normal modules.
         *
         * See: http://webpack.github.io/docs/configuration.html#module
         */
        module: {

            rules: [

                /**
                 * Typescript loader support for .ts
                 *
                 * Component Template/Style integration using `angular2-template-loader`
                 * Angular 2 lazy loading (async routes) via `ng-router-loader`
                 *
                 * `ng-router-loader` expects vanilla JavaScript code, not TypeScript code. This is why the
                 * order of the loader matter.
                 *
                 * See: https://github.com/s-panferov/awesome-typescript-loader
                 * See: https://github.com/TheLarkInn/angular2-template-loader
                 * See: https://github.com/shlomiassaf/ng-router-loader
                 */
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: '@angularclass/hmr-loader',
                            options: {
                                pretty: !isProd,
                                prod: isProd
                            }
                        },
                        {
                            /**
                             *  MAKE SURE TO CHAIN VANILLA JS CODE, I.E. TS COMPILATION OUTPUT.
                             */
                            loader: 'ng-router-loader',
                            options: {
                                loader: 'async-import',
                                genDir: 'compiled',
                                aot: AOT
                            }
                        },
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: 'tsconfig.webpack.json',
                                useCache: !isProd
                            }
                        },
                        {
                            loader: 'angular2-template-loader'
                        },
                        {
                            loader: 'tslint-loader',
                            options: {
                                emitErrors: isProd,
                                failOnHint: false,
                            }
                        }
                    ],
                    exclude: [/\.(spec|e2e)\.ts$/]
                },

                /**
                 * Json loader support for *.json files.
                 *
                 * See: https://github.com/webpack/json-loader
                 */
                {
                    test: /\.json$/,
                    use: 'json-loader'
                },

                /**
                 * To string and css loader support for *.css files (from Angular components)
                 * Returns file content as string
                 *
                 */
                {
                    test: /\.css$/,
                    use: ['to-string-loader', 'css-loader'],
                    exclude: [helpers.root('src', 'styles')]
                },

                /**
                 * To string and sass loader support for *.scss files (from Angular components)
                 * Returns compiled css content as string
                 *
                 */
                {
                    test: /\.scss$/,
                    use: ['to-string-loader', 'css-loader', 'sass-loader'],
                    exclude: [helpers.root('src', 'styles')]
                },

                /**
                 * Raw loader support for *.html
                 * Returns file content as string
                 *
                 * See: https://github.com/webpack/raw-loader
                 */
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'html-loader',
                            options: {
                                ignoreCustomFragments: [/\{\{.*?}}/],
                                root: path.resolve(__dirname, 'assets'),
                                attrs: ['img:src', 'link:href', 'input:src']
                            }
                        }
                    ]
                },

                /**
                 * File loader for supporting images, for example, in CSS files.
                 */
                {
                    test: /\.(jpg|png|gif)$/,
                    use: 'file-loader',
                    exclude: [helpers.root('src', 'icons')]
                },

                /* File loader for supporting fonts, for example, in CSS files.
                */
                {
                    test: /\.(eot|woff2?|svg|ttf)([\?]?.*)$/,
                    use: 'file-loader'
                }

            ],

        },

        /**
         * Add additional plugins to the compiler.
         *
         * See: http://webpack.github.io/docs/configuration.html#plugins
         */
        plugins: [
            /**
             * Plugin: ForkCheckerPlugin
             * Description: Do type checking in a separate process, so webpack don't need to wait.
             *
             * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
             */
            new CheckerPlugin(),
        ],
    };


}
