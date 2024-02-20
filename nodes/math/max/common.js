// math/max/common.js
export default {
    name: "Max",
    description: "Finds the maximum value from a group of numbers.",
    inputs: {
        numbers: {
            name: "Number",
            type: "data-type:basic.number",
            group: true,
        },
    },
    outputs: {
        max: {
            name: "Maximum",
            type: "data-type:basic.number",
        },
    },
}
