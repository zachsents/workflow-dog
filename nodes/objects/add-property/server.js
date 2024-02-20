// objects/add-property/server.js
export default {
    action: ({ object, key, value }) => {
        const clonedObject = structuredClone(object)
        clonedObject[key] = value
        return { result: clonedObject }
    },
}