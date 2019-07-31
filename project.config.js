const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const imageminMozjpeg = require('imagemin-mozjpeg')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const {
  NODE_ENV = 'production',
  APP_BUNDLE_ANALYZER = false
} = process.env
const projectConfig = require('./config.json')

const plugins = [
  new MiniCssExtractPlugin({
    filename: 'static/css/[name].[contenthash:8].css',
    chunkFilename: 'static/css/[name].[contenthash:8].css'
  }),
  new HtmlWebpackPlugin({
    ...projectConfig,
    // publicPath,
    publicPath: './',
    filename: 'index.html',
    template: './src/pug/index.pug',
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
    }
  }),
  new PreloadWebpackPlugin({
    rel: 'preload',
    include: 'allChunks'
  }),
  new CopyWebpackPlugin([
    {
      from: `./public/favicon.ico`,
      to: ''
    }
  ]),
  ...(
    NODE_ENV === 'production'
      ? [
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new CleanWebpackPlugin(),
        new ImageminPlugin({
          pngquant: { quality: '65-80' },
          plugins: [
            imageminMozjpeg({
              quality: 70,
              progressive: true
            })
          ]
        })
      ]
      : [
        new webpack.HotModuleReplacementPlugin(),
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: ['You application is running here http://127.0.0.1:9527']
          },
          clearConsole: true
        })
      ]
  ),
  ...(
    APP_BUNDLE_ANALYZER ? [new BundleAnalyzerPlugin()] : []
  )
]

exports.plugins = plugins
