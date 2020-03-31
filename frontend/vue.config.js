module.exports = {
  "pages": {
    "board": {
      "entry": "src/board.js",
      "template": "templates/board.html",
      "filename": "board.html"
    },
    "card": {
      "entry": "src/card.js",
      "template": "templates/card.html",
      "filename": "card.html"
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
};