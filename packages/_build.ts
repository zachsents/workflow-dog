import { Glob } from "bun"
import _ from "lodash"
import path from "path"


await barrelEverything()


/* -------------------------------------------------------------------------- */
/*                            Barreling everything                            */
/* -------------------------------------------------------------------------- */

async function barrelEverything() {
    await Promise.all([
        createBarrel({
            itemType: "nodes",
            variant: "web",
        }),
        createBarrel({
            itemType: "nodes",
            variant: "server",
        }),
        createBarrel({
            itemType: "triggers",
            variant: "web",
        }),
        createBarrel({
            itemType: "triggers",
            variant: "server",
        }),
        createBarrel({
            itemType: "services",
            variant: "web",
        }),
        createBarrel({
            itemType: "services",
            variant: "server",
        }),
        createBarrel({
            itemType: "data-types",
            variant: "web",
        }),
        createBarrel({
            itemType: "data-types",
            variant: "server",
        }),
    ])
}

async function createBarrel({
    itemType,
    variant,
}: {
    itemType: string
    variant: string
}) {
    const sharedFiles = await Array.fromAsync(new Glob(`*/${itemType}/*/shared.ts`).scan("."))

    const hasDefaults = await Bun.file(`_default-${variant}-${itemType}.ts`).exists()
    const defaultImportName = _.camelCase(`default_${variant}_${itemType}`)
    const defaultImportLine = hasDefaults
        ? `import ${defaultImportName} from "./_default-${variant}-${itemType}"`
        : ""

    const lines = await Promise.all(sharedFiles.map(async sharedFile => {
        const [, packageName, itemName] = sharedFile.match(new RegExp(`(?:\\.\\/)?([^\\/]+)\\/${itemType}\\/([^\\/]+)`, ""))

        const id = `https://${itemType}.workflow.dog/${packageName}/${itemName}`

        const sharedImportName = _.camelCase(`shared_${itemType}_${packageName}_${itemName}`)
        const variantImportName = _.camelCase(`${variant}_${itemType}_${packageName}_${itemName}`)

        const importLine = `
import ${sharedImportName} from "./${path.join(sharedFile, "../shared")}"
import ${variantImportName} from "./${path.join(sharedFile, `../${variant}`)}"`.trim()

        const exportLine = `    "${id}": _.merge({}${hasDefaults ? `, ${defaultImportName}` : ""}, ${sharedImportName}, ${variantImportName}, { id: "${id}" }),`

        return { importLine, exportLine }
    }))

    await Bun.write(`_barrel-${variant}-${itemType}.ts`, `
import _ from "lodash"
${defaultImportLine}
${_.map(lines, "importLine").join("\n")}

export const ${_.camelCase(`${variant}_${itemType}`)} = {
${_.map(lines, "exportLine").join("\n")}
}
`.trim())
}

