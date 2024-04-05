import { $ } from "bun"
import packageInfo from "./package.json"
// @ts-ignore
import { parseArgs } from "util"

const { values: options } = parseArgs({
    args: Bun.argv,
    options: {
        external: {
            type: "boolean",
        },
    },
    strict: true,
    allowPositionals: true,
})

await Promise.all([
    Bun.build({
        entrypoints: ["./src/index.ts"],
        outdir: "./build",
        target: "node",
        ...options.external && {
            external: Object.keys(packageInfo.dependencies)
                .filter(dep => {
                    const version = packageInfo.dependencies[dep]
                    return !version.startsWith("workspace:")
                })
        },
    }),
    $`cp ./.env build/.env`,
    $`cp ./service-account.json ./build/service-account.json`,
    Bun.write("./build/package.json", `{"type":"module"}`),
])