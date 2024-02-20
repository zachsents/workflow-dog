// math/greater-than/common.js
export default {
    name: "Greater Than",
    description: "Checks if the first input is greater than the second input.",
    inputs: {
        a: {
            name: "A",
            type: "data-type:basic.number",
        },
        b: {
            name: "B",
            type: "data-type:basic.number",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "data-type:basic.boolean",
        },
    },
}
