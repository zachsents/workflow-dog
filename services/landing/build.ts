import { $, Glob } from "bun"
import fs from "node:fs/promises"
import posthtml from "posthtml"
// @ts-ignore
import includePlugin from "posthtml-include"

const PAGES_DIR = "pages"
const OUT_DIR = "dist"


await fs.rm(OUT_DIR, { recursive: true, force: true })
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
            includePlugin({ root: "components" })
        ]).process(template)

        await Bun.write(`${OUT_DIR}/${page}`, html)
    }))
}

async function buildCss() {
    await $`bunx tailwindcss -i style.css -o ${OUT_DIR}/style.css`
}

async function buildAssets() {
    await $`cp -r public ${OUT_DIR}`
}