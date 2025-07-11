// app/page.tsx
'use client'

import { Navbar } from '@/components/custom/Navbar'
import { LoginForm } from '@/features/auth/LoginForm'

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </main>
    </>
  )
}
