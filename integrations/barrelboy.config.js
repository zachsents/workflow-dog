import { createConfig } from "@zachsents/barrelboy"
import { PREFIX } from "shared/prefixes.js"


const commonTemplate = `export default {
    name: "",
    authType: "oauth2",
}`

const webTemplate = `import {  } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: null,
    color: colors.gray[800],
}`

const serverTemplate = `export default {
    
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
        {
            name: "web",
            extension: "jsx",
            template: webTemplate,
        },
        {
            name: "server",
            template: serverTemplate,
        },
    ],
    accessors: [
        {
            name: "web",
            barrels: ["common", "web"],
            typePrefix: PREFIX.INTEGRATION,
        },
        {
            name: "server",
            barrels: ["common", "server"],
            typePrefix: PREFIX.INTEGRATION,
        },
    ],
    openAfterCreate: "common",
})