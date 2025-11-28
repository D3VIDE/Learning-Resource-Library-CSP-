"use client";

import { useState } from "react";
import { AuthForm } from "../../components/AuthForm";

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <AuthForm
      onLoginSuccess={() => console.log("Login sukses!")}
      theme={theme}
      onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
    />
  );
}
