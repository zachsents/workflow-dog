// math/subtract/common.js
export default {
    name: "Subtract",
    description: "Subtracts the second input from the first.",
    inputs: {
        minuend: {
            name: "a",
            type: "data-type:basic.number",
            description: "The number from which another number is to be subtracted.",
        },
        subtrahend: {
            name: "b",
            type: "data-type:basic.number",
            description: "The number that is to be subtracted from the other number.",
        },
    },
    outputs: {
        difference: {
            name: "Difference",
            type: "data-type:basic.number",
            description: "The result of the subtraction.",
        },
    },
}
