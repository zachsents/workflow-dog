import type { WebServiceDefinition } from "@types"
import OpenAIIcon from "../../openai.svg"
import type shared from "./shared"

export default {
    icon: OpenAIIcon,
    color: "#000000",
    generateKeyUrl: "https://platform.openai.com/api-keys",
} satisfies WebServiceDefinition<typeof shared>