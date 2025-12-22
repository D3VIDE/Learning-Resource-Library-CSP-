import { supabase } from "../client";
import { Resource, ApiResponse, Category } from "../types";

// Helper: Upload file ke Storage Bucket 'library'
const uploadFilesToStorage = async (userId: string, resourceId: string, files: File[]) => {
  const uploadedFiles = [];

  for (const file of files) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileExt = cleanFileName.split('.').pop();
      // Buat path unik: UserID/ResourceID/Timestamp_NamaFile
      const filePath = `${userId}/${resourceId}/${Date.now()}_${cleanFileName}`;

      // 2. Upload ke bucket 'library'
      const { error: uploadError } = await supabase.storage
        .from('library') // <--- SUDAH DIGANTI KE 'library'
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Dapatkan Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('library') // <--- SUDAH DIGANTI KE 'library'
        .getPublicUrl(filePath);

      // 4. Masukkan ke array hasil
      uploadedFiles.push({
        resource_id: resourceId,
        file_name: file.name, 
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type
      });
      
    } catch (error) {
      console.error(`Gagal upload ${file.name}:`, error);
    }
  }
  
  return uploadedFiles;
};

export const resourceService = {
  // 1. GET RESOURCES (Tetap sama)
  async getResources(): Promise<ApiResponse<Resource[]>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("resources")
      .select(`
        *,
        category:categories(*),
        links:resource_links(*),
        files:resource_files(*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  },

  // 2. GET CATEGORIES (Tetap sama)
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  },

  // 3. CREATE RESOURCE (Updated)
  async createResource(payload: any): Promise<ApiResponse<Resource>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // A. Simpan Resource Utama
      const { data: resource, error } = await supabase
        .from("resources")
        .insert([{
            user_id: user.id,
            title: payload.title,
            description: payload.description,
            category_id: payload.category_id || null,
            level: payload.level,
            priority: payload.priority,
            status: payload.status,
            progress: payload.progress,
            source_type: 'mixed',
        }])
        .select()
        .single();

      if (error) throw error;

      // B. Simpan Links
      if (payload.links && payload.links.length > 0) {
        const linksData = payload.links.map((link: any) => ({
          resource_id: resource.id,
          title: link.title,
          url: link.url
        }));
        await supabase.from("resource_links").insert(linksData);
      }

      // C. UPLOAD FILES KE 'library'
      if (payload.files && payload.files.length > 0) {
        const filesData = await uploadFilesToStorage(user.id, resource.id, payload.files);
        
        if (filesData.length > 0) {
          await supabase.from("resource_files").insert(filesData);
        }
      }

      return { success: true, data: resource };
    } catch (error: any) {
      console.error("Create Error:", error.message);
      return { success: false, error: error.message };
    }
  },

  // 4. UPDATE RESOURCE (Updated)
  async updateResource(id: string, payload: any): Promise<ApiResponse<Resource>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Not authenticated" };

      // A. Update Resource Utama
      const { data: resource, error } = await supabase
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
        .select()
        .single();

      if (error) throw error;

      // B. Handle Links
      if (payload.links) {
        await supabase.from("resource_links").delete().eq("resource_id", id);
        if (payload.links.length > 0) {
          const linksData = payload.links.map((link: any) => ({
            resource_id: id,
            title: link.title,
            url: link.url
          }));
          await supabase.from("resource_links").insert(linksData);
        }
      }

      // C. Handle Files (Upload baru ke 'library' & Insert DB)
      if (payload.files && payload.files.length > 0) {
        const filesData = await uploadFilesToStorage(user.id, id, payload.files);
        if (filesData.length > 0) {
          await supabase.from("resource_files").insert(filesData);
        }
      }

      return { success: true, data: resource };
    } catch (error: any) {
      console.error("Update Error:", error.message);
      return { success: false, error: error.message };
    }
  },

  // 5. DELETE RESOURCE
  async deleteResource(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  },
};