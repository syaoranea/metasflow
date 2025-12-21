"use client"

import { useSession, signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { Target, LogOut, Moon, Sun, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { data: session } = useSession() || {}
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.replace('/login')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-full">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            MetasFlow
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push('/goals/new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {session && (
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
