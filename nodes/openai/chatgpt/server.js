export default {
    action: async ({ message }, { node, token }) => {

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                model: node.data.state?.model || "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: message,
                    }
                ],
            })
        }).then(res => res.json())

        return { response: response.choices[0].message.content }
    },
}