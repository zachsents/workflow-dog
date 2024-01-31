import { } from "@web/modules/workflow-editor/graph/nodes"
import { TbFileSpreadsheet } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbFileSpreadsheet,
    color: colors.green[500],
    darkShade: 40,
    tags: ["Google Sheets", "Spreadsheets", "Tables"],
    inputs: {
        spreadsheetUrl: {
            description: "The URL of the spreadsheet to get the cell from.",
            recommendedNode: {
                data: {
                    definition: "node-type:basic.text",
                    comment: "Spreadsheet URL",
                },
                handle: "text",
            },
        },
        sheetName: {
            description: "The name of the sheet to get the cell from.",
            recommendedNode: {
                data: {
                    definition: "node-type:basic.text",
                    comment: "Sheet Name",
                },
                handle: "text",
            },
        },
        column: {
            description: "The column of the cell to get.",
            recommendedNode: {
                data: {
                    definition: "node-type:basic.text",
                    comment: "Column (e.g. A, B, C, ...)",
                },
                handle: "text",
            },
        },
        row: {
            description: "The row of the cell to get.",
            recommendedNode: {
                data: {
                    definition: "node-type:basic.number",
                    comment: "Row (e.g. 1, 2, 3, ...)",
                },
                handle: "number",
            },
        },
    },
    outputs: {
        value: {
            description: "The value of the cell.",
        },
    },
}