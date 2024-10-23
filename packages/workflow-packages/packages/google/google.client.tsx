import { IconBrandGmail, IconBrandGoogleFilled } from "@tabler/icons-react"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import ThirdPartyAccountSelector from "../../components/third-party-account-selector"
import { $id } from "../../lib/utils"
import { createPackage } from "../../registry/registry.client"
import { useValueType } from "../../lib/value-types.client"



const helper = createPackage("google", {
    defaults: {
        node: {
            icon: IconBrandGoogleFilled,
            color: "blue",
        }
    }
})

helper.thirdPartyProvider(null, {
    name: "Google",
    description: "Connect your Google account to WorkflowDog.",
    icon: IconBrandGoogleFilled,
    color: "blue",
    keywords: ["google", "gmail", "sheets", "drive"],
    authType: "oauth2",
    transformScopeForDisplay(scope) {
        return scope.replace(/https:\/\/www.googleapis.com\/auth\//, "")
    },
})

helper.node("test", {
    name: "Test Google",
    description: "Test Google connection.",
    component: () => <StandardNode>
        <StandardNode.Config id="account" label="Google Account" required>
            {({ value, onChange }) => <ThirdPartyAccountSelector
                value={value}
                onChange={onChange}
                providerId={$id.thirdPartyProvider("google")}
            />}
        </StandardNode.Config>
    </StandardNode>,
})

helper.node("gmail_sendEmail", {
    name: "Send Email",
    description: "Sends an email from your Google account.",
    icon: IconBrandGmail,
    color: "red",
    component: () => <StandardNode>
        <StandardNode.MultiHandle
            name="to" displayName="To" type="input"
            defaultAmount={1}
            min={1}
            itemDisplayName="Recipient"
            itemValueType={useValueType("string")}
        />
        <StandardNode.MultiHandle
            name="cc" displayName="CC" type="input"
            itemDisplayName="CC"
            itemValueType={useValueType("string")}
        />
        <StandardNode.Handle type="input" name="subject" valueType={useValueType("string")} />
        <StandardNode.Handle type="input" name="body" valueType={useValueType("string")} />
    </StandardNode>,
    configComponent: () => <>
        <StandardNode.Config id="account" label="Google Account" required>
            {({ value, onChange }) => <ThirdPartyAccountSelector
                value={value}
                onChange={onChange}
                providerId={$id.thirdPartyProvider("google")}
                requestScopes={["https://www.googleapis.com/auth/gmail.send"]}
                requiredScopes={[[
                    "https://mail.google.com/",
                    "https://www.googleapis.com/auth/gmail.modify",
                    "https://www.googleapis.com/auth/gmail.compose",
                    "https://www.googleapis.com/auth/gmail.send",
                ]]}
            />}
        </StandardNode.Config>
    </>,
})