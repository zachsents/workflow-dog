// objects/merge/common.js
export default {
    name: "Merge Objects",
    description: "Merges multiple objects together. Keys from the last object will overwrite keys from the previous objects.",
    inputs: {
        objects: {
            name: "Object",
            type: "data-type:basic.object",
            group: true,
        },
    },
    outputs: {
        mergedObject: {
            name: "Merged Object",
            type: "data-type:basic.object",
        },
    },
};