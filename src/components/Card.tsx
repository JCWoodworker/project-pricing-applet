import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement>

/**
 * Stand-in for the future `@your-org/ui` Card. See `./Button.tsx` for the
 * swap-in convention.
 */
export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ${className}`}
      {...props}
    />
  )
}
