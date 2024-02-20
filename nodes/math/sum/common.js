// math/sum/common.js
export default {
    name: "Sum",
    description: "Sums all elements of an array.",
    inputs: {
        array: {
            name: "List",
            type: "data-type:basic.array",
        },
    },
    outputs: {
        sum: {
            name: "Sum",
            type: "data-type:basic.number",
        },
    },
}
