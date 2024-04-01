import { glob } from "glob"
import fs from "fs/promises"
import path from "path"

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
    const folderPaths = await glob(`*/${folder}/*`)

    const collection = await Promise.all(
        folderPaths.map(async folderPath => {
            const sharedPath = path.join(folderPath, "shared.ts")
            const specialPath = path.join(folderPath, specialFile)

            const specialExists = await fs.stat(specialPath)
                .then(() => true)
                .catch(() => false)

            if (!specialExists)
                return

            const sharedImportName = importNameFromPath(sharedPath)
            const specialImportName = importNameFromPath(specialPath)

            const sharedImportPath = importPathFromPath(sharedPath)
            const specialImportPath = importPathFromPath(specialPath)

            const importLines = `
import ${sharedImportName} from "${sharedImportPath}"
import ${specialImportName} from "${specialImportPath}"`.trim()

            const segments = folderPath.split("/")

            const id = `https://${idPrefix}.workflow.dog/${segments[0]}/${segments[2]}`

            const exportLines = "    " + `
    "${id}": _.merge({},
        ${sharedImportName},
        ${specialImportName},
        { id: "${id}" }    
    ),`.trim()

            return {
                id,
                importLines,
                exportLines,
            }
        })
    ).then(arr => arr.filter(Boolean))

    console.log(`[${folder}/${specialFile}]`, collection.length, "items")

    return template.replace(
        `// ${folder} IMPORTS`,
        collection.map(c => c.importLines).join("\n")
    ).replace(
        `    // ${folder} EXPORTS`,
        collection.map(c => c.exportLines).join("\n")
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