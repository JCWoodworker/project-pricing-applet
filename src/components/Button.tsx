import type { ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

/**
 * Stand-in for the future `@your-org/ui` Button. Once that package is
 * published, replace this implementation with a re-export from it — no
 * other file in the app imports from here directly (see `./index.ts`).
 */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-700',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
  }

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
