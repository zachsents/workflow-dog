import { createClientServiceDefinition } from "@pkg/types"
import OpenAIIcon from "../../openai.svg"
import shared from "./shared"

export default createClientServiceDefinition(shared, {
    icon: OpenAIIcon,
    color: "#000000",
    generateKeyUrl: "https://platform.openai.com/api-keys",
})