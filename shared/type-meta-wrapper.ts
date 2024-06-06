

export class TypeMetaWrapper {
    typeMetaId: string | null
    value: any

    constructor(typeMetaId: string | null, value: any) {
        this.typeMetaId = typeMetaId
        this.value = value
    }

    static test(obj: any) {
        return obj instanceof TypeMetaWrapper || (
            typeof obj === "object"
            && !!obj.typeMetaId && "value" in obj
        )
    }

    static from(obj: any) {
        if (!TypeMetaWrapper.test(obj))
            return new TypeMetaWrapper(null, obj)

        if (obj instanceof TypeMetaWrapper)
            return obj

        return new TypeMetaWrapper(obj.typeMetaId, obj.value)
    }

    toRow() {
        return {
            value: this.value,
            ...this.typeMetaId && {
                type_meta_id: this.typeMetaId,
            },
        }
    }
}