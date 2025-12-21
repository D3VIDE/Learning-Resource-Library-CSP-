"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "../../components/AuthForm"

export default function Auth() {
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const html = document.documentElement
    if (theme === "dark") {
      html.classList.add("dark")
    } else {
      html.classList.remove("dark")
    }
  }, [theme])

  return (
    <AuthForm
      onLoginSuccess={() => router.push("/dashboard")}
      theme={theme}
      onToggleTheme={() =>
        setTheme((prev) => (prev === "light" ? "dark" : "light"))
      }
    />
  )
}