
export default {
    name: "Parse JSON",
    description: "Parses JSON text into a data object.",
    inputs: {
        text: {
            name: "Text",
            type: "data-type:basic.string",
        },
    },
    outputs: {
        object: {
            name: "Object",
            type: "data-type:basic.string",
        },
    },
}