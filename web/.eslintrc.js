module.exports = {
    root: true,
    extends: ["custom"],
    env: {
        browser: true,
    },
    rules: {
        "react/no-unescaped-entities": "off",
        "@next/next/no-img-element": "off"
    }
}
