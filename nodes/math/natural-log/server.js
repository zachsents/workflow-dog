// math/natural-log/server.js
export default {
    action: ({ number }) => {
        return { result: Math.log(number) }
    },
}
