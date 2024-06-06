import { glob } from "glob"
import fs from "fs/promises"

const files = await glob("basic/nodes/*/shared.ts")

files.forEach(async file => {
    const fileContents = await fs.readFile(file, "utf-8")

    const newContents = fileContents.replace(/^import.+/m, `import { sharedNode } from "@pkg/helpers/shared"`)
        .replace("createSharedNodeDefinition(", "sharedNode(import.meta.url, ")

    const [pack, , sub] = file.split("/")
    const newPath = `data/nodes/${pack}/${sub}.shared.ts`

    // await fs.mkdir(`data/nodes/${pack}`, { recursive: true })
    // await fs.writeFile(newPath, newContents)

})

console.log(files)