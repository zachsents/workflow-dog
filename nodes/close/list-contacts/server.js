export default {
    action: async (_, { token }) => {
        const res = await fetch("https://api.close.com/api/v1/contact/", {
            method: "GET",
            headers: {
                "Authorization": `Basic ${Buffer.from(`${token}:`).toString("base64")}`,
                "Accept": "application/json",
            },
        })
        if (!res.ok) {
            throw new Error(`Failed to fetch contacts from Close CRM: ${res.statusText}`)
        }
        const { data } = await res.json()
        return { contacts: data }
    },
}