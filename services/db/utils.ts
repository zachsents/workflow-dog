import type { Kysely } from "kysely"


export async function createTypeIfNotExists(db: Kysely<any>, typeName: string, typeEnum: string[]) {
    const { exists } = await db.selectNoFrom(eb => eb.exists(
        eb.selectFrom("pg_type")
            .selectAll()
            .where("typname", "=", typeName)
    ).as("exists")).executeTakeFirstOrThrow()

    if (exists)
        return

    await db.schema
        .createType(typeName)
        .asEnum(typeEnum)
        .execute()
}