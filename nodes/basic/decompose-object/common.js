
export default {
    name: "Unpack Object",
    description: "Decomposes an object into its properties.",
    inputs: {
        object: {
            name: "Object",
            type: "data-type:basic.object",
        },
    },
    outputs: {
        properties: {
            name: "Properties",
            type: null,
            group: true,
            named: true,
        },
    },
}