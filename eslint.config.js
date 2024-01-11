import js from "@eslint/js"
import nextPlugin from "@next/eslint-plugin-next"
import jsdoc from "eslint-plugin-jsdoc"
import reactPlugin from "eslint-plugin-react"


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
        },
        settings: {
            next: {
                rootDir: "web",
            }
        }
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

