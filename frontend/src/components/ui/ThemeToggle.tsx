'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefersDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
    const isDark = stored ? stored === 'dark' : prefersDark
    // eslint-disable-next-line
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      aria-label={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      onClick={toggle}
      className="h-9 px-3"
    >
      {dark ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
      <span className="text-sm">Trocar tema</span>
    </Button>
  )
}
