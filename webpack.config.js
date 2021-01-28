const path = require("path");
const KintonePlugin = require("@kintone/webpack-plugin-kintone-plugin");

module.exports = {
    mode: 'development',
    entry: {
        desktop: './src/js/dist/desktop.js',
        config: './src/js/dist/config.js'
    },
    output: {
        path: path.resolve(__dirname, 'src', 'js', 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        new KintonePlugin({
            manifestJSONPath: './src/manifest.json',
            privateKeyPath: './private.ppk',
            pluginZipPath: './dist/tippyjs-kintone-plugin.zip'
        })
    ]
};