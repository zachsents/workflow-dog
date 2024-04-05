import fs from "fs/promises"
import { glob } from "glob"

const originalTemplate = await fs.readFile("_build/template.ts", "utf-8")

await Promise.all([
    build({ folder: "nodes", specialFile: "client.tsx", genericType: "MergedClientNodeDefinition" }),
    build({ folder: "nodes", specialFile: "execution.ts", genericType: "MergedExecutionNodeDefinition" }),
    build({ folder: "triggers", specialFile: "client.tsx", genericType: "MergedClientTriggerDefinition" }),
    build({ folder: "triggers", specialFile: "server.ts", genericType: "MergedServerTriggerDefinition" }),
    build({ folder: "services", specialFile: "client.tsx", genericType: "MergedClientServiceDefinition" }),
    build({ folder: "services", specialFile: "server.ts", genericType: "MergedServerServiceDefinition" }),
    build({ folder: "data-types", specialFile: "client.tsx", genericType: "MergedClientDataTypeDefinition" }),
])


async function build({
    folder,
    specialFile,
    idPrefix = folder,
    genericType,
}) {
    const filePaths = await glob(`*/${folder}/*/${specialFile}`)
    const specialFileBaseName = specialFile.split(".")[0]

    let barrelContents = filePaths.reduce((result, filePath) => {
        const importName = importNameFromPath(filePath)
        const importLine = `import ${importName} from "${importPathFromPath(filePath)}"`
        result = splice(result, "// IMPORTS", importLine)

        const segments = filePath.split("/")
        const id = `https://${idPrefix}.workflow.dog/${segments[0]}/${segments[2]}`
        const exportLine = `    "${id}": _.merge({ id: "${id}" }, ${importName}),`
        result = splice(result, "// EXPORTS", exportLine)

        return result
    }, originalTemplate)

    barrelContents = splice(barrelContents, "// IMPORTS", `import type { ${genericType} } from "@pkg/types"`)
        .replace("/* GENERIC TYPE */", genericType)

    console.log(`[${folder}/${specialFileBaseName}]`, filePaths.length, "items")

    await fs.writeFile(`_build/barrels/${idPrefix}_${specialFileBaseName}.ts`, barrelContents)
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

function splice(str, searchTerm, content) {
    const index = str.indexOf(searchTerm) + searchTerm.length
    return str.slice(0, index) + "\n" + content + str.slice(index)
}