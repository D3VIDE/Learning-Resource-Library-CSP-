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
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    const user: User = {
      id: authUser.id,
      email: authUser.email!,
      name: profile?.name || authUser.user_metadata?.name,
      avatar_url: profile?.avatar_url,
      created_at: authUser.created_at
    }

    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}