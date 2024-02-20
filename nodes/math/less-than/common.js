// math/less-than/common.js
export default {
    name: "Less Than",
    description: "Checks if the first input is less than the second input.",
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
