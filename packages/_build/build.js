import fs from "fs/promises"
import { glob } from "glob"

const originalTemplate = await fs.readFile("_build/template.ts", "utf-8")


await buildMultiple([
    { folder: "nodes", specialFile: "client.tsx" },
    { folder: "triggers", specialFile: "client.tsx" },
    { folder: "services", specialFile: "client.tsx" },
    { folder: "data-types", specialFile: "client.tsx" },
]).then(barrel => fs.writeFile("_build/barrels/client.ts", barrel))

await buildMultiple([
    { folder: "nodes", specialFile: "server.ts" },
    { folder: "triggers", specialFile: "server.ts" },
    { folder: "services", specialFile: "server.ts" },
    { folder: "data-types", specialFile: "server.ts" },
]).then(barrel => fs.writeFile("_build/barrels/server.ts", barrel))

await buildMultiple([
    { folder: "nodes", specialFile: "execution.ts" },
    { folder: "triggers", specialFile: "execution.ts" },
    { folder: "services", specialFile: "execution.ts" },
    { folder: "data-types", specialFile: "execution.ts" },
]).then(barrel => fs.writeFile("_build/barrels/execution.ts", barrel))


async function build({
    folder,
    specialFile,
    idPrefix = folder,
    template,
}) {
    const filePaths = await glob(`*/${folder}/*/${specialFile}`)

    const collection = filePaths.map(filePath => {
        const importName = importNameFromPath(filePath)
        const importPath = importPathFromPath(filePath)

        const importLine = `import ${importName} from "${importPath}"`

        const segments = filePath.split("/")
        const id = `https://${idPrefix}.workflow.dog/${segments[0]}/${segments[2]}`

        const exportLine = "    " + `
"${id}": _.merge(
        { id: "${id}" },    
        ${importName},
    ),`.trim()

        return {
            id,
            importLine,
            exportLine,
        }
    })

    console.log(`[${folder}/${specialFile}]`, collection.length, "items")

    return template.replace(
        `// ${folder} IMPORTS`,
        collection.map(c => c.importLine).join("\n")
    ).replace(
        `    // ${folder} EXPORTS`,
        collection.map(c => c.exportLine).join("\n")
    )
}

async function buildMultiple(payloads) {
    let result = originalTemplate
    for (let payload of payloads) {
        result = await build({ ...payload, template: result })
    }
    return result
}

function importNameFromPath(p) {
    return p
        .split(".").slice(0, -1).join(".")
        .replaceAll(/\W+/g, "_")
}

function importPathFromPath(p) {
    return "../../" + p
        .split(".").slice(0, -1).join(".")
        .replaceAll(/\\/g, "/")
}