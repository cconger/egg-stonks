const path = require('path');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  mode: "development",

  devtool: "source-map",

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", '.css'],
    alias: {
      "stonks": path.join(__dirname, "src"),
    },
  },

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            }
          }
        ]
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "Stonks",
    }),
    new FaviconsWebpackPlugin('src/favicon.png'),
    new ForkTsCheckerWebpackPlugin()
  ],

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    index: 'index.html',
  }
};
