// math/exponent/server.js
export default {
    action: ({ base, exponent }) => {
        const result = Math.pow(base, exponent)
        return { result }
    },
}
