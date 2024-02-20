// math/max/server.js
export default {
    action: ({ numbers }) => {
        const max = Math.max(...numbers)
        return { max }
    },
}
