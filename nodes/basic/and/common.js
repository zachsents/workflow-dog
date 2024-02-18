
export default {
    name: "And",
    description: "Logical AND operator",
    inputs: {
        inputs: {
            name: "Input",
            type: "data-type:basic.boolean",
            group: true,
            named: false,
        }
    },
    outputs: {
        result: {
            name: "Result",
            type: "data-type:basic.boolean",
        },
    }
}