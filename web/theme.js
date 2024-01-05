import { DEFAULT_THEME } from "@mantine/core"
import _ from "lodash"

const primaryColor = "orange"

/** @type {import("@mantine/core").MantineThemeOverride} */
export const mantineTheme = {
    fontFamily: "DM Sans",
    primaryColor,
    headings: {
        fontFamily: "DM Sans",
    },
    fontSizes: {
        xxs: "0.625rem",
        xxxs: "0.5rem",
    },
    spacing: {
        xxs: "0.5rem",
        xxxs: "0.375rem",
    },
    defaultRadius: "md",
    colors: {
        pg: ["#efeef7", "#cfcce6", "#afa9d5", "#8f87c4", "#6e65b4", "#554b9a", "#423b78", "#2f2a56", "#1c1933", "#090811"],
    },
    shadows: {
        xs: "0 2px 3px -1px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        sm: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        md: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        lg: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        xl: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    },
    other: {
        dateTimeFormat: "MMM D, YYYY h:mm A",
    },
}
mantineTheme.colors.primary = { ...DEFAULT_THEME.colors, ...mantineTheme.colors }[primaryColor]


export const tailwindTheme = {
    // Tailwind takes colors in the form of:
    // red: {
    //     100: "#f7f3f3",
    //     200: "#e5d4d4",
    //     ...
    colors: {
        ..._.mapValues({ ...DEFAULT_THEME.colors, ...mantineTheme.colors }, colorArrayToTailwindObject),
        white: "#fff",
        black: "#000",
    },
    borderWidth: {
        "1": "0.0625rem",
    },
    borderRadius: {
        ...DEFAULT_THEME.radius,
        DEFAULT: DEFAULT_THEME.radius.md,
    },
    boxShadow: {
        ...mantineTheme.shadows,
        DEFAULT: mantineTheme.shadows.sm,
    },
    scale: {
        "101": "1.01",
        "102": "1.02",
        "103": "1.03",
    },
    fontSize: {
        ...DEFAULT_THEME.fontSizes,
        ...mantineTheme.fontSizes,
        base: DEFAULT_THEME.fontSizes.md,
    },
    spacing: {
        ...DEFAULT_THEME.spacing,
        ...mantineTheme.spacing,
    },
    fontFamily: {
        sans: [mantineTheme.fontFamily, "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
    },
}

// Adds primary colors as CSS variables
export const additionalCSSVariables = DEFAULT_THEME.colors.dark.map((_, i) => {
    return `--mantine-color-primary-${i}: ${DEFAULT_THEME.colors[mantineTheme.primaryColor][i]};`
}).join(" ")


function colorArrayToTailwindObject(arr) {
    return {
        ...Object.fromEntries(
            arr.map((hex, i) => [i == 0 ? "50" : `${i}00`, hex])
        ),
        DEFAULT: arr[DEFAULT_THEME.primaryShade.light]
    }
}