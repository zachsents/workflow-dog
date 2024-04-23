import type { z } from "zod"
import type { customLeadFieldSchema, leadSchema } from "./schemas"
import axios, { type AxiosInstance } from "axios"
import _ from "lodash"


export function getClient(key: string) {
    return axios.create({
        baseURL: "https://api.close.com/api/v1",
        auth: {
            username: key,
            password: "",
        },
    })
}


export async function expandLeads(client: AxiosInstance, leads: z.infer<typeof leadSchema>[]) {
    const customFieldKeys = leads.reduce((acc, lead) => {
        Object.keys(lead).forEach(key => {
            if (key.startsWith("custom."))
                acc.add(key)
        })
        return acc
    }, new Set<string>())

    const customFieldNameMap = Object.fromEntries(
        await Promise.all(
            Array.from(customFieldKeys)
                .map(async key => {
                    const fieldInfo = await getCustomLeadField(client, key)
                        .catch(err => {
                            if (err.response.status === 404) return { name: null }
                            throw err
                        })
                    return [key, fieldInfo.name] as const
                })
        )
    )

    return leads.map(
        lead => _.mapKeys(lead, (_, k) => customFieldNameMap[k] || k) as typeof lead
    )
}


export async function expandLead(client: AxiosInstance, lead: z.infer<typeof leadSchema>) {
    const customFieldNameMap = Object.fromEntries(
        await Promise.all(
            Object.keys(lead)
                .filter(key => key.startsWith("custom."))
                .map(async key => {
                    const fieldInfo = await getCustomLeadField(client, key)
                        .catch(err => {
                            if (err.response.status === 404) return { name: null }
                            throw err
                        })
                    return [key, fieldInfo.name] as const
                })
        )
    )
    return _.mapKeys(lead, (_, k) => customFieldNameMap[k] || k) as typeof lead
}


export async function getCustomLeadField(client: AxiosInstance, fieldId: string) {
    if (fieldId.startsWith("custom."))
        fieldId = fieldId.replace("custom.", "")

    return client.get(`/custom_field/lead/${fieldId}/`)
        .then(res => res.data as z.infer<typeof customLeadFieldSchema>)
}