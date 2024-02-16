
export default {
    name: "Covner to JSON Text",
    description: "Converts a data object into JSON text.",
    inputs: {
        object: {
            name: "Object",
            type: "data-type:basic.object",
        },
    },
    outputs: {
        text: {
            name: "Text",
            type: "data-type:basic.string",
        },
    },
}