export default {
    name: "Date",
    compatibleWith: [],
    dehydrate: (value) => value.toISOString(),
    hydrate: (value) => new Date(value),
}