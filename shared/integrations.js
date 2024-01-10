

export const INTEGRATION_AUTH_TYPE = {
    OAUTH2: "oauth2",
    API_KEY: "api_key",
    USER_PASS: "user_pass",
}


export const INTEGRATION_SERVICE = {
    GOOGLE: "google",
    LINKEDIN: "linkedin",
    X: "x",
    DISCORD: "discord",
    STRIPE: "stripe",
    AIRTABLE: "airtable",
}


export const INTEGRATION_INFO = {
    [INTEGRATION_SERVICE.GOOGLE]: {
        name: "Google",
        authType: INTEGRATION_AUTH_TYPE.OAUTH2,
    },
    [INTEGRATION_SERVICE.LINKEDIN]: {
        name: "LinkedIn",
        authType: INTEGRATION_AUTH_TYPE.OAUTH2,
    },
    [INTEGRATION_SERVICE.X]: {
        name: "X",
        authType: INTEGRATION_AUTH_TYPE.OAUTH2,
    },
    [INTEGRATION_SERVICE.DISCORD]: {
        name: "Discord",
        authType: INTEGRATION_AUTH_TYPE.API_KEY,
    },
    [INTEGRATION_SERVICE.STRIPE]: {
        name: "Stripe",
        authType: INTEGRATION_AUTH_TYPE.API_KEY,
    },
    [INTEGRATION_SERVICE.AIRTABLE]: {
        name: "Airtable",
        authType: INTEGRATION_AUTH_TYPE.OAUTH2,
    },
}