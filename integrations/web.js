import * as common from "./_private/common-barrel.js"
import * as web from "./_private/web-barrel.js"
import { createAccessors } from "@zachsents/barrelboy"

const { list, object, resolveId, resolve } = createAccessors({
    barrels: [
        common,
        web,
    ],
    typePrefix: "integration",
})

export { list, object, resolveId, resolve }