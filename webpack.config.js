const { generateWebpackConfig } = require("@simplrjs/webpack");
const webpack = require("webpack");

const path = require("path");

const config = generateWebpackConfig({
    devServerPort: 4000,
    entryFile: "./src/renderer/app.tsx",
    staticContentDirectory: "./src/renderer/static",
    staticContentDirectoryOutput: "./static",
    outputDirectory: "./dist/renderer",
    emitHtml: true,
    publicPath: "./",
    htmlOptions: {
        title: "NOIA Node",
        baseHref: "./"
    },
    projectDirectory: __dirname,
    target: "electron-renderer"
});

config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)\/(webpack-dev-server)/
});

if (config.plugins == null) {
    config.plugins = [];
}

config.plugins.push(
    new webpack.DefinePlugin({
        __APPVERSION__: JSON.stringify(require(path.resolve(__dirname, "package.json")).version)
    })
);

module.exports = config;
