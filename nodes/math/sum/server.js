// math/sum/server.js
export default {
    action: ({ array }) => {
        const sum = array.reduce((acc, current) => acc + current, 0)
        return { sum }
    },
}
