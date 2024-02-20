// math/round/common.js
export default {
    name: "Round",
    description: "Rounds a number to the nearest integer.",
    inputs: {
        number: {
            name: "Number",
            type: "data-type:basic.number",
        },
    },
    outputs: {
        rounded: {
            name: "Rounded Number",
            type: "data-type:basic.number",
        },
    },
}
