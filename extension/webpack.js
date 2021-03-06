const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');
const baseManifest = require('./manifest.json');

const config = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    content: path.join(__dirname, 'src/main/app/js/content.ts'),
    background: path.join(__dirname, 'src/main/app/js/background.js'),
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'motif', 
      meta: {
        charset: 'utf-8',
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        'theme-color': '#000000',
      },
      manifest: 'manifest.json',
      filename: 'default.html',
      template: 'src/main/app/templates/default.html',
      hash: true,
    }),
    new CopyPlugin([
      {
        from: 'src/assets',
        to: 'assets',
      },
      {
        from: 'src/main/app/templates',
        to: 'templates',
      },
      {
        from: 'src/main/app/styles',
        to: 'styles',
      }
    ]),
    new WebpackExtensionManifestPlugin({
      config: {
        base: baseManifest,
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif|otf)$/,
        use: ['file-loader'],
      },
    ],
  },
};
module.exports = config;
