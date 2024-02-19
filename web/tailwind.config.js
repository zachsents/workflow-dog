import { nextui } from "@nextui-org/react"
import _ from "lodash"
import colors from "tailwindcss/colors"


const DEFAULT_SHADE = {
    light: 600,
    dark: 300,
}


/** @type {import("tailwindcss").Config} */
export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./modules/**/*.{js,ts,jsx,tsx,mdx}",
        "../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
        "../nodes/**/*.{jsx,tsx,mdx}",
        "../triggers/**/*.{jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [nextui({
        themes: {
            light: {
                extend: "light",
                colors: {
                    primary: {
                        ...colors.violet,
                        DEFAULT: colors.violet[DEFAULT_SHADE.light],
                    },
                    secondary: {
                        ...colors.amber,
                        DEFAULT: colors.amber[DEFAULT_SHADE.light],
                    },
                    danger: {
                        ...colors.red,
                        DEFAULT: colors.red[DEFAULT_SHADE.light],
                    },
                    default: {
                        ...colors.gray,
                        DEFAULT: colors.gray[DEFAULT_SHADE.dark],
                    },
                },
            },
            dark: {
                extend: "dark",
                colors: {
                    primary: {
                        ...swapColors(colors.violet),
                        DEFAULT: colors.violet[DEFAULT_SHADE.light],
                    },
                    secondary: {
                        ...swapColors(colors.amber),
                        DEFAULT: colors.amber[DEFAULT_SHADE.light],
                    },
                    danger: {
                        ...swapColors(colors.red),
                        DEFAULT: colors.red[DEFAULT_SHADE.light],
                    },
                    default: {
                        ...swapColors(colors.gray),
                        DEFAULT: colors.gray[DEFAULT_SHADE.dark],
                    },
                },
            },
        }
    })],
    corePlugins: {
        // preflight: false,
    },
    darkMode: "class",
}


/**
 * Swaps the order of shades in Tailwind color objects order for dark mode
 * @param {Record<string, any>} colors
 * @returns {Record<string, any>}
 */
function swapColors(colors) {
    return _.zipObject(
        Object.keys(colors).reverse(),
        Object.values(colors)
    )
}