// objects/keys/server.js
export default {
    action: ({ object }) => {
        return { keys: Object.keys(object) }
    },
}