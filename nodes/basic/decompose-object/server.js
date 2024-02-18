export default {
    action: ({ object }, { node }) => {
        if (!object)
            throw new Error("Didn't receive an object")

        const keys = [...new Set(node.data.outputs.map(output => output.name))]
        return {
            properties: Object.fromEntries(keys.map(key => [key, object[key]]))
        }
    },
}