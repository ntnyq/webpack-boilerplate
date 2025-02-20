/**
 * @file Babel config
 */

// @ts-check

export default /** @type {import('@babel/core').TransformOptions} */ ({
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: 3,
        modules: false,
        useBuiltIns: 'usage',
      },
    ],
  ],
})
