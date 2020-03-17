module.exports = {
  "pages": {
    "board": {
      "entry": "src/board.js",
      "template": "templates/board.html",
      "filename": "board.html"
    }
  },
  "transpileDependencies": [
    "vuetify"
  ],
  "configureWebpack": {
    "devtool": 'eval-source-map',
    "optimization": {
      "splitChunks": false
    }
  }
}