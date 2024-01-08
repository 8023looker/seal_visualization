const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  parallel: false,
  publicPath: './',
  // base: "/seal_visualization/",
  // build: {
  //   outDir: "docs"
  // },
  chainWebpack: config => {
    config.module
        .rule('worker')
        .test(/\.worker\.js$/)
        .use('worker-loader')
        .loader('worker-loader')
        .end()
    config.resolve.set('fallback', {"path": require.resolve('path-browserify'),
      "fs": require.resolve("browserify-fs"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "crypto": false})
  }
})
