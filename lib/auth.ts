import { supabase } from "./client"
import { AuthResult, User } from "./types"

export async function signup(name: string, email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .insert([{ 
          id: data.user.id, 
          name: name 
        }])
    }

    const user = await getCurrentUser()
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const user = await getCurrentUser()
    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// lib/auth.ts
export async function logout() {
  console.log("Lib/Auth: Mengirim request signOut...");
  
 
  supabase.auth.signOut().catch(err => console.error("Signout background error:", err));

  // Hapus manual session dari browser agar middleware mendeteksi user sudah keluar
  if (typeof window !== 'undefined') {
    // Hapus semua data supabase dari local storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase.auth.token')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', authUser.id)
      .maybeSingle() 

    return {
      id: authUser.id,
      email: authUser.email!,
      // Ambil dari profil, jika tidak ada ambil dari metadata auth, jika tidak ada pakai email
      name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
      avatar_url: profile?.avatar_url || null,
      created_at: authUser.created_at
    }
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}