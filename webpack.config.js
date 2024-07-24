/**
 * @file Webpack config
 */

const path = require('node:path')
const process = require('node:process')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const WebpackBar = require('webpackbar')

const { APP_BUNDLE_ANALYZER = false, NODE_ENV } = process.env
const isProduction = NODE_ENV === 'production'
const resolve = (...args) => path.resolve(__dirname, ...args)

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  cache: {
    buildDependencies: {
      config: [__filename],
    },
    type: 'filesystem',
  },

  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
    compress: true,
    hot: true,
    open: true,
    port: 9527,
    static: {
      directory: resolve('dist'),
    },
  },

  entry: {
    app: resolve('src/main.js'),
  },

  mode: isProduction ? 'production' : 'development',

  module: {
    rules: [
      {
        exclude: /node_modules/,
        include: [resolve('src')],
        loader: 'babel-loader',
        test: /.js$/,
      },

      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isProduction
            ? {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '../../',
                },
              }
            : 'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: '@use "@/styles/core/style" as *;',
            },
          },
        ],
      },

      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
      },

      {
        test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
        type: 'asset/inline',
      },
    ],
  },

  node: false,

  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        extractComments: false,
      }),

      new CssMinimizerWebpackPlugin({}),
    ],

    runtimeChunk: {
      name: 'manifest',
    },

    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          enforce: true,
          name: 'vendors',
          priority: 10,
          test: /node_modules/,
        },
      },
    },
  },

  output: {
    chunkFilename: 'static/js/[name].[chunkhash:8].js',
    filename: 'static/js/[name].[chunkhash:8].js',
    path: resolve('dist'),
    publicPath: isProduction ? '/' : 'auto',
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: 'body',
      template: resolve('index.html'),
      title: 'Webpack boilerplate',
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          to: resolve('dist'),
        },
      ],
    }),

    ...(isProduction
      ? [
          new CleanWebpackPlugin(),
          new MiniCssExtractPlugin({
            chunkFilename: 'static/css/[name].[contenthash:8].css',
            filename: 'static/css/[name].[contenthash:8].css',
          }),
        ]
      : [new WebpackBar()]),

    ...(isProduction && APP_BUNDLE_ANALYZER ? [new BundleAnalyzerPlugin()] : []),
  ],

  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
}
