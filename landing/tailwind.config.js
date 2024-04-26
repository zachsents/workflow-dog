const defaultColors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.html",
    ],
    theme: {
        extend: {
            colors: {
                primary: defaultColors.violet,
            },
        },
    },
    plugins: [
        function ({ addBase, theme }) {
            function extractColorVars(colorObj, colorGroup = '') {
                return Object.keys(colorObj).reduce((vars, colorKey) => {
                    const value = colorObj[colorKey]

                    const newVars =
                        typeof value === 'string'
                            ? { [`--color${colorGroup}-${colorKey}`]: value }
                            : extractColorVars(value, `-${colorKey}`)

                    return { ...vars, ...newVars }
                }, {})
            }

            addBase({
                ':root': extractColorVars(theme('colors')),
            })
        },
    ],
}
