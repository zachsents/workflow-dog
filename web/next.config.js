/** @type {import("next").NextConfig} */
module.exports = {
    reactStrictMode: true,
    transpilePackages: ["triggers", "integrations", "nodes", "packages"],
    // output: "export",
    productionBrowserSourceMaps: true,

    /**
     * @see https://react-svgr.com/docs/next/
     */
    webpack(config) {
        config.module.rules.push(
            {
                test: /\.svg$/i,
                use: ['@svgr/webpack'],
            },
        )

        return config
    },

    async redirects() {
        return [
            {
                source: "/",
                destination: "/workflows",
                permanent: false,
            },
        ]
    },
}
