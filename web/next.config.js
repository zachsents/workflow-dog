/** @type {import("next").NextConfig} */
module.exports = {
    reactStrictMode: true,
    transpilePackages: ["packages"],
    productionBrowserSourceMaps: true,
    output: "standalone",

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
    redirects: async () => [
        {
            source: "/",
            destination: "/projects",
            permanent: false,
        },
    ],
}
