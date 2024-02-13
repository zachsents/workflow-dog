export default {
    action: (_, { node, triggerData }) => {
        return { value: triggerData[node.data.state.input] }
    },
}