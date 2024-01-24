import { createConfig } from "@zachsents/barrelboy"
import { PREFIX } from "shared/prefixes.js"


const commonTemplate = `export default {
    name: "",
    compatibleWith: [],
}`


export default createConfig({
    commonBarrelSettings: {
        outputDirectory: "_private",
        exclude: ["_private/**"],
    },
    barrels: [
        {
            name: "common",
            template: commonTemplate,
        },
    ],
    accessors: [
        {
            name: "common",
            barrels: ["common"],
            typePrefix: PREFIX.DATA_TYPE,
        },
    ],
    openAfterCreate: "common",
})