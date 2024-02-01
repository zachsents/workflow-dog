export default {
    oauth2: {
        authUrl: "https://app.close.com/oauth2/authorize",
        tokenUrl: "https://api.close.com/oauth2/token",
        scopes: ["offline_access"],
        profileUrl: "https://api.close.com/api/v1/me",
        getDisplayName: (profile) => profile.email,
        getServiceUserId: (profile) => profile.id,
    },
}