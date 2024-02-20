// math/cos/server.js
export default {
    action: ({ angle }, { node }) => {
        const convertedAngle = node.data.state?.angleMode === "degrees" ?
            angle * (Math.PI / 180) :
            angle

        return { cosine: Math.cos(convertedAngle) }
    },
}
