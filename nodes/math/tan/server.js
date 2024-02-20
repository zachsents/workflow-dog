// math/tan/server.js
export default {
    action: ({ angle }, { node }) => {
        const convertedAngle = node.data.state?.angleMode === "degrees" ?
            angle * (Math.PI / 180) :
            angle

        return { tangent: Math.tan(convertedAngle) }
    },
}
