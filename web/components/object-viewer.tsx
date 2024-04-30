import { useLocalStorageValue } from "@react-hookz/web"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@ui/table"
import { cn } from "@web/lib/utils"
import stringifyObject from "stringify-object"

export default function ObjectViewer({ children, depth = 0 }: { children: Record<string, any>, depth?: number }) {

    const { value: format, set: setFormat } = useLocalStorageValue("object-viewer-format", {
        defaultValue: "table"
    })

    return (
        <div>
            <div className="flex justify-end items-center gap-4 my-4">
                <p className="text-sm font-bold">
                    Format
                </p>
                <Select value={format || ""} onValueChange={setFormat}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="raw">Raw</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {format === "table" &&
                <Table className={cn(
                    depth > 0 && "outline-dashed outline-1 outline-muted-foreground py-1 debug"
                )}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[0%]">Property</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(children ?? {}).map(([k, v]) =>
                            <TableRow key={k}>
                                <TableCell className="w-[0%]">
                                    <div className="max-w-40 overflow-x-scroll py-1">
                                        <p className="font-bold">{titleCase(k)}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {k}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="whitespace-pre-wrap overflow-x-scroll">
                                        {typeof v == null
                                            ? "null"
                                            : (typeof v === "object" && v != null)
                                                ? Array.isArray(v)
                                                    ? `List - ${v.length} items`
                                                    // : depth < 2
                                                    //     ? <ObjectViewer depth={depth + 1}>
                                                    //         {v}
                                                    //     </ObjectViewer>
                                                    //     : "{...}"
                                                    : `Object - ${Object.keys(v).length} properties`
                                                : v}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>}

            {format === "raw" &&
                <pre className="whitespace-pre-wrap">
                    {stringifyObject(children, { indent: "  " })}
                </pre>}
        </div>
    )
}

function titleCase(str: string) {
    const vowels = new Set(["a", "e", "i", "o", "u", "y"])


    return str.split(/[^A-Za-z0-9]+/g).map(s => {
        const hasNoVolwels = Array.from(s.toLowerCase().slice(1))
            .every(c => !vowels.has(c))

        // rough acronym detector
        if (s.length <= 4 && hasNoVolwels)
            return s.toUpperCase()

        return s[0].toUpperCase() + s.slice(1)
    }).join(" ")
}