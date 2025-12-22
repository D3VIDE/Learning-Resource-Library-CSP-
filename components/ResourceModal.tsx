"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Resource, Category } from "../lib/types";
import { resourceService } from "../lib/services/resourceService";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, FileText } from "lucide-react";

interface ResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
  onSuccess: () => void;
  // KITA TAMBAHKAN PROPS INI: Menerima kategori dari parent (Dashboard)
  categories?: Category[];
}

export function ResourceModal({
  open,
  onOpenChange,
  resource,
  onSuccess,
  categories: initialCategories = [], // Default array kosong jika tidak dikirim
}: ResourceModalProps) {
  const [loading, setLoading] = useState(false);
  // State kategori lokal
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const [activeTab, setActiveTab] = useState<"link" | "file">("link");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    source_type: "link" as "link" | "file",
    url: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    priority: "medium" as "low" | "medium" | "high",
    status: "not-started" as "not-started" | "in-progress" | "completed",
    progress: 0,
    is_favorite: false,
  });

  useEffect(() => {
    if (open) {
      // LOGIKA BARU: Jika data dari Dashboard ada, pakai itu. Jika tidak, baru fetch sendiri.
      if (initialCategories && initialCategories.length > 0) {
        setCategories(initialCategories);
      } else {
        loadCategories(); // Fallback: ambil sendiri jika parent lupa ngasih
      }

      // Setup Form Data (Edit vs New)
      if (resource) {
        setFormData({
          title: resource.title,
          description: resource.description || "",
          category_id: resource.category_id || "",
          source_type: resource.source_type,
          url: resource.url || "",
          level: resource.level,
          priority: resource.priority,
          status: resource.status,
          progress: resource.progress,
          is_favorite: resource.is_favorite,
        });
        setActiveTab(resource.source_type);
      } else {
        setFormData({
          title: "",
          description: "",
          category_id: "",
          source_type: "link",
          url: "",
          level: "beginner",
          priority: "medium",
          status: "not-started",
          progress: 0,
          is_favorite: false,
        });
        setActiveTab("link");
      }
    }
  }, [open, resource, initialCategories]);

  // Sinkronisasi Tab dengan formData
  useEffect(() => {
    setFormData((prev) => ({ ...prev, source_type: activeTab }));
  }, [activeTab]);

  const loadCategories = async () => {
    try {
      const result = await resourceService.getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) return toast.error("Judul wajib diisi");
    if (!formData.category_id) return toast.error("Kategori wajib dipilih");
    if (activeTab === "link" && !formData.url) return toast.error("URL wajib diisi");

    setLoading(true);

    try {
      const payload = {
        ...formData,
        progress: parseInt(formData.progress.toString()) || 0,
      };

      let result;
      if (resource) {
        result = await resourceService.updateResource(resource.id, payload);
      } else {
        result = await resourceService.createResource(payload);
      }

      if (result.success) {
        toast.success(resource ? "Resource updated!" : "Resource created!");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
          <DialogDescription>Fill in the details of your learning resource below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Introduction to Machine Learning" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this learning resource..." className="resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={formData.level} onValueChange={(val: any) => setFormData({ ...formData, level: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(val: any) => setFormData({ ...formData, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <Label>Progress</Label>
              <span className="text-sm font-bold">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab("link")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === "link" ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
              >
                <LinkIcon className="w-4 h-4" /> Links
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === "file" ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
              >
                <FileText className="w-4 h-4" /> Files
              </button>
            </div>

            {activeTab === "link" ? (
              <Input placeholder="https://example.com/course" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toast.info("Fitur upload file belum tersedia, gunakan Link dulu ya!")}>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload file (Coming Soon)</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
