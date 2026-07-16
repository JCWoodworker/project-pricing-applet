import type { InputHTMLAttributes } from 'react'
import { Input as BaseInput, Label } from '@jfc3303/jafracore-ui'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  suffix?: string
}

/**
 * Thin wrapper around `@jfc3303/jafracore-ui`'s `Input` + `Label`, adding
 * the label-above/suffix-beside layout this app's forms use everywhere so
 * feature components don't need to compose it themselves each time.
 */
export function Input({ label, suffix, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <span className="flex items-center gap-2">
        <BaseInput id={id} className={className} {...props} />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </span>
    </div>
  )
}
