// math/greater-than/server.js
export default {
    action: ({ a, b }, { node }) => {
        return {
            result: node.data.state?.orEqual ? a >= b : a > b
        }
    },
}
