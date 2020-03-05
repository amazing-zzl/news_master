module.exports = {
  devServer: {
    host: "localhost",
    port: 8081,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        pathRewrite: {
          "/api": ""
        }
      }
    }
  },

  // publicPath:'/app'
  // outputDir:'dist',
  // indexPath:'index2.html',
  // lintOnSave:false,
  productionSourceMap: true,
  chainWebpack: config => {
    config.plugins.delete("prefetch");
  }
};
