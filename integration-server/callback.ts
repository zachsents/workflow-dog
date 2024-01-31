

export function callbackUrl(serviceName: string) {
    return process.env.NODE_ENV === "production"
        ? `https://api.workflow.dog/integration/${serviceName}/callback`
        : `http://localhost:8080/integration/${serviceName}/callback`
}