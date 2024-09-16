import { $, Glob } from "bun"
import posthtml from "posthtml"
import baseUrlPlugin from "posthtml-base-url"
import includePlugin from "posthtml-include"
import path from "node:path"
import { createHash } from "node:crypto"


const PAGES_DIR = "pages"
const OUT_DIR = process.argv[2]
const ASSETS_DIR = `${OUT_DIR}/__marketing`

if (!OUT_DIR)
    throw new Error("Please provide an output directory as the first argument.")

console.log("Building to", OUT_DIR)

await $`mkdir -p ${OUT_DIR}`
await $`rm -rf ${OUT_DIR}/* || true`

// build assets
await $`mkdir -p ${ASSETS_DIR}`
await $`cp -r public/* ${ASSETS_DIR}`

// build css
await $`bunx tailwindcss -i style.css -o ${ASSETS_DIR}/style.[hash].css`

// track assets that need hashing
const hashedAssets = new Map()

// find pages and build html
const pages = await Array.fromAsync(new Glob("**/*.html").scan(PAGES_DIR))
await Promise.all(pages.map(async page => {
    const template = await Bun.file(`${PAGES_DIR}/${page}`).text()

    let { html } = await posthtml([
        includePlugin({ root: "components" }),
        baseUrlPlugin({
            url: "/__marketing",
            tags: ["audio", "embed", "iframe", "img", "link", "script", "source", "track", "video"],
        }),
        customHashPlugin(hashedAssets),
    ]).process(template)

    await Bun.write(`${OUT_DIR}/${page}`, html)
}))

// rename hashed assets
Array.from(hashedAssets.entries()).map(async ([assetPath, hash]) => {
    await $`mv ${assetPath} ${assetPath.replace("[hash]", hash)}`
})


/** @param {Map<string, string>} hashedAssets */
function customHashPlugin(hashedAssets) {
    return async (tree) => {
        const promises = []

        /** @param {import("posthtml").Node} node */
        const handleNode = (node) => {
            promises.push(...Object.entries(node.attrs ?? {})
                .filter(([k, v]) => ["href", "src"].includes(k) && !v.startsWith("http"))
                .map(async ([k, v]) => {
                    if (!v.includes(".[hash]"))
                        return

                    const assetPath = path.join(OUT_DIR, v)
                    if (!hashedAssets.has(assetPath)) {
                        const assetContent = await Bun.file(assetPath).text()
                        const hash = createHash("md5").update(assetContent).digest("hex")
                        hashedAssets.set(assetPath, hash)
                    }
                    node.attrs[k] = v.replace("[hash]", hashedAssets.get(assetPath))
                }))
            return node
        }

        tree.match({ tag: "link" }, handleNode)
        tree.match({ tag: "script" }, handleNode)

        await Promise.all(promises)
        return tree
    }
}