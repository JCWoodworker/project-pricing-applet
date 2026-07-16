import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  suffix?: string
}

/**
 * Stand-in for the future `@your-org/ui` Input. See `./Button.tsx` for the
 * swap-in convention.
 */
export function Input({ label, suffix, id, className = '', ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-neutral-700" htmlFor={id}>
      {label && <span className="font-medium">{label}</span>}
      <span className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 focus-within:border-neutral-500">
        <input
          id={id}
          className={`w-full text-sm text-neutral-900 outline-none ${className}`}
          {...props}
        />
        {suffix && <span className="text-xs text-neutral-400">{suffix}</span>}
      </span>
    </label>
  )
}
