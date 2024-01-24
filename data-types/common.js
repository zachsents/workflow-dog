import * as common from "./_private/common-barrel.js"
import { createAccessors } from "@zachsents/barrelboy"

const { list, object, resolveId, resolve } = createAccessors({
    barrels: [
        common,
    ],
    typePrefix: "data-type",
})

export { list, object, resolveId, resolve }