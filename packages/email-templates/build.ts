import { useEnvVar } from "api/lib/utils"
import { $ } from "bun"
import fs from "fs/promises"
import path from "path"

const EMAILS_DIR = "./emails"

async function compileTemplate(templateName: string) {
    console.log(`Compiling "${templateName}"...`)

    try { await $`which ruby`.quiet() }
    catch (err) {
        throw new Error("You need Ruby installed (`apt-get install ruby-full`)")
    }

    try { await $`which premailer`.quiet() }
    catch (err) {
        throw new Error("You need Premailer installed (`gem install premailer nokogiri`)")
    }

    const content = await Bun.file(path.join(EMAILS_DIR, templateName, "source.html")).text()
    let result = await $`premailer -b "${useEnvVar("APP_ORIGIN")}/email/" < ${new Response(content)}`
        .cwd(path.join(EMAILS_DIR, templateName))
        .text()

    /*
     * Base64 images are not well-supported in email clients.
     */

    // const imgPattern = /(?<=src=["'])\.\/.+?\.(png|jpg|jpeg|svg|gif)/
    // const mimeTypes = {
    //     "png": "image/png",
    //     "jpg": "image/jpeg",
    //     "jpeg": "image/jpeg",
    //     "svg": "image/svg+xml",
    //     "gif": "image/gif",
    // }

    // const imageCache: Record<string, string> = {}

    // let match = result.match(imgPattern)
    // while (match) {
    //     const imgPath = match[0]
    //     if (!imageCache[imgPath]) {
    //         const base64 = Buffer.from(
    //             await Bun.file(path.join(EMAILS_DIR, templateName, imgPath)).arrayBuffer()
    //         ).toString("base64")
    //         const mimeType = mimeTypes[match[1] as keyof typeof mimeTypes]
    //         imageCache[imgPath] = `data:${mimeType};base64,${base64}`
    //     }
    //     result = result.slice(0, match.index) + imageCache[imgPath] + result.slice(match.index! + imgPath.length)
    //     match = result.match(imgPattern)
    // }

    await Bun.write(path.join(EMAILS_DIR, templateName, "compiled.html"), result)

    return result
}

async function compileAllTemplates() {
    const templateNames = await fs.readdir(EMAILS_DIR)
    await Promise.all(templateNames.map(compileTemplate))
}

await compileAllTemplates()