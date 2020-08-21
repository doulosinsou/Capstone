const path = require("path")
const webpack = require("webpack")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const {CleanWebpackPlugin} = require("clean-webpack-plugin")
const fileLoader = require("file-loader")

module.exports = {
  mode: "development",
  devtool: 'source-map',
  entry: "./src/client/index.js",
  output: {
    libraryTarget: 'var',
    library: "Client"
  },
  module: {
    rules: [
    {
      test: '/\.js$/',
      exclude: /node_modules/,
      loader: "babel-loader"
    },
    {
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader']
    },
    {
      test: /\.(png|jpe?g|gif)$/i,
      use: [{loader: 'file-loader'}]
    }
  ]
    },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/client/index.html",
      filename: "index.html"
    }),
    new CleanWebpackPlugin({
      dry: true,
      verbose: true,
      cleanStaleWebpackAssets: true,
      protectWebpackAssets: false
    })
  ]



}
