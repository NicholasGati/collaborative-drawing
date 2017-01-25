var webpack = require('webpack');
var debug = process.env.NODE_ENV != 'production';

module.exports = {
    context: __dirname,
    devtool: debug ? "inline-sourcemap" : null,
    entry: {
      index: ["./public/javascripts/index.js"]
    },
    output: {
      path: __dirname + "/public/javascripts",
      filename: "bundle.js"
    },
    node: {
      fs: "empty"
    },
    module: {
      loaders: [
        { test: /\.js?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel',
          query: {
            cacheDirectory: true,
            compact: false,
            presets: ['es2015']
          }
        },
        { test: /\.json$/,
          loader: "json-loader"
        }
      ]
    },
    plugins: debug ? [] : [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        mangle: false,
        sourcemap: false
      })
    ]
};
