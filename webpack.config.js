/**
 * @file Webpack config
 */

const process = require('node:process')
const path = require('node:path')
const WebpackBar = require('webpackbar')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')

const { NODE_ENV, APP_BUNDLE_ANALYZER = false } = process.env
const isProduction = NODE_ENV === 'production'
const resolve = (...args) => path.resolve(__dirname, ...args)

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: isProduction ? 'production' : 'development',

  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },

  entry: {
    app: resolve('src/main.js'),
  },

  output: {
    path: resolve('dist'),
    publicPath: isProduction ? '/' : 'auto',
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].js',
  },

  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },

  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        include: [resolve('src')],
        loader: 'babel-loader',
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
              additionalData: '@import "@/styles/core/style";',
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

  optimization: {
    minimizer: [
      new TerserWebpackPlugin({
        extractComments: false,
      }),

      new CssMinimizerWebpackPlugin({}),
    ],

    splitChunks: {
      cacheGroups: {
        commons: {
          test: /node_modules/,
          name: 'vendors',
          chunks: 'initial',
          priority: 10,
          enforce: true,
        },
      },
    },

    runtimeChunk: {
      name: 'manifest',
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack boilerplate',
      template: resolve('index.html'),
      inject: 'body',
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: resolve('dist'),
          globOptions: {
            ignore: ['*.DS_Store'],
          },
        },
      ],
    }),

    ...(isProduction
      ? [
          new CleanWebpackPlugin(),
          new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].css',
          }),
        ]
      : [new WebpackBar()]),

    ...(isProduction && APP_BUNDLE_ANALYZER ? [new BundleAnalyzerPlugin()] : []),
  ],

  devServer: {
    open: true,
    port: 9527,
    hot: true,
    compress: true,
    static: {
      directory: resolve('dist'),
    },
    client: {
      overlay: {
        warnings: true,
        errors: true,
      },
    },
  },

  node: false,
}
