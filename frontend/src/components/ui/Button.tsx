import { clsx } from 'clsx'
import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none h-10 px-4'
  const styles: Record<Variant, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-border',
    ghost: 'bg-transparent text-foreground hover:bg-muted border border-transparent',
  }
  return <button className={clsx(base, styles[variant], className)} {...props} />
}

