import fs from "fs/promises"
import { glob } from "glob"
import p from "path"
import posthtml from "posthtml"
import includePlugin from "posthtml-include"

const SOURCE_DIR = "src"
const DEST_DIR = "public"

const srcFiles = await glob(["[^_]**/*.html", "*.html"], { cwd: SOURCE_DIR })

await Promise.all(srcFiles.map(async f => {
    const dir = p.dirname(f)

    if (dir !== ".")
        await fs.mkdir(p.join(DEST_DIR, p.dirname(f)))
            .catch(err => {
                if (err.errno !== -17) throw err
            })

    const fileContents = await fs.readFile(p.join(SOURCE_DIR, f), "utf8")

    const converted = await posthtml([includePlugin({ root: SOURCE_DIR })])
        .process(fileContents)

    await fs.writeFile(p.join(DEST_DIR, f), converted.html)
}))
