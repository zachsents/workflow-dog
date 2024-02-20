// math/multiply/common.js
export default {
    name: "Multiply",
    description: "Multiplies a variable number of inputs.",
    inputs: {
        factors: {
            name: "Input",
            type: "data-type:basic.number",
            group: true,
        },
    },
    outputs: {
        product: {
            name: "Product",
            type: "data-type:basic.number",
        },
    },
}
