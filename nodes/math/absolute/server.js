// math/absolute/server.js
export default {
    action: ({ number }) => {
        const absolute = Math.abs(number)
        return { absolute }
    },
}
