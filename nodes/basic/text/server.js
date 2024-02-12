
export default {
    action: (_, { node }) => ({ text: node.data.state.value }),
}
