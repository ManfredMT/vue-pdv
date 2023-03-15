const { defineConfig } = require("@vue/cli-service");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const zlib = require("zlib");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: "http://localhost:5000",
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      // 为生产环境修改配置...
      return {
        devtool: 'nosources-source-map',
        plugins: [
          // new BundleAnalyzerPlugin(),
          new CompressionWebpackPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip", // 使用gzip压缩
            test: new RegExp(
              "\\.(js|css|html)$" // 压缩 js,html和 css
            ),
            threshold: 8192, // 资源文件大于8192B时会被压缩
            minRatio: 0.8, // 最小压缩比达到0.8时才会被压缩
            deleteOriginalAssets: false,
          }),
          new CompressionWebpackPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress", // 使用brotli算法压缩
            test: new RegExp(
              "\\.(js|css|html|svg)$" // 压缩 js,html,css,svg
            ),
            compressionOptions: {
              params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
              },
            },
            threshold: 8192,
            minRatio: 0.8,
            deleteOriginalAssets: false,
          }),
        ]
      }
    } else {
      // 为开发环境修改配置...
    }
  },
  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },
});
