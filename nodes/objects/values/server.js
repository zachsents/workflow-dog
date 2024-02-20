// objects/values/server.js
export default {
    action: ({ object }) => {
        return { values: Object.values(object) }
    },
}