// math/floor/common.js
export default {
    name: "Floor",
    description: "Rounds a number down to the nearest integer.",
    inputs: {
        number: {
            name: "Number",
            type: "data-type:basic.number",
        },
    },
    outputs: {
        floored: {
            name: "Floored Number",
            type: "data-type:basic.number",
        },
    },
}
