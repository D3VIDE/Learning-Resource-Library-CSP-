import { supabase } from "../client";
import { Resource, ResourceStats, ApiResponse, Category } from "../types";

export const resourceService = {
  // --- 1. GET ALL RESOURCES ---
  async getResources(): Promise<ApiResponse<Resource[]>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { data, error } = await supabase.from("resources").select(`*, category:categories(*)`).eq("user_id", user.id).order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching resources:", error);
        return { success: false, error: error.message };
      }
      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // --- 2. GET CATEGORIES ---
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");

      if (error) return { success: false, error: error.message };
      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // --- 3. CREATE (ADD) RESOURCE ---
  async createResource(resource: any): Promise<ApiResponse<Resource>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // Bersihkan Payload
      const cleanPayload = {
        title: resource.title,
        description: resource.description,
        category_id: resource.category_id === "" ? null : resource.category_id,
        source_type: resource.source_type,
        url: resource.url,
        level: resource.level,
        priority: resource.priority,
        status: resource.status,
        progress: resource.progress || 0,
        is_favorite: resource.is_favorite || false,
        user_id: user.id,
      };

      // Hapus undefined
      Object.keys(cleanPayload).forEach((key) => {
        if ((cleanPayload as any)[key] === undefined) delete (cleanPayload as any)[key];
      });

      console.log("SERVICE LOG: Creating New Resource...", cleanPayload);

      const { data, error } = await supabase.from("resources").insert([cleanPayload]).select().single();

      if (error) {
        console.error("Supabase Create Error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error("Exception createResource:", error);
      return { success: false, error: error.message };
    }
  },

  // --- 4. UPDATE (EDIT) RESOURCE ---
  // Pastikan fungsi ini TERPISAH dan berbeda dari createResource
  async updateResource(id: string, updates: Partial<Resource>): Promise<ApiResponse<Resource>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // Bersihkan Payload (Sama dengan create, tapi tanpa user_id)
      const cleanPayload = {
        title: updates.title,
        description: updates.description,
        category_id: updates.category_id === "" ? null : updates.category_id,
        source_type: updates.source_type,
        url: updates.url,
        level: updates.level,
        priority: updates.priority,
        status: updates.status,
        progress: updates.progress,
        is_favorite: updates.is_favorite,
      };

      // Hapus undefined
      Object.keys(cleanPayload).forEach((key) => {
        if ((cleanPayload as any)[key] === undefined) delete (cleanPayload as any)[key];
      });

      console.log("SERVICE LOG: Updating Resource ID:", id, cleanPayload);

      const { data, error } = await supabase
        .from("resources")
        .update(cleanPayload)
        .eq("id", id)
        .eq("user_id", user.id) // Security check
        .select()
        .single();

      if (error) {
        console.error("Supabase Update Error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error("Exception updateResource:", error);
      return { success: false, error: error.message };
    }
  },

  // --- 5. DELETE RESOURCE ---
  async deleteResource(id: string): Promise<ApiResponse<null>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      const { error } = await supabase.from("resources").delete().eq("id", id).eq("user_id", user.id);

      if (error) return { success: false, error: error.message };
      return { success: true, data: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // --- 6. STATS (Placeholder) ---
  async getUserStats(): Promise<ApiResponse<ResourceStats>> {
    try {
      // Logic statistik manual bisa ditaruh sini jika perlu
      return { success: true, data: null } as any;
    } catch (e) {
      return { success: false, error: "Stats error" };
    }
  },
};
