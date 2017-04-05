/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var dir_js = path.resolve(__dirname, 'js');
var dir_css = path.resolve(__dirname, 'css');
var dir_html = path.resolve(__dirname, 'html');
var dir_build = path.resolve(__dirname, 'build');

const PATHS =
{
	styles:[path.resolve(__dirname, 'sass'), path.dir_css],
	images: path.resolve(__dirname, 'images')
};

module.exports = {
    entry: path.resolve(dir_js, 'main.js'),
    output: {
        path: dir_build,
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: dir_build,
    },
    module: {
        loaders: [
            {
                loader: 'react-hot',
                test: dir_js,
            },
            {
                loader: 'babel-loader',
                test: dir_js,
                query: {
                    presets: ['es2015', 'react'],
                },
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', 'css!postcss'),
                include: path.resolve(__dirname, 'sass')
            },
            {
                test: /\.s(c|a)ss$/,
                loader: ExtractTextPlugin.extract("style", "css!postcss!sass"),
                include: path.resolve(__dirname, 'sass')
            },
            {
                test: /\.(jpg|png)$/,
                // loader: 'file?name=[path][name].[hash].[ext]',
                loader: 'file?name=[path][name].[ext]',
                include: PATHS.images
            }
        ]
    },
    plugins: [
        // Simply copies the files over
        new CopyWebpackPlugin([
            { from: dir_html } // to: output.path
        ]),
        // Avoid publishing files when compilation fails
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('[name].css')
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    // Create Sourcemaps for the bundle
    devtool: 'source-map',
};
