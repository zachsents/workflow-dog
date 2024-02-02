
export default {
    name: "Get Cell",
    description: "Get a cell's data from Google Sheets.",

    inputs: {
        spreadsheetUrl: {
            name: "Spreadsheet URL",
            type: "data-type:basic.string",
        },
        sheetName: {
            name: "Sheet Name",
            type: "data-type:basic.string",
        },
        column: {
            name: "Column",
            type: "data-type:basic.string",
        },
        row: {
            name: "Row",
            type: "data-type:basic.number",
        },
    },
    outputs: {
        value: {
            name: "Value",
            type: null,
        },
    },

    requiredIntegration: {
        service: "google",
        scopes: [
            ["https://www.googleapis.com/auth/spreadsheets.readonly", "https://www.googleapis.com/auth/spreadsheets"]
        ],
    },
}