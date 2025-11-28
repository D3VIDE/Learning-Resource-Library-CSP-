"use client";

import { useEffect, useState } from "react";
import { AuthForm } from "../../components/AuthForm";
import { useRouter } from "next/navigation";

export default function Auth() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // ⬇ kalau theme berubah, pasang class dark ke html
  useEffect(() => {
    const html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  return (
    <AuthForm
      onLoginSuccess={() => router.push("/")}
      theme={theme}
      onToggleTheme={() =>
        setTheme((prev) => (prev === "light" ? "dark" : "light"))
      }
    />
  );
}
