// math/square-root/server.js
export default {
    action: ({ number }) => {
        const sqrt = Math.sqrt(number)
        return { sqrt }
    },
}
