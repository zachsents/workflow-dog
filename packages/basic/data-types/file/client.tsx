import { createClientDataTypeDefinition } from "@pkg/types"
import { TbCopy, TbDownload, TbFile } from "react-icons/tb"
import shared from "./shared"
import { Button } from "@web/components/ui/button"
import { toast } from "sonner"

export default createClientDataTypeDefinition(shared, {
    icon: TbFile,
    renderPreview: ({ value }) => {
        return (
            <p>
                File (<span className="text-muted-foreground">
                    {value.mimeType}, {humanFileSize(value.data.length * 3 / 4, true)}
                </span>)
            </p>
        )
    },
    renderExpanded: ({ value }) => {

        const maxShow = 300
        const dataUrl = () => `data:${value.mimeType};base64,${value.data}`

        let dataComponent: any
        if (value.mimeType.startsWith("image/")) {
            dataComponent =
                <img
                    src={dataUrl()}
                    alt={value.name}
                    className="rounded-md self-center max-w-[40rem]"
                />
        }
        else if (value.mimeType.startsWith("audio/")) {
            dataComponent =
                <audio
                    src={dataUrl()}
                    controls
                />
        }
        else {
            dataComponent =
                <div className="p-4 bg-slate-800 text-white rounded-md break-all font-mono text-xs">
                    {value.data.slice(0, maxShow)}{value.data.length > maxShow && "..."}
                </div>
        }

        return (
            <div className="flex-v items-stretch gap-2">
                <p>
                    <strong>Name:</strong> {value.name}
                </p>
                <p>
                    <strong>Type:</strong> {value.mimeType}
                </p>
                <p>
                    <strong>Size:</strong> {humanFileSize(value.data.length * 3 / 4, true)}
                </p>

                <p>
                    <strong>Data:</strong>
                </p>

                {dataComponent}

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            navigator.clipboard.writeText(dataUrl())
                            toast.success("Copied!")
                        }}
                    >
                        <TbCopy className="mr-2" />
                        Copy
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            const a = document.createElement("a")
                            a.href = dataUrl()
                            a.download = value.name
                            a.click()
                        }}
                    >
                        <TbDownload className="mr-2" />
                        Download
                    </Button>
                </div>
            </div>
        )
    },
})


/**
 * Format bytes as human-readable text.
 * @see https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 */
function humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B'
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    let u = -1
    const r = 10 ** dp

    do {
        bytes /= thresh
        ++u
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)


    return bytes.toFixed(dp) + ' ' + units[u]
}