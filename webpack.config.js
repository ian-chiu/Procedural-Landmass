const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
	mode: 'production',
	entry: './src/ts/index.ts',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'docs')
	},
	resolve: {
		extensions: [ '.ts',  '.js' ]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node-modules/,
			}
		]
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "./src/css", to: "" },
				{ from: "./src/view", to: "" }
			]
		})
	]
};

module.exports = config;
