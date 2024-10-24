import { IconBraces, IconExternalLink, IconLink, IconSpeakerphone, IconWebhook } from "@tabler/icons-react"
import CopyButton from "web/src/components/copy-button"
import TI from "web/src/components/tabler-icon"
import { DropdownMenuItem } from "web/src/components/ui/dropdown-menu"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useValueType } from "../../lib/value-types.client"
import { createPackage } from "../../registry/registry.client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "web/src/components/ui/select"
import { Button } from "web/src/components/ui/button"


const helper = createPackage("http")


// #region Nodes

helper.node("respond", {
    name: "Respond",
    description: "Responds to the HTTP request.",
    icon: IconSpeakerphone,
    component: () => {
        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle
                    type="input" name="status" valueType={useValueType("number")}
                    optional
                />
                <StandardNode.Handle
                    type="input" name="body" valueType={useValueType("string")}
                />
            </StandardNode>
        )
    },
    configComponent: () => <>
        <StandardNode.Config<ContentType> id="contentType" label="Content Type" defaultValue="text/plain">
            {({ value, onChange }) =>
                <Select value={value!} onValueChange={onChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pick a content type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text/plain">
                            Plain Text
                        </SelectItem>
                        <SelectItem value="text/html">
                            HTML
                        </SelectItem>
                        <SelectItem value="application/json">
                            JSON
                        </SelectItem>
                    </SelectContent>
                </Select>}
        </StandardNode.Config>
    </>,
    whitelistedTriggers: ["eventType:http/request", "eventType:http/webhook"],
})

type ContentType = "text/plain" | "text/html" | "application/json"


helper.node("respondJson", {
    name: "Respond JSON",
    description: "Responds to the HTTP request with JSON.",
    icon: IconBraces,
    component: () => {
        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle
                    type="input" name="status" valueType={useValueType("number")}
                    optional
                />
                <StandardNode.Handle type="input" name="body" />
            </StandardNode>
        )
    },
    whitelistedTriggers: ["eventType:http/request", "eventType:http/webhook"],
})

helper.node("redirect", {
    name: "Redirect",
    description: "Redirects to a URL.",
    icon: IconLink,
    component: () => {
        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle
                    type="input" name="status" valueType={useValueType("number")}
                    optional
                />
                <StandardNode.Handle
                    type="input" name="url" valueType={useValueType("string")}
                />
            </StandardNode>
        )
    },
    whitelistedTriggers: ["eventType:http/request"],
})


// #region Triggers

helper.eventType("request", {
    name: "HTTP Request",
    whenName: "When a HTTP request is received",
    icon: IconLink,
    color: "gray.800",
    description: "Triggers when a HTTP request is received. You can specify a custom URL path, which can be shared between multiple workflows. Accepts common HTTP methods e.g. GET, POST, PUT, PATCH, DELETE, etc.",
    keywords: ["http", "request", "url", "path", "method"],
    workflowInputs: {
        path: {
            displayName: "Path",
            description: "The path on the URL that was called.",
            valueType: useValueType("string"),
        },
        method: {
            displayName: "Method",
            description: "The HTTP method that was called.",
            valueType: useValueType("string"),
        },
        body: {
            displayName: "Body",
            description: "The body of the request as a base64 encoded string.",
            valueType: useValueType("string"),
        },
        headers: {
            displayName: "Headers",
            description: "The headers of the request.",
            valueType: useValueType("object"),
        },
        query: {
            displayName: "Query Parameters",
            description: "The query parameters of the request.",
            valueType: useValueType("object"),
        },
    },
    workflowOutputs: {
        body: {
            displayName: "Body",
            description: "The body of the response.",
            valueType: useValueType("string"),
        },
        status: {
            displayName: "Status Code",
            description: "The status code of the response. Defaults to 200 (OK).",
            valueType: useValueType("number"),
        },
    },
    sourceComponent: ({ workflowId }) => {
        const url = `${location.origin}/run/x/request_${workflowId}`

        return (
            <div className="grid gap-4">
                <p className="text-sm">
                    This is a unique URL that triggers this workflow. Copy it and use it for any HTTP request.
                </p>
                <pre className="break-all whitespace-normal text-xs p-2 bg-gray-100 rounded-md">
                    {url}
                </pre>
                <div className="grid grid-cols-2 gap-4">
                    <CopyButton content={url} copyText="Copy URL" />
                    <Button className="gap-2" asChild>
                        <a href={url} target="_blank">
                            Go to URL
                            <TI><IconExternalLink /></TI>
                        </a>
                    </Button>
                </div>
            </div>
        )
    },
    additionalDropdownItems: ({ workflowId }) => (
        <DropdownMenuItem onClick={() => {
            const url = `${location.origin}/run/x/request_${workflowId}`
            navigator.clipboard.writeText(url)
        }}>
            <TI><IconLink /></TI>
            Copy webhook URL
        </DropdownMenuItem>
    ),
})

helper.eventType("webhook", {
    name: "Webhook",
    whenName: "When a webhook is received",
    icon: IconWebhook,
    color: "gray.800",
    description: "Triggers when a webhook is received. You'll be provided with a URL that you can use with any external service. Only accepts HTTP POST requests.",
    keywords: ["webhook", "http", "external", "service", "url"],
    workflowInputs: {
        data: {
            displayName: "Data",
            description: "The JSON data passed from the webhook.",
            valueType: useValueType("any"),
        },
        params: {
            displayName: "Parameters",
            description: "The parameters parsed from the webhook URL.",
            valueType: useValueType("object"),
        },
    },
    sourceComponent: ({ workflowId }) => {
        const url = `${location.origin}/run/x/webhook_${workflowId}`

        return (
            <div className="grid gap-4">
                <p className="text-sm">
                    This is a unique URL that triggers this workflow. Copy it and paste it into any service that accepts webhooks.
                </p>
                <pre className="break-all whitespace-normal text-xs p-2 bg-gray-100 rounded-md">
                    {url}
                </pre>
                <CopyButton content={url} copyText="Copy URL" />
            </div>
        )
    },
    additionalDropdownItems: ({ workflowId }) => (
        <DropdownMenuItem onClick={() => {
            const url = `${location.origin}/run/x/webhook_${workflowId}`
            navigator.clipboard.writeText(url)
        }}>
            <TI><IconLink /></TI>
            Copy webhook URL
        </DropdownMenuItem>
    ),
})