/**
 * @file Webpack config
 */

import path from 'node:path'
import process from 'node:process'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import CssMinimizerWebpackPlugin from 'css-minimizer-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserWebpackPlugin from 'terser-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import WebpackBar from 'webpackbar'
import type { Configuration } from 'webpack'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'

const { APP_BUNDLE_ANALYZER = false, NODE_ENV } = process.env
const isProduction = NODE_ENV === 'production'
const resolve = (...args: string[]) => path.resolve(__dirname, ...args)

export default {
  mode: isProduction ? 'production' : 'development',

  node: false,

  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },

  devServer: {
    compress: true,
    hot: true,
    open: true,
    port: 9527,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
    static: {
      directory: resolve('dist'),
    },
  },

  entry: {
    app: resolve('src/main.ts'),
  },

  module: {
    rules: [
      {
        exclude: /node_modules/,
        include: [resolve('src')],
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
          },
        ],
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
            chunkFilename: 'static/css/[name].[contenthash:8].css',
            filename: 'static/css/[name].[contenthash:8].css',
          }),
        ]
      : [new WebpackBar()]),

    ...(isProduction && APP_BUNDLE_ANALYZER
      ? [new BundleAnalyzerPlugin()]
      : []),
  ],

  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': resolve('src'),
    },
  },
} satisfies Configuration & DevServerConfiguration
