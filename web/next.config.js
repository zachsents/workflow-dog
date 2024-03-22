/** @type {import("next").NextConfig} */
module.exports = {
    reactStrictMode: true,
    transpilePackages: ["packages"],
    // output: "export",
    // productionBrowserSourceMaps: true,

    /**
     * @see https://react-svgr.com/docs/next/
     */
    webpack(config) {
        config.module.rules.push(
            {
                loader: "@svgr/webpack",
                options: {
                    prettier: false,
                    svgo: true,
                    svgoConfig: {
                        plugins: [
                            {
                                name: "preset-default",
                                params: {
                                    overrides: { removeViewBox: false },
                                },
                            },
                        ],
                    },
                    titleProp: true,
                },
                test: /\.svg$/,
            }
        )

        return config
    },

    async redirects() {
        return [
            {
                source: "/",
                destination: "/projects",
                permanent: false,
            },
        ]
    },
}
