// math/multiply/server.js
export default {
    action: ({ factors }) => {
        const product = factors.reduce((acc, current) => acc * current, 1)
        return { product }
    },
}
