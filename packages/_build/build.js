import { glob } from "glob"
import fs from "fs/promises"
import path from "path"

const originalTemplate = await fs.readFile("_build/template.ts", "utf-8")


await buildMultiple([
    { folder: "nodes", specialFile: "client.tsx", type: "SharedNodeDefinition & WebNodeDefinition<any>" },
    { folder: "triggers", specialFile: "client.tsx", type: "SharedTriggerDefinition & WebTriggerDefinition<any>" },
    { folder: "services", specialFile: "client.tsx", type: "SharedServiceDefinition & WebServiceDefinition<any>" },
    { folder: "data-types", specialFile: "client.tsx", type: "SharedDataTypeDefinition & WebDataTypeDefinition<any>" },
]).then(barrel => fs.writeFile("_build/barrels/client.ts", barrel))

await buildMultiple([
    { folder: "nodes", specialFile: "server.ts", type: "any" },
    { folder: "triggers", specialFile: "server.ts", type: "SharedTriggerDefinition & ServerTriggerDefinition<any>" },
    { folder: "services", specialFile: "server.ts", type: "SharedServiceDefinition & ServerServiceDefinition<any>" },
    { folder: "data-types", specialFile: "server.ts", type: "any" },
]).then(barrel => fs.writeFile("_build/barrels/server.ts", barrel))

await buildMultiple([
    { folder: "nodes", specialFile: "execution.ts", type: "SharedNodeDefinition & ExecutionNodeDefinition<any>" },
    { folder: "triggers", specialFile: "execution.ts", type: "any" },
    { folder: "services", specialFile: "execution.ts", type: "any" },
    { folder: "data-types", specialFile: "execution.ts", type: "any" },
]).then(barrel => fs.writeFile("_build/barrels/execution.ts", barrel))


async function build({
    folder,
    specialFile,
    idPrefix = folder,
    template,
    type,
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
    ).replace(
        `/* ${folder} TYPE */`,
        ` as Record<string, ${type} & { id: string }>`
    )
}

async function buildMultiple(payloads) {
    let result = originalTemplate
    for (let payload of payloads) {
        result = await build({ ...payload, template: result })
    }

    const types = payloads
        .flatMap(p => p.type?.match(/[A-Z]\w+/g))
        .filter(Boolean)
        .join(", ")

    result = result.replace(
        "// TYPE IMPORT",
        `import type { ${types} } from "@types"`
    )

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