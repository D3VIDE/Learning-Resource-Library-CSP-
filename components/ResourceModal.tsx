"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Resource, Category, ResourceLink } from "../lib/types";
import { resourceService } from "../lib/services/resourceService";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, FileText, Plus, X, Trash2, Globe, File, LayoutGrid, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils"; // Pastikan kamu punya utility ini (standar shadcn)

interface ResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource;
  onSuccess: () => void;
  categories?: Category[];
}

export function ResourceModal({ open, onOpenChange, resource, onSuccess, categories = [] }: ResourceModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "file">("link");

  const [newLink, setNewLink] = useState<ResourceLink>({ title: "", url: "" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    level: "beginner" as const,
    priority: "medium" as const,
    status: "not-started" as const,
    progress: 0,
    links: [] as ResourceLink[],
    files: [] as File[],
  });

  useEffect(() => {
    if (open) {
      if (resource) {
        setFormData({
        title: "",
        description: "",
        category_id: "",
        level: "beginner" as "beginner" | "intermediate" | "advanced",
        priority: "medium" as "low" | "medium" | "high",
        status: "not-started" as "not-started" | "in-progress" | "completed",
        progress: 0,
        links: [] as ResourceLink[],
        files: [] as File[],
        });
      } else {
        setFormData({
          title: "", description: "", category_id: "",
          level: "beginner", priority: "medium", status: "not-started",
          progress: 0, links: [], files: [],
        });
        setActiveTab("link");
      }
    }
  }, [open, resource]);

  // --- LOGIC HANDLERS (Sama seperti sebelumnya) ---
  const addLinkAction = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return toast.error("Please enter both title and URL");
    setFormData(prev => ({ ...prev, links: [...prev.links, newLink] }));
    setNewLink({ title: "", url: "" });
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required");
    
    setLoading(true);
    try {
      let result;
      // Note: Logic upload file fisik harus dihandle di service
      if (resource?.id) {
        result = await resourceService.updateResource(resource.id, formData as any);
      } else {
        result = await resourceService.createResource(formData as any);
      }

      if (result.success) {
        toast.success(resource ? "Resource updated" : "Resource created");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to save");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">
        
        {/* HEADER */}
        <DialogHeader className="p-6 pb-4 border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {resource ? "Edit Resource" : "Create Resource"}
              </DialogTitle>
              <DialogDescription>
                Add details, manage links, and upload files.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-8">
            
            {/* SECTION 1: MAIN INFO */}
            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground/80">Title</Label>
                <Input
                  id="title"
                  className="h-11 bg-muted/30 focus:bg-background transition-all font-medium text-lg"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Advanced System Design"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc" className="text-foreground/80">Description</Label>
                <Textarea
                  id="desc"
                  className="min-h-[80px] bg-muted/30 focus:bg-background resize-none transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this resource about?"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                    <SelectTrigger className="h-10 bg-muted/30"><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }} />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger className="h-10 bg-muted/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={formData.level} onValueChange={(val: any) => setFormData({ ...formData, level: val })}>
                    <SelectTrigger className="h-10 bg-muted/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(val: any) => setFormData({ ...formData, priority: val })}>
                    <SelectTrigger className="h-10 bg-muted/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* SECTION 2: PROGRESS */}
            <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border/50">
               <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-foreground">Learning Progress</Label>
                </div>
                <span className="text-sm font-bold bg-background px-2 py-1 rounded border shadow-sm">{formData.progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full h-2 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/90 transition-all"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              />
            </div>

            {/* SECTION 3: ASSETS (Tabs Styled) */}
            <div className="space-y-4">
               <Label className="text-base font-semibold">Attachments</Label>
               
               <div className="bg-muted/40 p-1 rounded-lg flex gap-1 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setActiveTab("link")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                      activeTab === "link" ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                  >
                    <LinkIcon className="w-4 h-4" /> 
                    External Links 
                    {formData.links.length > 0 && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1">{formData.links.length}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("file")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      activeTab === "file" ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                  >
                    <FileText className="w-4 h-4" /> 
                    Uploaded Files
                     {formData.files.length > 0 && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full ml-1">{formData.files.length}</span>}
                  </button>
               </div>

               <div className="min-h-[150px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === "link" ? (
                    <div className="space-y-4">
                      {/* Add Link Form */}
                      <div className="flex gap-2 items-start">
                        <div className="grid gap-2 flex-1">
                          <div className="relative">
                            <Input 
                              placeholder="Title (e.g. Official Documentation)" 
                              className="bg-muted/30 pl-9"
                              value={newLink.title}
                              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                            />
                            <FileText className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                          <div className="relative">
                            <Input 
                              placeholder="https://..." 
                              className="bg-muted/30 pl-9"
                              value={newLink.url}
                              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                            />
                             <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                        <Button type="button" onClick={addLinkAction} className="h-[88px] w-14" variant="secondary">
                           <Plus className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Links List */}
                      {formData.links.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {formData.links.map((link, i) => (
                            <div key={i} className="group flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-all hover:shadow-sm">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                  <LinkIcon className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-semibold truncate">{link.title}</span>
                                  <span className="text-xs text-muted-foreground truncate">{link.url}</span>
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeLink(i)} 
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* File Upload Zone */}
                      <div className="relative group border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer">
                        <input
                          type="file"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleFileChange}
                        />
                        <div className="flex flex-col items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                             <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX (Max 10MB)</p>
                          </div>
                        </div>
                      </div>

                      {/* Files List */}
                      {formData.files.length > 0 && (
                        <div className="grid gap-2">
                          {formData.files.map((file, i) => (
                            <div key={i} className="group flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-all">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                                  <File className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-semibold truncate">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeFile(i)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
               </div>
            </div>

          </div>

          <DialogFooter className="p-6 pt-2 border-t border-border/40 bg-muted/10 sticky bottom-0 z-10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[140px]">
              {loading ? "Saving..." : resource ? "Update Changes" : "Create Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}