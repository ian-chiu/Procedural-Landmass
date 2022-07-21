const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
	mode: 'production',
	devtool: false,
	entry: {
		index: './src/ts/index.ts',
		application: './src/ts/core/Application.ts',
		canvas: './src/ts/core/Canvas.ts',
		mapGenerator: './src/ts/procedural_landmass/MapGenerator.ts',
		mapDisplay: './src/ts/procedural_landmass/MapDisplay.ts',
		noise: './src/ts/procedural_landmass/Noise.ts'
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'public')
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
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
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
