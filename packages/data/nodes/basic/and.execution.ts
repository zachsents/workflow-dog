import { executionNode } from "@pkg/helpers/execution"
import "@pkg/types/execution"
import shared from "./and.shared"

export default executionNode(shared, {
    action({ inputs }) {
        return {
            result: inputs.every(Boolean),
        }
    }
})