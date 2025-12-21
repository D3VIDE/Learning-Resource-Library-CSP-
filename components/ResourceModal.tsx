"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Resource, Category } from "../lib/types"
import { resourceService } from "../lib/services/resourceService"
import { toast } from "sonner"

interface ResourceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource?: Resource
  onSuccess: () => void
}

export function ResourceModal({ open, onOpenChange, resource, onSuccess }: ResourceModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
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
    is_favorite: false
  })

  useEffect(() => {
    if (open) {
      loadCategories()
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
          is_favorite: resource.is_favorite
        })
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
          is_favorite: false
        })
      }
    }
  }, [open, resource])

  const loadCategories = async () => {
    const result = await resourceService.getCategories()
    if (result.success && result.data) {
      setCategories(result.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (resource) {
        const result = await resourceService.updateResource(resource.id, {
          ...formData,
          progress: parseInt(formData.progress.toString())
        })
        if (result.success) {
          toast.success("Resource updated successfully")
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.error || "Failed to update resource")
        }
      } else {
        const result = await resourceService.createResource({
          ...formData,
          progress: parseInt(formData.progress.toString())
        })
        if (result.success) {
          toast.success("Resource created successfully")
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(result.error || "Failed to create resource")
        }
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {resource ? "Edit Resource" : "Add New Resource"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({...formData, category_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value: any) => setFormData({...formData, level: value})}
              >
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
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({...formData, priority: value})}
              >
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({...formData, status: value})}
              >
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

          <div className="space-y-2">
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_type">Resource Type</Label>
            <Select
              value={formData.source_type}
              onValueChange={(value: any) => setFormData({...formData, source_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="link">Website Link</SelectItem>
                <SelectItem value="file">File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.source_type === "link" && (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                placeholder="https://example.com"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : resource ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}