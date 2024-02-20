
export default {
    action: (_, { node }) => ({ enabled: node.data?.state?.value ?? false }),
}
