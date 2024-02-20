// objects/add-property/common.js
export default {
    name: "Object: Add Property",
    description: "Adds a new property to an object.",
    inputs: {
        object: {
            name: "Object",
            type: "data-type:basic.object",
        },
        key: {
            name: "Key",
            type: "data-type:basic.string",
        },
        value: {
            name: "Value",
            type: null,
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "data-type:basic.object",
        },
    },
}