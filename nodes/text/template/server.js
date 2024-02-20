// text/template/server.js
export default {
    action: ({ template, substitution }) => {

        if (!template)
            throw new Error("Missing template")

        if (!substitution)
            throw new Error("Missing substitutions")

        const subbedTemplate = Object.entries(substitution).reduce((acc, [subKey, subValue]) => {
            return acc.replaceAll(`{${subKey}}`, subValue)
        }, template)

        return { text: subbedTemplate }
    },
}