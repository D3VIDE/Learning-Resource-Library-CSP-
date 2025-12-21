"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { Header } from "@/components/Header"
import { StatsCard } from "@/components/StatsCard"
import { ResourceCard } from "@/components/ResourceCard"
import { ResourceModal } from "@/components/ResourceModal"
import { useAuthContext } from "@/components/AuthProvider"
import { resourceService } from "@/lib/services/resourceService"
import { Resource } from "@/lib/types"
import { toast } from "sonner"

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource>()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  useEffect(() => {
    if (user) {
      loadResources()
    }
  }, [user])

  const loadResources = async () => {
    setLoading(true)
    const result = await resourceService.getResources()
    if (result.success && result.data) {
      setResources(result.data)
    } else {
      toast.error("Failed to load resources")
    }
    setLoading(false)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/auth")
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      const result = await resourceService.deleteResource(id)
      if (result.success) {
        toast.success("Resource deleted")
        loadResources()
      } else {
        toast.error(result.error || "Failed to delete resource")
      }
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}!
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>

        <StatsCard />

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">My Resources</h2>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">No resources yet</p>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Resource
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onEdit={(resource) => {
                    setSelectedResource(resource)
                    setModalOpen(true)
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ResourceModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setSelectedResource(undefined)
        }}
        resource={selectedResource}
        onSuccess={loadResources}
      />
    </div>
  )
}