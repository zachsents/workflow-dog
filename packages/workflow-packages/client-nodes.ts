
import mathNodes from "./packages/math/math-client-nodes"
import primitivesNodes from "./packages/primitives/primitives-client-nodes"
import textNodes from "./packages/text/text-client-nodes"
import controlNodes from "./packages/control/control-client-nodes"

export default {
    ...primitivesNodes,
    ...textNodes,
    ...mathNodes,
    ...controlNodes,
}