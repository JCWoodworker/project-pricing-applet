import type { ReactNode, SelectHTMLAttributes } from 'react'

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
 * Stand-in for the future `@your-org/ui` Select. See `./Button.tsx` for the
 * swap-in convention.
 */
export function Select({ label, options, placeholder, id, className = '', ...props }: SelectProps): ReactNode {
  return (
    <label className="flex flex-col gap-1 text-sm text-neutral-700" htmlFor={id}>
      {label && <span className="font-medium">{label}</span>}
      <select
        id={id}
        className={`rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-500 focus:outline-none ${className}`}
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
    </label>
  )
}
