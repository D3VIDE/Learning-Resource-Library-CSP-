"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Plus,
  Upload,
  Link as LinkIcon,
  Loader2,
  FileText,
  BookOpen,
  CheckCircle2,
  Calendar,
  X,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { useAuthContext } from "@/components/AuthProvider"
import { resourceService } from "@/lib/services/resourceService"
import { Category } from "@/lib/types"
import { toast } from "sonner"

export default function AddResourcePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [newLink, setNewLink] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    source_type: "link" as "link" | "file",
    url: "",
    file: null as File | null,
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    priority: "medium" as "low" | "medium" | "high",
    status: "not-started" as "not-started" | "in-progress" | "completed",
    progress: 0,
    is_favorite: false,
    is_public: false
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    try {
      const result = await resourceService.getCategories()
      if (result.success && result.data) {
        setCategories(result.data)
      } else {
        console.error("Failed to load categories:", result.error)
      }
    } catch (err) {
      console.error("Error loading categories:", err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files])
      setFormData(prev => ({ ...prev, source_type: "file" }))
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    if (uploadedFiles.length === 1) {
      setFormData(prev => ({ ...prev, source_type: "link" }))
    }
  }

  const addLink = () => {
    if (newLink.trim()) {
      // Basic URL validation
      if (!newLink.startsWith('http://') && !newLink.startsWith('https://')) {
        toast.error("Please enter a valid URL starting with http:// or https://")
        return
      }
      
      setLinks(prev => [...prev, newLink])
      setNewLink("")
      if (links.length === 0 && uploadedFiles.length === 0) {
        setFormData(prev => ({ ...prev, source_type: "link" }))
      }
    }
  }

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validation
      if (!formData.title.trim()) {
        toast.error("Title is required")
        setLoading(false)
        return
      }

      // Determine source type based on input
      const sourceType = uploadedFiles.length > 0 ? "file" : "link"
      const resourceUrl = uploadedFiles.length === 0 && links.length > 0 ? links[0] : formData.url

      const resourceData = {
        title: formData.title,
        description: formData.description || undefined,
        category_id: formData.category_id || undefined,
        source_type: sourceType,
        url: sourceType === "link" ? (resourceUrl || undefined) : undefined,
        file_name: uploadedFiles.length > 0 ? uploadedFiles[0].name : undefined,
        file_size: uploadedFiles.length > 0 ? uploadedFiles[0].size : undefined,
        file_type: uploadedFiles.length > 0 ? uploadedFiles[0].type : undefined,
        file_url: undefined, // Will be set after storage upload
        level: formData.level,
        priority: formData.priority,
        status: formData.status,
        progress: parseInt(formData.progress.toString()) || 0,
        is_favorite: formData.is_favorite,
        is_public: formData.is_public
      }

      console.log("🟡 Sending resource data to API:", resourceData)

      const result = await resourceService.createResource(resourceData)
      
      console.log("🟢 API Response:", result)
      
      if (result.success) {
        toast.success("✅ Resource created successfully!")
        // Delay redirect to show success message
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        const errorMsg = result.error || "Failed to create resource"
        toast.error(`❌ ${errorMsg}`)
        setError(errorMsg)
      }
    } catch (error: any) {
      console.error("🔴 Error creating resource:", error)
      const errorMsg = error.message || "An unexpected error occurred"
      toast.error(`❌ ${errorMsg}`)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Learning Resource Library
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organizes your learning journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      {error && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              Check browser console (F12) for details
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Add New Resource
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Fill in the details of your learning resource
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Introduction to Machine Learning"
                    className="h-12 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe this learning resource..."
                    rows={3}
                    className="border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary resize-none"
                    disabled={loading}
                  />
                </div>

                {/* Category & Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category / Subject
                    </Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({...formData, category_id: value})}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="e.g., Mathematics, Computer Science" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: category.color || '#3B82F6' }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Level
                    </Label>
                    <div className="flex gap-2">
                      {["beginner", "intermediate", "advanced"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({...formData, level: level as any})}
                          disabled={loading}
                          className={`flex-1 py-2.5 px-4 rounded-lg border transition-all ${
                            formData.level === level
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
                          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span className="capitalize font-medium">{level}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Priority, Status, Progress */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </Label>
                    <div className="flex gap-2">
                      {["low", "medium", "high"].map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => setFormData({...formData, priority: priority as any})}
                          disabled={loading}
                          className={`flex-1 py-2.5 px-4 rounded-lg border transition-all ${
                            formData.priority === priority
                              ? priority === "low"
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : priority === "medium"
                                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                                : "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                              : "border-gray-300 dark:border-gray-600 hover:border-primary/50"
                          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span className="capitalize font-medium">{priority}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({...formData, status: value})}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            Not Started
                          </div>
                        </SelectItem>
                        <SelectItem value="in-progress">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="completed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Completed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="progress" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress
                    </Label>
                    <div className="relative">
                      <Input
                        id="progress"
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value) || 0})}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                        disabled={loading}
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>0%</span>
                        <span className="font-medium">{formData.progress}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Files & Links Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 px-2">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Files ({uploadedFiles.length})
                  </span>
                  <span className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Links ({links.length})
                  </span>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Files Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upload Files
                  </h3>
                  
                  <div className={`border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center transition-colors hover:border-primary/50 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt"
                      disabled={loading}
                    />
                    <Label
                      htmlFor="file-upload"
                      className={`cursor-pointer flex flex-col items-center gap-4 ${loading ? "cursor-not-allowed" : ""}`}
                    >
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Click to upload files or drag and drop
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          PDF, PPT, DOCX, XLSX, TXT
                        </p>
                      </div>
                    </Label>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Links Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Add Resource Links
                  </h3>

                  <div className="flex gap-2">
                    <Input
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="e.g., https://coursera.org/learn/machine-learning"
                      className="flex-1 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary"
                      disabled={loading}
                    />
                    <Button 
                      type="button" 
                      onClick={addLink}
                      className="bg-primary hover:bg-primary/90"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Links List */}
                  {links.length > 0 && (
                    <div className="space-y-3">
                      {links.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <LinkIcon className="h-5 w-5 text-gray-500" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {link}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(link, '_blank')}
                              disabled={loading}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLink(index)}
                              className="h-8 w-8 text-gray-500 hover:text-red-500"
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Debug Button - Hapus setelah testing */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log("Form Data:", formData)
                      console.log("Uploaded Files:", uploadedFiles)
                      console.log("Links:", links)
                    }}
                    className="text-xs"
                  >
                    Debug Log
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Create: {new Date().toLocaleDateString('en-US', { 
                      month: '2-digit', 
                      day: '2-digit', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="min-w-[120px] border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="min-w-[120px] bg-primary hover:bg-primary/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Resource
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}