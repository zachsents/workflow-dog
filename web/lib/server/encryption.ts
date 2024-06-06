import { createCipheriv, createDecipheriv, randomBytes } from "crypto"


const algorithm = "aes-128-gcm"
const inputEncoding = "utf-8"
const outputEncoding = "base64url"


export function encrypt(value: string, key: string) {
    const cipherKey = Buffer.from(key, inputEncoding)

    const iv = randomBytes(16)

    const cipher = createCipheriv(algorithm, cipherKey, iv)
    const encodedCipherText = cipher.update(value, inputEncoding, outputEncoding)
        + cipher.final(outputEncoding)

    return iv.toString(outputEncoding) + ":" + encodedCipherText
}

export function decrypt(cipherText: string, key: string) {
    const cipherKey = Buffer.from(key, inputEncoding)

    const [encodedIv, encodedCipherText] = cipherText.split(":")
    const iv = Buffer.from(encodedIv, outputEncoding)

    const decipher = createDecipheriv(algorithm, cipherKey, iv)
    const decryptedToken = decipher.update(encodedCipherText, outputEncoding, inputEncoding)
        + decipher.final(inputEncoding)

    return decryptedToken
}

export function encryptJSON(value: any, key: string) {
    return encrypt(JSON.stringify(value), key)
}

export function decryptJSON(cipherText: string, key: string) {
    return JSON.parse(decrypt(cipherText, key))
}