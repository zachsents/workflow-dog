import { createCipheriv, createDecipheriv, randomBytes } from "crypto"


const ALGORITHM = "aes-128-gcm"
const INPUT_ENCODING = "utf-8"
const OUTPUT_ENCODING = "base64url"


export function encrypt(value: string, key: string) {
    const cipherKey = Buffer.from(key, INPUT_ENCODING)

    const iv = randomBytes(16)

    const cipher = createCipheriv(ALGORITHM, cipherKey, iv)
    const encodedCipherText = cipher.update(value, INPUT_ENCODING, OUTPUT_ENCODING)
        + cipher.final(OUTPUT_ENCODING)

    return iv.toString(OUTPUT_ENCODING) + ":" + encodedCipherText
}

export function decrypt(cipherText: string, key: string) {
    const cipherKey = Buffer.from(key, INPUT_ENCODING)

    const [encodedIv, encodedCipherText] = cipherText.split(":")
    const iv = Buffer.from(encodedIv, OUTPUT_ENCODING)

    const decipher = createDecipheriv(ALGORITHM, cipherKey, iv)
    const decryptedToken = decipher.update(encodedCipherText, OUTPUT_ENCODING, INPUT_ENCODING)
        + decipher.final(INPUT_ENCODING)

    return decryptedToken
}

export function encryptJSON(value: any, key: string) {
    return encrypt(JSON.stringify(value), key)
}

export function decryptJSON(cipherText: string, key: string) {
    return JSON.parse(decrypt(cipherText, key))
}