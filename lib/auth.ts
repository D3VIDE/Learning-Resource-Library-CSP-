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


export async function logout() {
  console.log("Lib/Auth: Menginisiasi signOut...");
  
  try {
    supabase.auth.signOut().catch(console.error);
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  } catch (error) {
    console.error("Logout error:", error);
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
      name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0],
      avatar_url: profile?.avatar_url || null,
      created_at: authUser.created_at
    }
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}