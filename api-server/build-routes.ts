import { Glob } from "bun"
import path from "path"

console.time("Build routes")

const ROUTES_DIR = "./routes"

const glob = new Glob("**/*.ts")

const imports = []
const routes = []

for await (const file of glob.scan(ROUTES_DIR)) {
    if (path.basename(file).startsWith("_"))
        continue

    const modulePath = fileNameToModulePath(file)
    const route = fileNameToRoute(file)
    const module = await import(modulePath)

    Object.entries(module).forEach(([method, handler]) => {
        if (typeof handler !== "function")
            return

        const importName = `${route.replaceAll(/\W/g, "_")}_${method}`

        imports.push(`import { ${method} as ${importName} } from "${modulePath}"`)
        routes.push(`app.${method}("${route}", ${importName})`)
    })
}

const fileContent = `
import type { Express } from "express"
${imports.join("\n")}

export function setupRoutes(app: Express) {
    ${routes.join("\n\t")}
}`

await Bun.write("./setup-routes.ts", fileContent)
console.timeEnd("Build routes")


function fileNameToModulePath(fileName: string) {
    return `./${path.join(ROUTES_DIR, fileName)
        .replaceAll(/\\/g, "/")}`
        .replace(/\.(?:ts)$/, ".js")
}

function fileNameToRoute(fileName: string) {
    return `/${fileName
        .replaceAll(/\\/g, "/")
        .replace(/\.(?:ts|js)$/, "")
        .replace(/\/index$/, "")}`
}
