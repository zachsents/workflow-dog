module.exports = {
    env: {
        es6: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@next/next/recommended",
        "plugin:react/recommended",
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
            jsx: true
        }
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "@next/next/no-title-in-document-head": "off",
    },
    settings: {
        react: {
            version: "detect"
        },
        next: {
            rootDir: "web/pages/"
        },
    }
}
