// math/round/server.js
export default {
    action: ({ number }) => {
        const rounded = Math.round(number)
        return { rounded }
    },
}
