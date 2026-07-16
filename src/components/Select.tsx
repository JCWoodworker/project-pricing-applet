import type { ReactNode, SelectHTMLAttributes } from 'react'
import { Label, cn } from '@jfc3303/jafracore-ui'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  options: SelectOption[]
  placeholder?: string
}

/**
 * `@jfc3303/jafracore-ui` doesn't ship a form Select yet (only `DropdownMenu`,
 * which is action-menu-shaped, not a controlled form value) — this stays a
 * native `<select>`, styled to match the library's `Input` classes and using
 * its `Label`/`cn()` for visual consistency. Swap for a real Select export
 * if the library adds one later.
 */
export function Select({ label, options, placeholder, id, className = '', ...props }: SelectProps): ReactNode {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <select
        id={id}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
