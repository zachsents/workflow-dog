import { client } from "@api/db.js"
import { checkForErrorThenJson } from "@api/util.js"
import { Request, Response } from "express"


export async function all(req: Request, res: Response) {

    const { data: { triggerType, triggerConfig } } = await client
        .from("workflows")
        .select("triggerType: trigger->type, triggerConfig: trigger->config")
        .eq("id", req.params.workflowId)
        .single()
        .throwOnError()

    if (triggerType !== "trigger:basic.request") {
        res.status(400).send("Invalid trigger type")
        return
    }

    const url = new URL(`${process.env.API_SERVER_URL}/workflows/${req.params.workflowId}/run`)

    const waitUntilFinished: boolean = (triggerConfig as any)?.waitUntilFinished
    if (waitUntilFinished) {
        url.searchParams.set("subscribe", "true")
    }

    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            triggerData: {
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: (req as any).rawBody,
                params: req.query,
            },
        })
    }).then(checkForErrorThenJson)

    if (!waitUntilFinished) {
        res.sendStatus(204)
        return
    }

    const { status, headers, body } = response.state?.workflowOutputs ?? {}

    Object.entries(headers ?? {}).forEach(([key, value]) => {
        res.setHeader(key, value as string)
    })

    res.status(status ?? 200).send(body ?? "")
}