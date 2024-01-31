import colors from "tailwindcss/colors"


export function resolveTailwindColor(color, shade) {
    return colors[color || "gray"]?.[shade || 600]
}