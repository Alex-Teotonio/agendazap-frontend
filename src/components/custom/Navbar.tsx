// components/custom/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname() || '/'
  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <header className="bg-card text-card-foreground shadow-sm h-16">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
        <Link
          href="/"
          className="text-2xl font-bold hover:text-accent-foreground transition-colors"
        >
          Agendazap
        </Link>
        <nav className="flex space-x-4">
          {links.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary-foreground'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
