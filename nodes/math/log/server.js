// math/log/server.js
export default {
    action: ({ number, base }) => {
        const result = Math.log(number) / Math.log(base)
        return { result }
    },
}
