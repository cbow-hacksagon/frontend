"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, LockIcon } from "lucide-react"

export function AuthForm({ mode = "login" }: { mode?: "login" | "signup" }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      /**
       * To update with your actual authentication logic
       */
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log(mode === "login" ? "Signing in with:" : "Signing up with:", 
        name ? { email, password, name } : { email, password })
    } catch (error) {
      console.error("Authentication error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {mode === "signup" && (
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-black dark:text-white">
            Name
          </label>
          <Input
            type="text"
            name="name"
            id="name"
            placeholder="John Doe"
            required
            disabled={isLoading}
            className="h-12 bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            autoComplete="name"
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-black dark:text-white">
          Email
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center justify-center w-4 h-4">
            @
          </span>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="name@example.com"
            required
            disabled={isLoading}
            className="pl-10 h-12 bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-black dark:text-white">Password</label>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
            disabled={isLoading}
            className="pl-10 h-12 bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-base font-medium bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? (mode === "login" ? "Signing in..." : "Signing up...") : (mode === "login" ? "Sign in" : "Sign up")}
      </Button>
    </form>
  )
}

