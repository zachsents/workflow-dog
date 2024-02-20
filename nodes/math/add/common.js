// math/add/common.js
export default {
    name: "Add",
    description: "Adds a variable number of inputs.",
    inputs: {
        addends: {
            name: "Input",
            type: "data-type:basic.number",
            group: true,
        },
    },
    outputs: {
        sum: {
            name: "Sum",
            type: "data-type:basic.number",
        },
    },
}
