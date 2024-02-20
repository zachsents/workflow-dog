// objects/keys/common.js
export default {
    name: "Object: List Keys",
    description: "Lists all the keys of an object.",
    inputs: {
        object: {
            name: "Object",
            type: "data-type:basic.object",
        },
    },
    outputs: {
        keys: {
            name: "Keys",
            type: "data-type:basic.array",
        },
    },
}