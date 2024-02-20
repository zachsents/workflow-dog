export default {
    action: async ({ name, title, phones, emails }, { token }) => {
        const res = await fetch(`https://api.close.com/api/v1/contact/`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${Buffer.from(`${token}:`).toString("base64")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                title,
                phones: Object.entries(phones).map(([label, phone]) => ({
                    type: label,
                    phone,
                })),
                emails: Object.entries(emails).map(([label, email]) => ({
                    type: label,
                    email,
                })),
            })
        })
        if (!res.ok) {
            throw new Error(`Close CRM Error: ${res.statusText}`)
        }
        return { contact: await res.json() }
    },
}