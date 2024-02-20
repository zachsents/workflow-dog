// math/exponent/common.js
export default {
    name: "Exponent",
    description: "Raises a number to the power of an exponent.",
    inputs: {
        base: {
            name: "Base",
            type: "data-type:basic.number",
        },
        exponent: {
            name: "Exponent",
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
