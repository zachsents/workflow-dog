
export function catchOpenAIError(error: any): never {
    throw new Error(error.response?.data?.error?.message || error.message)
}