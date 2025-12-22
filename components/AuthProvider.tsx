"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import { login, signup, logout, getCurrentUser } from "../lib/auth"
import { User, AuthResult } from "../lib/types"
import {supabase} from "../lib/client";

//AuthProvider digunakan untuk global (menghandle status login user + profile user)

/*
AuthProvider tidak mengambil dari hooks/useAuth.tsx untuk menghindari duplikasi state
dikarenakan AuthProvider menggunakan useState sendiri dan hooks/useAuth.tsx menggunakan useState sendiri juga

#Notes:
1. AuthProvider menggantikan fungsi useAuth dari hooks
2. password emg g ada di AuthResult karena mengikuti bentuk supabase (dan tdk menyertakan password di index.ts merupakan bagian praktik keamanan)
*/

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null) //boleh berisi data lengkap/null

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { //initial check ketika pertama kali dibuka 
    getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async () => {
        const user = await getCurrentUser()
        setUser(user)
      }
    )
    //jika ada perubahan seperti login atau logout maka akan dijalankan

    return () => {
      subscription.unsubscribe()
    } //untuk clean up
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password)
    if (result.success) {
      setUser(result.user || null)
    }
    return result
  }

  const handleSignup = async (name: string, email: string, password: string) => {
    const result = await signup(name, email, password)
    return result
  }

const handleLogout = async () => {
  console.log("AuthProvider: Menjalankan signOut...");
  try {
    await logout(); // Fungsi dari lib/auth.ts
    setUser(null);  // PAKSA state menjadi null secara manual
    console.log("AuthProvider: State user di-set ke null");
  } catch (err) {
    console.error("AuthProvider: Gagal logout", err);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
  return ctx
}