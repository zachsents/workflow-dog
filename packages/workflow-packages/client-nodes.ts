
import mathNodes from "./packages/math/math-client-nodes"
import primitivesNodes from "./packages/primitives/primitives-client-nodes"
import textNodes from "./packages/text/text-client-nodes"

export default {
    ...primitivesNodes,
    ...textNodes,
    ...mathNodes,
}