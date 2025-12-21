import { supabase } from "../client"
import { Resource, ResourceStats, ApiResponse, Category } from "../types"

export const resourceService = {
  // Get all resources for current user
  async getResources(): Promise<ApiResponse<Resource[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Not authenticated" }

      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching resources:", error)
        return { success: false, error: error.message }
      }
      
      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error("Exception in getResources:", error)
      return { success: false, error: error.message }
    }
  },

  // Get user stats (MANUAL VERSION - NO SQL FUNCTION NEEDED)
  async getUserStats(): Promise<ApiResponse<ResourceStats>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Not authenticated" }

      // Get all user resources
      const { data: resources, error } = await supabase
        .from('resources')
        .select('status, progress, is_favorite')
        .eq('user_id', user.id)

      if (error) {
        console.error("Error fetching resources for stats:", error)
        // Return empty stats instead of error
        return {
          success: true,
          data: {
            total_resources: 0,
            completed_resources: 0,
            in_progress_resources: 0,
            total_progress_percentage: 0,
            favorite_resources: 0
          }
        }
      }

      // Calculate stats manually
      const resourceList = resources || []
      const total_resources = resourceList.length
      const completed_resources = resourceList.filter(r => r.status === 'completed').length
      const in_progress_resources = resourceList.filter(r => r.status === 'in-progress').length
      const total_progress = resourceList.reduce((sum, r) => sum + (r.progress || 0), 0)
      const total_progress_percentage = total_resources > 0 
        ? total_progress / total_resources 
        : 0
      const favorite_resources = resourceList.filter(r => r.is_favorite).length

      return {
        success: true,
        data: {
          total_resources,
          completed_resources,
          in_progress_resources,
          total_progress_percentage,
          favorite_resources
        }
      }
    } catch (error: any) {
      console.error("Exception in getUserStats:", error)
      return {
        success: true,
        data: {
          total_resources: 0,
          completed_resources: 0,
          in_progress_resources: 0,
          total_progress_percentage: 0,
          favorite_resources: 0
        }
      }
    }
  },

  // Get categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error("Error fetching categories:", error)
        return { success: false, error: error.message }
      }
      
      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error("Exception in getCategories:", error)
      return { success: false, error: error.message }
    }
  },

  // Create resource
  async createResource(resource: {
    title: string
    description?: string
    category_id?: string
    source_type: 'link' | 'file'
    url?: string
    file_name?: string
    file_size?: number
    file_type?: string
    file_url?: string
    level: 'beginner' | 'intermediate' | 'advanced'
    priority: 'low' | 'medium' | 'high'
    status: 'not-started' | 'in-progress' | 'completed'
    progress: number
    is_favorite?: boolean
    is_public?: boolean
  }): Promise<ApiResponse<Resource>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Not authenticated" }

      const { data, error } = await supabase
        .from('resources')
        .insert([{
          ...resource,
          user_id: user.id,
          progress: resource.progress || 0,
          is_favorite: resource.is_favorite || false,
          is_public: resource.is_public || false
        }])
        .select()
        .single()

      if (error) {
        console.error("Error creating resource:", error)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error: any) {
      console.error("Exception in createResource:", error)
      return { success: false, error: error.message }
    }
  },

  // Update resource
  async updateResource(id: string, updates: Partial<Resource>): Promise<ApiResponse<Resource>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Not authenticated" }

      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating resource:", error)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error: any) {
      console.error("Exception in updateResource:", error)
      return { success: false, error: error.message }
    }
  },

  // Delete resource
  async deleteResource(id: string): Promise<ApiResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Not authenticated" }

      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error("Error deleting resource:", error)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error: any) {
      console.error("Exception in deleteResource:", error)
      return { success: false, error: error.message }
    }
  }
}