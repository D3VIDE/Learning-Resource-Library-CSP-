import { supabase } from "../client";
import { Resource, ResourceStats, ApiResponse, Category } from "../types";

export const resourceService = {
  // Get all resources for current user
  async getResources(): Promise<ApiResponse<Resource[]>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase
        .from("resources")
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching resources:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Exception in getResources:", error);
      return { success: false, error: error.message };
    }
  },

  // Get user stats
  async getUserStats(): Promise<ApiResponse<ResourceStats>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { data: resources, error } = await supabase.from("resources").select("status, progress, is_favorite").eq("user_id", user.id);

      if (error) {
        console.error("Error fetching resources for stats:", error);
        return {
          success: true,
          data: {
            total_resources: 0,
            completed_resources: 0,
            in_progress_resources: 0,
            total_progress_percentage: 0,
            favorite_resources: 0,
          },
        };
      }

      const resourceList = resources || [];
      const total_resources = resourceList.length;
      const completed_resources = resourceList.filter((r) => r.status === "completed").length;
      const in_progress_resources = resourceList.filter((r) => r.status === "in-progress").length;
      const total_progress = resourceList.reduce((sum, r) => sum + (r.progress || 0), 0);
      const total_progress_percentage = total_resources > 0 ? total_progress / total_resources : 0;
      const favorite_resources = resourceList.filter((r) => r.is_favorite).length;

      return {
        success: true,
        data: {
          total_resources,
          completed_resources,
          in_progress_resources,
          total_progress_percentage,
          favorite_resources,
        },
      };
    } catch (error: any) {
      console.error("Exception in getUserStats:", error);
      return { success: false, data: null } as any;
    }
  },

  // Get categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Exception in getCategories:", error);
      return { success: false, error: error.message };
    }
  },

  // Create resource
  // Create resource (VERSION: WHITELIST SAFE)
  async createResource(resource: any): Promise<ApiResponse<Resource>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // 1. SANITASI DATA: Hanya ambil field yang valid
      const cleanPayload = {
        title: resource.title,
        description: resource.description,
        category_id: resource.category_id === "" ? null : resource.category_id, // Ubah string kosong jadi null
        source_type: resource.source_type,
        url: resource.url,
        level: resource.level,
        priority: resource.priority,
        status: resource.status,
        progress: resource.progress || 0,
        is_favorite: resource.is_favorite || false,
        is_public: resource.is_public || false,
        user_id: user.id, // Wajib ada untuk insert
      };

      // Hapus field undefined
      Object.keys(cleanPayload).forEach((key) => {
        if ((cleanPayload as any)[key] === undefined) {
          delete (cleanPayload as any)[key];
        }
      });

      console.log("Sending Clean Create Payload:", cleanPayload);

      const { data, error } = await supabase.from("resources").insert([cleanPayload]).select().single();

      if (error) {
        console.error("Supabase Create Error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error("Exception in createResource:", error);
      return { success: false, error: error.message };
    }
  },

  // Update resource (VERSION: WHITELIST SAFE)
  async updateResource(id: string, updates: Partial<Resource>): Promise<ApiResponse<Resource>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // 1. SANITASI DATA (Hanya ambil field yang ada di tabel database)
      // Kita buat object baru yang bersih, jangan kirim object 'updates' mentah-mentah
      const cleanPayload = {
        title: updates.title,
        description: updates.description,
        category_id: updates.category_id === "" ? null : updates.category_id, // Cegah string kosong
        source_type: updates.source_type,
        url: updates.url,
        level: updates.level,
        priority: updates.priority,
        status: updates.status,
        progress: updates.progress,
        is_favorite: updates.is_favorite,
      };

      // Hapus field yang undefined (tidak diubah)
      Object.keys(cleanPayload).forEach((key) => {
        if ((cleanPayload as any)[key] === undefined) {
          delete (cleanPayload as any)[key];
        }
      });

      console.log("Sending Clean Payload:", cleanPayload); // Cek console

      const { data, error } = await supabase
        .from("resources")
        .update(cleanPayload)
        .eq("id", id)
        .eq("user_id", user.id) // Pastikan milik user sendiri
        .select()
        .single();

      if (error) {
        console.error("Supabase Update Error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error("System Update Error:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete resource
  async deleteResource(id: string): Promise<ApiResponse<null>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { error } = await supabase.from("resources").delete().eq("id", id).eq("user_id", user.id);

      if (error) {
        console.error("Error deleting resource:", error);
        return { success: false, error: error.message };
      }

      return { success: true, data: null };
    } catch (error: any) {
      console.error("Exception in deleteResource:", error);
      return { success: false, error: error.message };
    }
  },
};
