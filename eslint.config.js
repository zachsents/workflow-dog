import js from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import jsdoc from "eslint-plugin-jsdoc"
import reactPlugin from "eslint-plugin-react"
import globals from "globals"


/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    {
        files: ["**/*.js", "**/*.jsx"],
        plugins: {
            jsdoc,
        },
        rules: {
            ...js.configs.recommended.rules,
        },
        languageOptions: {
            ecmaVersion: "latest",
            parserOptions: {
                sourceType: "module",
            },
            globals: {
                ...globals.builtin,
                ...globals.node,
            },
        },
    },
    {
        files: ["web/**/*.js", "web/**/*.jsx"],
        plugins: {
            "@next/next": nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            "@next/next/no-img-element": 0,
        },
        settings: {
            next: {
                rootDir: "web",
            }
        },
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },
    {
        files: ["**/*.jsx", "web/**/*.js"],
        plugins: {
            react: reactPlugin,
        },
        rules: {
            ...reactPlugin.configs["jsx-runtime"].rules,

            // these fix the weird unused imports errors in JSX
            "react/jsx-uses-react": 1,
            "react/jsx-uses-vars": 1,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
]

