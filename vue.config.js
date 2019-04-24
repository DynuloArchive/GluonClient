module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          extraFiles: [
            "gluon.exe"
          ]
        },
        linux: {
          extraFiles: [
            "gluon"
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
