

export function callbackUrl(serviceName: string) {
    return process.env.NODE_ENV === "production"
        ? `https://integrate-e45frdiv4a-uc.a.run.app/service/${serviceName}/callback`
        : `http://localhost:${process.env.PORT}/service/${serviceName}/callback`
}