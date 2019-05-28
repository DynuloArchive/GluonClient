module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          extraFiles: [
            "gluonserver.exe"
          ]
        },
        linux: {
          extraFiles: [
            "gluonserver"
          ]
        },
        publish: [{
          provider: "github",
          owner: "dynulo",
          repo: "gluonclient"
        }],
        productName: "Gluon",
      }
    }
  }
}
