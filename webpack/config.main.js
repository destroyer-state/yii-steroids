const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExportTranslationKeysPlugin = require('./plugins/ExportTranslationKeysPlugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const utils = require('./utils');
const getConfigDefault = require('./config.default');

function recursiveIssuer(m) {
    if (m.issuer) {
        return recursiveIssuer(m.issuer);
    } else if (m.name) {
        return m;
    } else {
        return null;
    }
}

module.exports = (config, entry) => {
    config = _.merge(getConfigDefault(), config);

    // For split chunks
    const indexEntry = entry.index;
    //delete entry.index;

    // Init default webpack config
    let webpackConfig = {
        entry,
        devtool: !utils.isProduction() ? 'eval-source-map' : false,
        output: utils.isProduction()
            ? {
                publicPath: '/',
                path: config.outputPath,
                filename: `${config.baseUrl}bundle-[name]${config.useHash ? '.[hash]' : ''}.js`,
                chunkFilename: `${config.baseUrl}bundle-[name]${config.useHash ? '.[hash]' : ''}.js`,
            }
            : {
                publicPath: `http://${config.host}:${config.port}/`,
                path: config.outputPath,
                filename: `${config.staticPath}${config.baseUrl}bundle-[name]${config.useHash ? '.[hash]' : ''}.js`,
                chunkFilename: `${config.staticPath}${config.baseUrl}bundle-[name]${config.useHash ? '.[hash]' : ''}.js`,
            },
        module: {
            rules: {
                js: {
                    test: /\.js$/,
                    use: {
                        cache: utils.isProduction() && 'cache-loader',
                        babel: {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,
                                plugins: [
                                    //'transform-object-rest-spread',
                                    //'transform-export-extensions',
                                    ['@babel/plugin-proposal-decorators', {legacy: true}],
                                    '@babel/plugin-proposal-class-properties',
                                    '@babel/plugin-transform-runtime',
                                    !utils.isProduction() && 'react-hot-loader/babel',
                                ].filter(Boolean),
                                presets: [
                                    '@babel/preset-env',
                                    '@babel/preset-react',
                                    utils.isProduction() && ['minify', {
                                        builtIns: false,
                                        evaluate: false,
                                        mangle: false,
                                    }],
                                ].filter(Boolean),
                            }
                        },
                        eslint: !utils.isProduction() && fs.existsSync(config.cwd + '/.eslintrc') && {
                            loader: 'eslint-loader',
                            options: {
                                configFile: config.cwd + '/.eslintrc',
                                ignoreFile: fs.existsSync(config.cwd + '/.eslintignore')
                                    ? config.cwd + '/.eslintignore'
                                    : null,
                            }
                        },
                    },
                    exclude: /node_modules(\/|\\+)(?!yii-steroids)/,
                },
                less: {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'less-loader',
                    ],
                },
                sass: {
                    test: /\.scss$/,
                    use: [
                        'css-hot-loader',
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
                font: {
                    test: /(\/|\\)fonts(\/|\\).*\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                    use: {
                        cache: utils.isProduction() && 'cache-loader',
                        file: {
                            loader: 'file-loader',
                            options: {
                                name: `${config.staticPath}${config.baseUrl}fonts/[name].[hash].[ext]`,
                            },
                        },
                    },
                },
                image: {
                    test: /\.(jpe?g|gif|png|svg)$/,
                    use: {
                        cache: utils.isProduction() && 'cache-loader',
                        file: {
                            loader: 'file-loader',
                            options: {
                                name: `${config.staticPath}${config.baseUrl}images/[hash].[ext]`,
                            },
                        },
                    },
                },
            },
        },
        resolve: {
            extensions: ['.js', '.jsx', '.json'],
            alias: {
                app: path.resolve(config.cwd, 'app'),
                actions: `${config.sourcePath}/actions`,
                components: `${config.sourcePath}/components`,
                enums: `${config.sourcePath}/enums`,
                reducers: `${config.sourcePath}/reducers`,
                routes: `${config.sourcePath}/routes`,
                shared: `${config.sourcePath}/shared`,
                types: `${config.sourcePath}/types`,
                ui: `${config.sourcePath}/ui`,
            },
            modules: [
                path.resolve(config.cwd, 'node_modules'), // the old 'fallback' option (needed for npm link-ed packages)
                fs.existsSync(path.resolve(config.cwd, '../node_modules')) ? path.resolve(config.cwd, '../node_modules') : null,
                path.resolve(config.cwd, 'app'),
                config.sourcePath,
            ].filter(Boolean),
        },
        plugins: [
            utils.isAnalyze() && new BundleAnalyzerPlugin(),
            new ExportTranslationKeysPlugin(),
            new MiniCssExtractPlugin({
                filename: `${config.staticPath}${config.baseUrl}bundle-[name]${config.useHash ? '.[hash]' : ''}.css`,
                chunkFilename: `${config.staticPath}${config.baseUrl}bundle-[id]${config.useHash ? '.[hash]' : ''}.css`,
            }),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), // Skip moment locale files (0.3 mb!)
            utils.isProduction() && new webpack.optimize.OccurrenceOrderPlugin(),
            !utils.isProduction() && new webpack.ProgressPlugin(),
            new webpack.NamedModulesPlugin(),
            new webpack.NamedChunksPlugin(),
            !utils.isProduction() && new webpack.HotModuleReplacementPlugin(),

            // Index html
            fs.existsSync(config.sourcePath + '/index.html') && new HtmlWebpackPlugin({
                inject: true,
                template: config.sourcePath + '/index.html',
                filename: `${config.baseUrl}index.html`
            }),

            // Proxy all APP_* env variables
            new webpack.DefinePlugin(Object.keys(process.env).reduce((obj, key) => {
                if (key.indexOf('APP_') === 0) {
                    obj['process.env.' + key] = JSON.stringify(process.env[key]);
                }
                return obj;
            }, {})),
        ].filter(Boolean),
        performance: {
            maxEntrypointSize: 12000000,
            maxAssetSize: 12000000,
        },
    };

    webpackConfig = _.merge(webpackConfig, {
        mode: utils.isProduction() ? 'production' : 'development',
        optimization: {
            runtimeChunk: {
                name: 'common',
            },
            minimize: utils.isProduction(),
        }
    });

    // Extracting CSS based on entry
    webpackConfig.optimization.splitChunks = webpackConfig.optimization.splitChunks || {cacheGroups: {}};
    Object.keys(entry).forEach(name => {
        // Skip styles
        if (/^style-/.test(name)) {
            return;
        }

        webpackConfig.optimization.splitChunks.cacheGroups[name] = {
            name: name,
            test: m => {
                const issuer = recursiveIssuer(m);
                return m.constructor.name === 'CssModule' && issuer && issuer.name === name;
            },
            chunks: 'all',
        };
    });
    if (indexEntry) {
        webpackConfig.optimization.splitChunks = {
            cacheGroups: {
                commonJs: {
                    name: 'common',
                    chunks: 'initial',
                    test: /\.js$/,
                    minChunks: 2,
                    minSize: 0,
                },
                commonStyle: {
                    name: 'common',
                    chunks: 'initial',
                    test: /\.(scss|less|css)$/,
                    minChunks: 10000, // Bigger value for disable common.css (i love webpack, bly@t.. %)
                }
            }
        };
    }

    // Merge with custom
    webpackConfig = _.merge(webpackConfig, config.webpack);

    // Normalize rules (objects -> arrays)
    webpackConfig.module.rules = Object.keys(webpackConfig.module.rules)
        .map(key => {
            const item = webpackConfig.module.rules[key];
            if (item.use) {
                item.use = _.values(item.use).filter(Boolean);
            }

            return item;
        })
        .filter(Boolean);

    // Add hot replace to each bundles
    if (!utils.isProduction()) {
        Object.keys(webpackConfig.entry).map(key => {
            webpackConfig.entry[key] = []
                .concat([
                    `webpack-dev-server/client?http://${config.host}:${config.port}`,
                    'webpack/hot/dev-server',
                ])
                .concat(webpackConfig.entry[key])
        });
    }

    return webpackConfig;
};
