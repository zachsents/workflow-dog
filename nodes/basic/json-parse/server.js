export default {
    action: ({ text }) => {
        try {
            return {
                object: JSON.parse(text)
            }
        }
        catch(err){
            console.debug(err)
            throw new Error("Invalid JSON text.")
        }
    },
}