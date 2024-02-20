// basic/nodes/text/server.js
export default {
    action: (_, { node }) => ({ text: node.data?.state?.value ?? "" }),
}
