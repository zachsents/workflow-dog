// math/ceiling/common.js
export default {
    name: "Ceiling",
    description: "Rounds a number up to the nearest integer.",
    inputs: {
        number: {
            name: "Number",
            type: "data-type:basic.number",
        },
    },
    outputs: {
        ceiled: {
            name: "Ceiled Number",
            type: "data-type:basic.number",
        },
    },
}
