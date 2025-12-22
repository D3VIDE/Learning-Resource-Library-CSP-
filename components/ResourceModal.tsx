"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Resource, Category } from "../lib/types";
import { resourceService } from "../lib/services/resourceService";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, FileText, X, CheckCircle2 } from "lucide-react";

interface ResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
  onSuccess: () => void;
}

export function ResourceModal({ open, onOpenChange, resource, onSuccess }: ResourceModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // State untuk tab upload (File vs Link)
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

  // Ref untuk input file (hidden)
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadCategories();
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
        // Reset form
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
  }, [open, resource]);

  // Sinkronisasi activeTab dengan formData.source_type
  useEffect(() => {
    setFormData((prev) => ({ ...prev, source_type: activeTab }));
  }, [activeTab]);

  const loadCategories = async () => {
    const result = await resourceService.getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        progress: parseInt(formData.progress.toString()),
      };

      if (resource) {
        const result = await resourceService.updateResource(resource.id, payload);
        if (result.success) {
          toast.success("Resource updated successfully");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to update resource");
        }
      } else {
        const result = await resourceService.createResource(payload);
        if (result.success) {
          toast.success("Resource created successfully");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to create resource");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{resource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
          <DialogDescription>Fill in the details of your learning resource below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Title Section */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium">
              Title *
            </Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Introduction to Machine Learning" className="bg-gray-50/50" />
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Describe this learning resource..."
              className="bg-gray-50/50 resize-none"
            />
          </div>

          {/* Grid Layout for Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-medium">
                Category / Subject
              </Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger className="bg-gray-50/50">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Type (Replacing Source input to match Logic) */}
            <div className="space-y-2">
              <Label htmlFor="level" className="font-medium">
                Level
              </Label>
              <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
                <SelectTrigger className="bg-gray-50/50">
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

          {/* Secondary Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="font-medium">
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger className="bg-gray-50/50">
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
              <Label htmlFor="status" className="font-medium">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-gray-50/50">
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

          {/* Progress Slider Section */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <Label htmlFor="progress" className="font-medium">
                Progress
              </Label>
              <span className="text-sm font-bold bg-white px-2 py-1 rounded border shadow-sm">{formData.progress}%</span>
            </div>
            {/* Custom Range Slider using standard HTML input styled with Tailwind */}
            <input
              id="progress"
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
            />
          </div>

          {/* Attachment / Source Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-full">
              <button
                type="button"
                onClick={() => setActiveTab("link")}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all ${activeTab === "link" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"}`}
              >
                <LinkIcon className="w-4 h-4" /> Links
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all ${activeTab === "file" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FileText className="w-4 h-4" /> Files
              </button>
            </div>

            <div className="min-h-[100px]">
              {activeTab === "link" ? (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="url">Resource URL</Label>
                  <Input id="url" type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com/course" className="bg-white" />
                </div>
              ) : (
                <div
                  className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      // Handle file selection logic here later
                      toast.info("File selection logic can be added here");
                    }}
                  />
                  <div className="bg-gray-100 p-3 rounded-full mb-3 group-hover:bg-gray-200 transition-colors">
                    <Upload className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Click to upload file</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-10 px-8">
              {loading ? "Saving..." : "Save Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
