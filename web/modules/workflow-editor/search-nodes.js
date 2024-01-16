import lunr from "lunr"
import { list as nodeDefList, object as nodeDefs } from "nodes/web"


const interfaceDescriptionExtractor = (typeKey, nodeDef) => Object.values(nodeDef[typeKey]).map(interf => interf.description ?? "").join(" ")

const nodeSearchIndex = lunr(function () {
    this.ref("id")
    this.field("name")
    this.field("description")
    this.field("tags", {
        extractor: nodeDef => nodeDef.tags.join(" "),
    })
    this.field("interfaceDescriptions", {
        extractor: nodeDef => interfaceDescriptionExtractor("inputs", nodeDef) + " " +
            interfaceDescriptionExtractor("outputs", nodeDef),
        boost: 0.3,
    })

    nodeDefList.forEach(nodeDef => {
        this.add(nodeDef)
    })
})

export function searchNodes(query, tags = []) {
    try {
        return nodeSearchIndex.search(fixQuery(query))
            .map(result => nodeDefs[result.ref])
            .filter(nodeDef => tags.every(tag => nodeDef.tags.includes(tag)))
    }
    catch (err) {
        return []
    }
}


const tagSearchIndex = lunr(function () {
    this.ref("tag")
    this.field("tag")

    const tags = [...new Set(nodeDefList.flatMap(def => def.tags))]
    tags.forEach(tag => {
        this.add({ tag })
    })
})

export function searchTags(query) {
    try {
        return tagSearchIndex.search(fixQuery(query))
            .map(result => result.ref)
    }
    catch (err) {
        return []
    }
}


function fixQuery(query) {
    return query.split(/\s+/g).map(token => {
        if (/^\w+$/.test(token))
            return `+${token}~${Math.max(1, Math.min(4, token.length - 1))}`
        return token
    }).join(" ")
}
