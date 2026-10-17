import { Fragment, type ElementType, type ReactNode } from 'react'

/** Renders each line inside a mask so it can slide up into view. */
export function Lines({
  lines,
  as: Tag = 'h2',
  className,
  reveal = true,
  delay,
}: {
  lines: ReactNode[]
  as?: ElementType
  className?: string
  reveal?: boolean
  delay?: number
}) {
  return (
    <Tag className={className} data-reveal={reveal ? 'lines' : undefined} data-delay={delay}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className="line-mask">
            <span>{line}</span>
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
