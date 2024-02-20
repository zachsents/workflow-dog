// math/ceiling/server.js
export default {
    action: ({ number }) => {
        const ceiled = Math.ceil(number)
        return { ceiled }
    },
}
