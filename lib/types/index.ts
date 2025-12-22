export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}

export interface Resource {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  category?: Category;
  

  // Data dari Supabase join akan masuk ke sini
  links?: ResourceLink[]; 
  files?: ResourceFile[];

  // Field lama (opsional, buat jaga-jaga backward compatibility)
  url?: string | null;
  file_name?: string | null;

  level: 'beginner' | 'intermediate' | 'advanced';
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
  source_type: string; 
  
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
}

export interface ResourceStats {
  total_resources: number
  completed_resources: number
  in_progress_resources: number
  total_progress_percentage: number
  favorite_resources: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface AuthResult {
  success: boolean
  user?: User | null
  error?: string
}

export interface ResourceLink {
  id?: string;
  title: string;
  url: string;
}

export interface ResourceFile {
  id?: string;
  file_name: string;
  file_url: string;
  file_size: number;
}