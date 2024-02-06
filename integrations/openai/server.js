export default {
    apiKey: {
        profileUrl: "https://api.openai.com/v1/me",
        getDisplayName: (profile, { access_token }) => `${access_token.slice(0, 8)}... (${profile.email})`,
    },
}