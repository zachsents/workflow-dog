// math/floor/server.js
export default {
    action: ({ number }) => {
        const floored = Math.floor(number)
        return { floored }
    },
}
