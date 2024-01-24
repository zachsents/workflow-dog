import * as common from "./_private/common-barrel.js"
import * as server from "./_private/server-barrel.js"
import { createAccessors } from "@zachsents/barrelboy"

const { list, object, resolveId, resolve } = createAccessors({
    barrels: [
        common,
        server,
    ],
    typePrefix: "integration",
})

export { list, object, resolveId, resolve }