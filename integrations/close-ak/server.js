export default {
    apiKey: {
        profileUrl: "https://api.close.com/api/v1/me/",
        generateAuthHeader: key => `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
    },
}