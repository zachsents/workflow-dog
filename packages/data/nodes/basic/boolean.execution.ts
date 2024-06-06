import { executionNode } from "@pkg/helpers/execution"
import "@pkg/types/execution"
import shared from "./boolean.shared"

export default executionNode(shared, {
    action(_, { node }) {
        return {
            value: node.data.state?.value ?? false,
        }
    }
})