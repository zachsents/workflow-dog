// objects/delete-property/common.js
export default {
    name: "Object: Delete Property",
    description: "Deletes a property from an object.",
    inputs: {
        object: {
            name: "Object",
            type: "data-type:basic.object",
        },
        key: {
            name: "Key",
            type: "data-type:basic.string",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "data-type:basic.object",
        },
    },
}