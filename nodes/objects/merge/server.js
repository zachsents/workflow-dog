// objects/merge/server.js
import merge from "lodash.merge"

export default {
    action: ({ objects }, { node }) => {
        return {
            mergedObject: node.data.state?.deep ?
                merge({}, ...objects) :
                Object.assign({}, ...objects)
        }
    },
}