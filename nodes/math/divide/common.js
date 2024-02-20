// math/divide/common.js
export default {
    name: "Divide",
    description: "Divides the first input by the second input.",
    inputs: {
        dividend: {
            name: "Dividend",
            type: "data-type:basic.number",
        },
        divisor: {
            name: "Divisor",
            type: "data-type:basic.number",
        },
    },
    outputs: {
        quotient: {
            name: "Quotient",
            type: "data-type:basic.number",
        },
        remainder: {
            name: "Remainder",
            type: "data-type:basic.number",
        },
    },
}
