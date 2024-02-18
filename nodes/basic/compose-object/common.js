
export default {
    name: "Compose Object",
    description: "Decomposes an object into its properties.",
    inputs: {
        properties: {
            name: "Properties",
            type: null,
            group: true,
            named: true,
        },
    },
    outputs: {
        object: {
            name: "Object",
            type: "data-type:basic.object",
        },
    },
}