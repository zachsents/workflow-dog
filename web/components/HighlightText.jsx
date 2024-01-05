

export default function HighlightText({ children, className, highlightParts, highlightClassName = "" }) {
    return (
        <p className={className}>
            {highlightParts ?
                highlightParts.map((part, i) => i % 2 == 0 ? part : <span className={highlightClassName} key={i}>{part}</span>) :
                children}
        </p>
    )
}
