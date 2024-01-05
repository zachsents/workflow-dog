import { nextui } from "@nextui-org/react"
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
                },
            },
        }
    })],
    corePlugins: {
        // preflight: false,
    },
    darkMode: "class",
}
