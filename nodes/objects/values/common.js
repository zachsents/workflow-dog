// objects/values/common.js
export default {
    name: "Object: List Values",
    description: "Lists all the values of an object.",
    inputs: {
        object: {
            name: "Object",
            type: "data-type:basic.object",
        },
    },
    outputs: {
        values: {
            name: "Values",
            type: "data-type:basic.array",
        },
    },
}