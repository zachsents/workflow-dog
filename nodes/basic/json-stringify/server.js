export default {
    action: ({ object }) => {
        return {
            text: JSON.stringify(object, null, 4)
        }
    },
}