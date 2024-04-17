import { $, type BuildConfig } from "bun"
import packageInfo from "./package.json"
// @ts-ignore
import { parseArgs } from "util"

const { values: options }: {
    values: {
        external: boolean
        dev: boolean
    }
} = parseArgs({
    args: Bun.argv,
    options: {
        external: {
            type: "boolean",
        },
        dev: {
            type: "boolean",
        },
    },
    strict: true,
    allowPositionals: true,
})

const buildOptions: BuildConfig = {
    entrypoints: ["./src/index.ts"],
    outdir: "./build",
    target: "node",
}

if (options.external)
    buildOptions.external = Object.keys(packageInfo.dependencies).filter(dep => {
        const version = packageInfo.dependencies[dep]
        return !version.startsWith("workspace:")
    })

await $`rm -rf build`

const tasks = [
    Bun.build(buildOptions),
    $`cp ./.env build/.env`,
    $`cp ./service-account.json ./build/service-account.json`,
    Bun.write("./build/package.json", `{"type":"module"}`),
]

if (options.dev)
    tasks.push($`cp ./.env.development build/.env.development`)

await Promise.all(tasks)