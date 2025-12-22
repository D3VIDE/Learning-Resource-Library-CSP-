// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from "../lib/client";
// import { login as loginService, logout as logoutService } from "../lib/auth";

// //di hooks lebih digunakan untuk memantau state condition user (login/logout memanggil dari lib/auth.ts)
// export function useAuth() {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   // Saat halaman pertama kali dimuat → cek session
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     // Listen perubahan login/logout
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   // Login
//   const signIn = async (email: string, pass: string) => {
//       const result = await loginService(email, pass);
//       if (result.success) {
//           setUser(result.user); // Update state react
//       }
//       return result;
//     };

//   // Logout
//   const signOut = async () => {
//       await logoutService(); // Bersihkan storage & supabase
//       setUser(null); // Kosongkan state react
//     };

//     return { user, signIn, signOut };
//   }
