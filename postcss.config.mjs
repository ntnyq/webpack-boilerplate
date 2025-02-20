/**
 * @file PostCSS config
 */

// @ts-check

export default /** @type {import('postcss-load-config').Config} */ ({
  plugins: {
    autoprefixer: {},
    'postcss-preset-env': {},
  },
})
