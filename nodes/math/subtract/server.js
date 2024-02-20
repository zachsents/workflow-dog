// math/subtract/server.js
export default {
    action: ({ minuend, subtrahend }) => {
        const difference = minuend - subtrahend
        return { difference }
    },
}
