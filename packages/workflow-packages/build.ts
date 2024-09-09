/**
 * 
 * SHELFED
 * too complicated for now
 * 
 */



import generate from "@babel/generator"
import parser from "@babel/parser"
import traverse, { type NodePath } from "@babel/traverse"
import nodePath from "path"


if (import.meta.main && process.argv.length >= 3) {
    console.log("Building", process.argv[2])
    await build(process.argv[2])
}


export async function build(sourceFile: string, {
    outDir,
}: {
    outDir?: string
} = {}) {
    if (!outDir) outDir = nodePath.join(nodePath.dirname(sourceFile), "dist")

    const sourceCode = await Bun.file(sourceFile).text()

    const chunkNames = ["client", "server"]

    const files = chunkNames.map(chunkName => {
        console.debug("---\nBuilding chunk: %s", chunkName)

        const ast = parser.parse(sourceCode, {
            sourceType: "module",
            allowAwaitOutsideFunction: true,
            plugins: ["typescript", "jsx"],
            sourceFilename: nodePath.basename(sourceFile),
        })

        const statements = new Set<NodePath>()
        const declaredTypes = new Map<string, NodePath>()

        // Find all entrypoints marked with a comment
        traverse(ast, {
            Statement(path) {
                if (!path.parentPath.isProgram())
                    return
                if (!path.node.leadingComments?.some(c => c.value.includes(`@${chunkName}`)))
                    return

                statements.add(path)
            },
            Declaration(path) {
                if (!path.isTypeScript())
                    return

                const parent = path.find(p => !!p.parentPath?.isProgram())
                if (path.node.id && "name" in path.node.id && parent) {
                    declaredTypes.set(path.node.id.name, parent)
                }
            },
            ImportSpecifier(path) {
                const parent = path.find(p => !!p.parentPath?.isProgram())
                if (path.node.importKind == "type" && parent) {
                    declaredTypes.set(path.node.local.name, parent)
                }
            },
        })
        console.debug("Found %d entrypoints marked `@%s`", statements.size, chunkName)

        // Search for dependencies
        console.debug("Searching for dependencies...")
        let prevSize = 0

        while (prevSize !== statements.size) {
            prevSize = statements.size
            statements.forEach(path => path.traverse({
                ReferencedIdentifier(path) {
                    const statement = path.scope.getBinding(path.node.name)?.path.getStatementParent()
                    if (statement)
                        statements.add(statement)
                },
                TSTypeReference(path) {
                    if ("name" in path.node.typeName) {
                        const typeName = path.node.typeName.name
                        if (declaredTypes.has(typeName))
                            statements.add(declaredTypes.get(typeName)!)
                    }
                },
                /* 
                    For some reason, we can't find certain type references via traverse,
                    so we have to manually find them.
                */
                enter(path) {
                    if ("typeParameters" in path.node && !!path.node.typeParameters
                        && "params" in path.node.typeParameters && !!path.node.typeParameters.params) {
                        path.node.typeParameters.params.forEach(p => {
                            if ("typeName" in p && !!p.typeName && "name" in p.typeName) {
                                const typeName = p.typeName.name
                                if (declaredTypes.has(typeName))
                                    statements.add(declaredTypes.get(typeName)!)
                            }
                        })
                    }
                },
            }))
            const diff = statements.size - prevSize
            if (diff) console.debug("  + %d dependencies", diff)
        }

        // function findReferences(path: NodePath) {
        //     statements.add(path)
        //     path.traverse({
        //         Identifier(path) {
        //             const statement = path.scope.getBinding(path.node.name)?.path.getStatementParent()
        //             if (!statement)
        //                 return

        //             if (keep.has(statement))
        //                 return

        //             keep.add(statement)
        //             keepReferences(statement)
        //         },
        //         TSTypeReference(path) {
        //             if (!("name" in path.node.typeName))
        //                 return
        //             const typeName = path.node.typeName.name

        //             console.log("--")
        //             console.log(typeName)
        //             console.log(path.scope.getBinding(typeName))

        //             const statement = path.scope.getBinding(typeName)?.path.getStatementParent()
        //             if (!statement)
        //                 return
        //             console.log(sourceCode.slice(statement.node.start!, statement.node.end!))

        //             const code = sourceCode.slice(path.node.start!, path.node.end!)
        //             console.log(code)
        //         },
        //         // JSXOpeningElement(path) {

        //         //     const code = sourceCode.slice(path.node.name.start!, path.node.name.end!)
        //         //     if (!code.includes("Config"))
        //         //         return
        //         //     console.log("--")
        //         //     console.log(path.node.name.type)
        //         //     console.log(code)
        //         //     console.log(path.node.typeParameters?.params.map(p => p.type + "  - " + sourceCode.slice(p.start!, p.end!)))
        //         // },
        //         // TSTypeReference(path) {
        //         //     const code = sourceCode.slice(path.node.start!, path.node.end!)
        //         //     console.log(code)
        //         // },
        //     })
        // }
        // statements.forEach(path => keepReferences(path))

        // Remove all other statements
        let removeCount = 0
        traverse(ast, {
            enter(path) {
                if (path.isProgram())
                    return
                if (Array.from(statements).some(p => path === p || path.isDescendant(p)))
                    return

                path.remove()
                removeCount++
            },
        })
        console.debug("Removed %d statements", removeCount)

        // Rewrite import paths
        traverse(ast, {
            ImportDeclaration(path) {
                const importPath = path.node.source.value
                if (!importPath.startsWith("."))
                    return

                let newPath = nodePath.relative(outDir, nodePath.join(nodePath.dirname(sourceFile), importPath))
                if (!newPath.startsWith("."))
                    newPath = "./" + newPath
                path.node.source.value = newPath

                if (/^\..+\/registry$/.test(path.node.source.value)) {
                    path.node.source.value = path.node.source.value
                        .replaceAll("registry", `registry/registry.${chunkName}`)
                    console.debug("Rewrote registry import")
                }
            },
        })

        // Generate code
        const output = generate(ast, {
            retainLines: true,
            comments: false,
        }, sourceCode)
        const cleanedCode = output.code.replaceAll(/\n{3,}/g, "\n\n")
            .replace(/^\s+/, "") // remove leading whitespace
            .replace(/\s+$/, "") // remove trailing whitespace
            .replaceAll(/\s+^import/gm, "\nimport") // remove leading whitespace from imports

        // Choose file name
        let containsJsx = false
        traverse(ast, {
            JSX() { containsJsx = true },
        })
        const originalName = nodePath.basename(sourceFile, nodePath.extname(sourceFile))
        const fileExt = containsJsx ? ".tsx" : ".ts"
        const chunkExt = "." + chunkName
            // convert camel case to kebab case
            .replaceAll(/(?<=[a-z])[A-Z]/g, c => `-${c.toLowerCase()}`)
        const fileName = originalName + chunkExt + fileExt

        console.debug("Compiled file: %s (%d lines)", fileName, cleanedCode.split("\n").length)

        return {
            fileName,
            code: cleanedCode,
        }
    })

    return await Promise.all(files.map(async f => {
        const filePath = nodePath.join(outDir, f.fileName)
        await Bun.write(filePath, f.code)
        return filePath
    })).then(() => console.debug("---\nDone!"))
}