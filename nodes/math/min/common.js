// math/min/common.js
export default {
    name: "Min",
    description: "Finds the minimum value from a group of numbers.",
    inputs: {
        numbers: {
            name: "Number",
            type: "data-type:basic.number",
            group: true,
        },
    },
    outputs: {
        min: {
            name: "Minimum",
            type: "data-type:basic.number",
        },
    },
}
