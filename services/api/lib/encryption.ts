import { createCipher, createDecipher } from "node:crypto"


const ALGORITHM = "aes256"
const INPUT_ENCODING = "utf-8"
const OUTPUT_ENCODING = "base64url"


export function encrypt(value: string, key: string) {
    const cipher = createCipher(ALGORITHM, key)
    return cipher.update(value, INPUT_ENCODING, OUTPUT_ENCODING) + cipher.final(OUTPUT_ENCODING)
}

export function decrypt(cipherText: string, key: string) {
    const decipher = createDecipher(ALGORITHM, key)
    return decipher.update(cipherText, OUTPUT_ENCODING, INPUT_ENCODING) + decipher.final(INPUT_ENCODING)
}

export function encryptJSON(value: any, key: string) {
    return encrypt(JSON.stringify(value), key)
}

export function decryptJSON(cipherText: string, key: string) {
    return JSON.parse(decrypt(cipherText, key))
}