"use client";

import { useState } from "react";
import { AuthForm } from "../../components/AuthForm";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <AuthForm
      theme={theme}
      onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
      onLoginSuccess={() => router.push("/")}
    />
  );
}
