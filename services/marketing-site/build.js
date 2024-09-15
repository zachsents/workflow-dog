import { $, Glob } from "bun"
import fs from "node:fs/promises"
import posthtml from "posthtml"
import includePlugin from "posthtml-include"
import baseUrlPlugin from "posthtml-base-url"


const PAGES_DIR = "pages"
const OUT_DIR = "dist"
const ASSETS_DIR = `${OUT_DIR}/__marketing`

await $`rm -rf ${OUT_DIR}`
await $`mkdir -p ${OUT_DIR}`

await Promise.all([
    buildHtml(),
    buildCss(),
    buildAssets(),
])

async function buildHtml() {
    const pages = await Array.fromAsync(new Glob("**/*.html").scan(PAGES_DIR))

    await Promise.all(pages.map(async page => {
        const template = await Bun.file(`${PAGES_DIR}/${page}`).text()

        const { html } = await posthtml([
            includePlugin({ root: "components" }),
            baseUrlPlugin({
                url: "/__marketing",
                tags: ["audio", "embed", "iframe", "img", "link", "script", "source", "track", "video"],
            }),
        ]).process(template)

        await Bun.write(`${OUT_DIR}/${page}`, html)
    }))
}

async function buildCss() {
    await $`bunx tailwindcss -i style.css -o ${ASSETS_DIR}/style.css`
}

async function buildAssets() {
    await $`mkdir -p ${ASSETS_DIR}`
    await $`cp -r public/* ${ASSETS_DIR}`
}
