// math/add/server.js
export default {
    action: ({ addends }) => {
        const sum = addends.reduce((acc, current) => acc + current, 0)
        return { sum }
    },
}
