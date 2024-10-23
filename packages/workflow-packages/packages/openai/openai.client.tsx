import { IconBrandOpenai } from "@tabler/icons-react"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import ThirdPartyAccountSelector from "../../components/third-party-account-selector"
import { $id } from "../../lib/utils"
import { createPackage } from "../../registry/registry.client"
import { useValueType } from "../../lib/value-types.client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "web/src/components/ui/select"



const helper = createPackage("openai", {
    defaults: {
        node: {
            icon: IconBrandOpenai,
            color: "gray.900",
        }
    }
})

helper.thirdPartyProvider(null, {
    name: "OpenAI",
    description: "Connect your OpenAI account to WorkflowDog.",
    icon: IconBrandOpenai,
    color: "gray.900",
    keywords: ["openai", "ai", "chatgpt"],
    authType: "api_key",
})

helper.node("chatgpt", {
    name: "Ask ChatGPT",
    description: "Send a prompt to ChatGPT and receive a response.",
    component: () => <StandardNode>
        <StandardNode.Handle type="input" name="prompt" valueType={useValueType("string")} />
        <StandardNode.Handle
            type="input" name="historyIn" displayName="History"
            valueType={useValueType("array", [useValueType("object")])} optional
        />
        <StandardNode.Handle type="output" name="response" valueType={useValueType("string")} />
        <StandardNode.Handle
            type="output" name="historyOut" displayName="History"
            valueType={useValueType("array", [useValueType("object")])}
        />
    </StandardNode>,
    configComponent: () => <>
        <StandardNode.Config id="account" label="OpenAI Account" required>
            {({ value, onChange }) => <ThirdPartyAccountSelector
                value={value}
                onChange={onChange}
                providerId={$id.thirdPartyProvider("openai")}
            />}
        </StandardNode.Config>
        <StandardNode.Config id="model" label="Model" defaultValue="gpt-4o">
            {({ value, onChange }) =>
                <Select value={value || ""} onValueChange={onChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pick a model" />
                    </SelectTrigger>
                    <SelectContent className="z-[101]">
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                </Select>}
        </StandardNode.Config>
    </>
})
