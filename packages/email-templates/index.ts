import fs from "fs/promises"
import path from "path"

export async function buildEmail(templateName: string, opts: Record<string, string>) {
    const templateDir = path.join(__dirname, "./emails", templateName)

    const html = await fs.readFile(path.join(templateDir, "compiled.html"), "utf8")
        .then(html => substitute(html, opts))
    const text = await fs.readFile(path.join(templateDir, "plaintext.txt"), "utf8")
        .then(text => substitute(text, opts))
    const subject = await fs.readFile(path.join(templateDir, "subject.txt"), "utf8")
        .then(subject => substitute(subject, opts))

    return {
        html,
        text,
        subject,
    }
}

function substitute(template: string, opts: Record<string, string>) {
    return Object.entries(opts).reduce((template, [key, value]) => template.replaceAll(`{{ ${key} }}`, value), template)
}