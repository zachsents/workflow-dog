
export default {
    action: ({ inputs }) => ({
        result: inputs.every(Boolean),
    }),
}
