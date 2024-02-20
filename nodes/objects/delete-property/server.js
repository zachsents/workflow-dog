// objects/delete-property/server.js
export default {
    action: ({ object, key }) => {
        const clonedObject = structuredClone(object)
        delete clonedObject[key]
        return { result: clonedObject }
    },
}