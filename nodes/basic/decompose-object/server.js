export default {
    action: ({ object }, {node}) => {
        const keys = [...new Set(node.data.outputs.map(output => output.name))]
        return {
            properties: Object.fromEntries(keys.map(key => [key, object[key]]))
        }
    },
}