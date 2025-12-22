import { supabase } from "../client";
import { Resource, ApiResponse, Category } from "../types";

// Helper: Upload file ke Storage Bucket 'library'
const uploadFilesToStorage = async (userId: string, resourceId: string, files: File[]) => {
  const uploadedFiles = [];

  for (const file of files) {
    try {
      // Sanitasi nama file
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const filePath = `${userId}/${resourceId}/${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await supabase.storage.from("library").upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("library").getPublicUrl(filePath);

      uploadedFiles.push({
        resource_id: resourceId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
      });
    } catch (error) {
      console.error(`Gagal upload ${file.name}:`, error);
    }
  }

  return uploadedFiles;
};

export const resourceService = {
  // 1. GET RESOURCES
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
          category:categories(*),
          links:resource_links(*),
          files:resource_files(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 2. GET CATEGORIES
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 3. CREATE RESOURCE
  async createResource(payload: any): Promise<ApiResponse<Resource>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // A. Simpan Resource Utama
      const { data: resourceData, error } = await supabase
        .from("resources")
        .insert([
          {
            user_id: user.id,
            title: payload.title,
            description: payload.description,
            category_id: payload.category_id || null,
            level: payload.level,
            priority: payload.priority,
            status: payload.status,
            progress: payload.progress,
            source_type: "mixed",
          },
        ])
        .select()
        .single(); // Untuk Create, .single() biasanya aman karena ID baru pasti unik

      if (error) throw error;
      const resource = resourceData;

      // B. Simpan Links
      if (payload.links && payload.links.length > 0) {
        const linksData = payload.links.map((link: any) => ({
          resource_id: resource.id,
          title: link.title,
          url: link.url,
        }));
        const { error: linkError } = await supabase.from("resource_links").insert(linksData);
        if (linkError) console.error("Error inserting links:", linkError);
      }

      // C. UPLOAD FILES
      if (payload.files && payload.files.length > 0) {
        const filesData = await uploadFilesToStorage(user.id, resource.id, payload.files);
        if (filesData.length > 0) {
          const { error: fileError } = await supabase.from("resource_files").insert(filesData);
          if (fileError) console.error("Error inserting files:", fileError);
        }
      }

      return { success: true, data: resource };
    } catch (error: any) {
      console.error("Create Error:", error.message);
      return { success: false, error: error.message };
    }
  },

  // 4. UPDATE RESOURCE (BAGIAN YANG DIPERBAIKI)
  async updateResource(id: string, payload: any): Promise<ApiResponse<Resource>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      console.log("Updating resource:", id, payload);

      // A. Update Resource Utama (HAPUS .single() AGAR TIDAK 406)
      const { data: updatedData, error } = await supabase
        .from("resources")
        .update({
          title: payload.title,
          description: payload.description,
          category_id: payload.category_id || null,
          level: payload.level,
          priority: payload.priority,
          status: payload.status,
          progress: payload.progress,
        })
        .eq("id", id)
        .select(); // Kita ambil array saja

      if (error) throw error;

      // Ambil item pertama dari array (jika ada)
      const resource = updatedData && updatedData.length > 0 ? updatedData[0] : null;

      // B. Handle Links (Delete All & Re-insert)
      if (payload.links) {
        // Hapus link lama
        const { error: delError } = await supabase.from("resource_links").delete().eq("resource_id", id);
        if (delError) console.error("Error deleting old links:", delError);

        // Insert link baru jika ada
        if (payload.links.length > 0) {
          const linksData = payload.links.map((link: any) => ({
            resource_id: id,
            title: link.title,
            url: link.url,
          }));
          const { error: insError } = await supabase.from("resource_links").insert(linksData);
          if (insError) console.error("Error inserting new links:", insError);
        }
      }

      // C. Handle Files (Upload baru & Insert DB)
      if (payload.files && payload.files.length > 0) {
        const filesData = await uploadFilesToStorage(user.id, id, payload.files);
        if (filesData.length > 0) {
          const { error: fileError } = await supabase.from("resource_files").insert(filesData);
          if (fileError) console.error("Error inserting new files:", fileError);
        }
      }

      return { success: true, data: resource as Resource };
    } catch (error: any) {
      console.error("Update Error:", error.message);
      return { success: false, error: error.message };
    }
  },

  // 5. DELETE RESOURCE
    async deleteResource(id: string): Promise<ApiResponse<null>> {
        try {
          // Supabase akan otomatis menghapus links & files terkait karena ON DELETE CASCADE di database
          const { error } = await supabase.from("resources").delete().eq("id", id);
          
          if (error) throw error;
          return { success: true, data: null };
        } catch (error: any) {
          console.error("Delete Error:", error.message);
          return { success: false, error: error.message };
        }
      },
    };
