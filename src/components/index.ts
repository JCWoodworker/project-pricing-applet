/**
 * Single import point for UI primitives. `Button`, `Card` (+ subcomponents),
 * and `Label` now come straight from the published `@jfc3303/jafracore-ui`
 * package. `Select` and `Input` stay as thin local wrappers — `Input` adds
 * this app's label/suffix layout on top of the library's bare input, and
 * `Select` fills a gap (the library has no form Select yet). Feature code
 * only ever imports from here, never from the library or these local files
 * directly.
 */
export {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Label,
} from '@jfc3303/jafracore-ui'
export type { ButtonProps } from '@jfc3303/jafracore-ui'

export { Select } from './Select'
export type { SelectProps, SelectOption } from './Select'
export { Input } from './Input'
export type { InputProps } from './Input'
