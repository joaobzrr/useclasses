const path = require("path")
const TerserPlugin = require("terser-webpack-plugin");

const rootDir = __dirname;
const srcDir  = path.resolve(rootDir, "src");
const distDir = path.resolve(rootDir, "dist");

module.exports = env => {
    const result = {
        mode: "development",
        entry: path.resolve(srcDir, "index.ts"),
        output: {
            library:       "@bzrr/use-classes",
            libraryTarget: "umd",
            filename:      "index.js",
            publicPath:    "/",
            path:          distDir,
            clean:         true
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        "babel-loader",
                        {
                            loader: "ts-loader",
                            options: {
                                configFile: "tsconfig.main.json"
                            }
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".jsx"]
        },
        externals: {
            react: "react"
        },
        devtool: "source-map",
        devServer: { hot: true },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: {
                        compress: { drop_console: true },
                    }
                })
            ]
        }
    };

    return result;
};
