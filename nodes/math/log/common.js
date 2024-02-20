// math/log/common.js
export default {
    name: "Logarithm",
    description: "Calculates the logarithm of a number to a specified base.",
    inputs: {
        number: {
            name: "Number",
            type: "data-type:basic.number",
        },
        base: {
            name: "Base",
            type: "data-type:basic.number",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "data-type:basic.number",
        },
    },
}
