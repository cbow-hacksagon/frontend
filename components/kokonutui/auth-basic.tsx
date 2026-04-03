"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { AuthForm } from "./auth-form"
import { SocialLogin } from "./social-login"

export default function AuthBasic() {
  const [mode, setMode] = useState<"login" | "signup">("login")

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white dark:bg-black">
      <div className="w-full max-w-[450px]">
        <div className="w-full flex justify-center mb-8 mt-4">
          <div className="flex flex-col items-center gap-3 font-bold">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-lg">
              <span className="text-3xl">H</span>
            </div>
            <span className="text-2xl tracking-tight text-black dark:text-white">HouseMedi</span>
          </div>
        </div>
        <Card className="w-full border-0 shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight text-black dark:text-white">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              {mode === "login" ? "Enter your credentials to access your account" : "Enter your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AuthForm mode={mode} />
            <SocialLogin />
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-4">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="text-black dark:text-white font-medium hover:underline px-1"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

