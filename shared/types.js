

/** @typedef {"any" | "string" | "number" | "boolean" | "object" | "array" | "date"} DataTypeBaseType */


export const DATA_TYPE = {
    ANY: "any",
    STRING: "string",
    NUMBER: "number",
    BOOLEAN: "boolean",
    OBJECT: "object",
    ARRAY: "array",
    DATE: "date",
}


const DATA_TYPE_LABELS = {
    [DATA_TYPE.ANY]: "Any",
    [DATA_TYPE.STRING]: "Text",
    [DATA_TYPE.NUMBER]: "Number",
    [DATA_TYPE.BOOLEAN]: "Boolean",
    [DATA_TYPE.OBJECT]: "Object",
    [DATA_TYPE.ARRAY]: "List",
    [DATA_TYPE.DATE]: "Date",
}


/**
 * @param {DataType} typeA
 * @param {DataType} typeB
 */
export function doTypesMatch(typeA, typeB) {
    if (typeA instanceof GenericType && typeB instanceof GenericType && typeA.type === typeB.type) {
        return doTypesMatch(typeA.generic, typeB.generic)
    }

    return typeA.type === typeB.type || typeA.type === DATA_TYPE.ANY || typeB.type === DATA_TYPE.ANY
}


export class DataType {
    static ANY = new DataType(DATA_TYPE.ANY)
    static STRING = new DataType(DATA_TYPE.STRING)
    static LONG_STRING = new DataType(DATA_TYPE.STRING, { long: true })
    static NUMBER = new DataType(DATA_TYPE.NUMBER)
    static BOOLEAN = new DataType(DATA_TYPE.BOOLEAN)
    static DATE = new DataType(DATA_TYPE.DATE)

    /**
     * @param {DataTypeBaseType} type
     * @param {object} [options]
     */
    constructor(type, options = {}) {
        this.type = type
        this.options = options
    }

    toString() {
        return this.type
    }

    toLabel() {
        return DATA_TYPE_LABELS[this.type]
    }
}


export class GenericType extends DataType {

    static OBJECT = (generic = DataType.ANY) => new GenericType(DATA_TYPE.OBJECT, generic)
    static ARRAY = (generic = DataType.ANY) => new GenericType(DATA_TYPE.ARRAY, generic)

    /**
     * @param {DataTypeBaseType} type
     * @param {DataType} generic
     */
    constructor(type, generic) {
        super(type)
        this.generic = generic
    }

    toString() {
        return `${this.type}<${this.generic}>`
    }

    toLabel() {
        return `${DATA_TYPE_LABELS[this.type]} of ${this.generic.toLabel()}`
    }
}
