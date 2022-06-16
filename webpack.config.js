const path = require("path");
const html = require("html-webpack-plugin")


module.exports = {
    entry: {
       index: './src/index.js',
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    module: {
        rules : [
            {
                test: /\.css$/i,
                use : ['style-loader','css-loader'],
            }
        ]
    },
    mode: 'development',
    plugins: [ new html ({
        template: 'src/index.html'
    })

    ]

};