import { clientNode } from "@pkg/helpers/client"
import { TbAmpersand } from "react-icons/tb"
import shared from "./and.shared"
import "@pkg/types/shared"
import "@pkg/types/client"

export default clientNode(shared, {
    icon: TbAmpersand,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
    inputs: {
        inputs: {
            singular: "Input",
        }
    }
})