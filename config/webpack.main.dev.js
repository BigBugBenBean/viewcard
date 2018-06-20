const path = require('path');
const url = require('url');

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const webpackMergeDll = webpackMerge.strategy({ plugins: 'replace' });
const commonConfig = require('./webpack.common.js');

const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(commonConfig({ env: ENV, type: 'main' }).metadata, {
    host: HOST,
    port: PORT,
    ENV: ENV,
    HMR: HMR
});

module.exports = function (options) {
    console.log('MODE: ', process.env.MODE);

    return webpackMerge(commonConfig({ env: ENV, type: 'main' }), {
        entry: {
            'main': './src-main/main.ts',
        },
        target: 'electron-main',
        output: {
            /**
             * The output directory as absolute path (required).
             *
             * See: http://webpack.github.io/docs/configuration.html#output-path
             */
            path: helpers.root('dist-main'),

            filename: '[name].js'
        },

        module: {
            rules:[

                {
                    test: /\.(jpg|png|gif)$/,
                    use: 'url-loader'
                },
            ]
        },

        plugins: [
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

            new CopyWebpackPlugin([{
                from: 'src-main/icons',
                to: ''
            }]),

            new DefinePlugin({
                REOSURCE_PATH: JSON.stringify(helpers.getElectronWebAppPath()),
                CFGDIR: JSON.stringify(helpers.getElectronConfigPath()),
                MODE: JSON.stringify(process.env.MODE)
            })
        ]
    });
}