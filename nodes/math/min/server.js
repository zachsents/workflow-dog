// math/min/server.js
export default {
    action: ({ numbers }) => {
        const min = Math.min(...numbers)
        return { min }
    },
}
