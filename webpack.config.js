const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = env => ({
  entry: './src/index.ts',
  devtool: 'source-map',
  devServer: {
    static: [
      {
        directory: './',
        publicPath: '/',
      },
    ],
    devMiddleware: {
      writeToDisk: true,
    },
    hot: true,
    liveReload: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  },
  performance: {
    hints: false
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: ['file-loader'],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: "html-loader"
          },
          {
            loader: "markdown-loader"
          },
        ],
      },
      {
        test: /\.tsv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: false,
          header: false,
          skipEmptyLines: true,
          delimiter: "\t",
        }
      }
    ],
  },
  resolve: {
      // Make sure that Mithril is included only once
      alias: {
        "mithril/stream": path.resolve(__dirname, "node_modules/mithril/stream/stream.js"),
        // Keep in this order!
        "mithril": path.resolve(__dirname, "node_modules/mithril/mithril.js"),
      },
    extensions: [ '.ts', '.js', '.d.ts' ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },
  plugins: [
    new Dotenv({
      path: `./.env.${env.production ? 'production' : (env.development ? 'development' : '')}`,
    }),
  ],
});
