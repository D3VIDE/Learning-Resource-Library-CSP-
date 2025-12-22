"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { ResourceCard } from "@/components/ResourceCard";
import { ResourceModal } from "@/components/ResourceModal";
import { SearchAndFilter } from "@/components/SearchAndFilter"; // Import komponen baru
import { useAuthContext } from "@/components/AuthProvider";
import { resourceService } from "@/lib/services/resourceService";
import { Resource, Category } from "@/lib/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Fallback jika list kosong
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Data State
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // State untuk kategori filter

  // Loading State
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource>();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    priority: "",
    status: "",
  });

  // Auth Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Theme Init
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // Load Data Initial
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch Resources dan Categories secara paralel
      const [resResult, catResult] = await Promise.all([resourceService.getResources(), resourceService.getCategories()]);

      if (resResult.success && resResult.data) {
        setResources(resResult.data);
      } else {
        toast.error("Failed to load resources");
      }

      if (catResult.success && catResult.data) {
        setCategories(catResult.data);
      }
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  // LOGIKA FILTERING (Client Side)
  // Kita filter resources berdasarkan search query DAN dropdown filters
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // 1. Filter Search (Title atau Description)
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Filter Dropdowns
      const matchesCategory = filters.category ? res.category_id === filters.category : true;
      const matchesLevel = filters.level ? res.level === filters.level : true;
      const matchesPriority = filters.priority ? res.priority === filters.priority : true;
      const matchesStatus = filters.status ? res.status === filters.status : true;

      return matchesSearch && matchesCategory && matchesLevel && matchesPriority && matchesStatus;
    });
  }, [resources, searchQuery, filters]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      const result = await resourceService.deleteResource(id);
      if (result.success) {
        toast.success("Resource deleted");
        loadData(); // Reload data
      } else {
        toast.error(result.error || "Failed to delete resource");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name || user.email}! Track your learning progress here.</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCard />
        </div>

        {/* Search & Filter Component */}
        <SearchAndFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} filters={filters} setFilters={setFilters} onAddResource={() => setModalOpen(true)} categories={categories} />

        {/* Resources Grid */}
        <div className="mb-6">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-gray-300 mx-auto" />
              <p className="mt-4 text-gray-500">Loading your resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            // Empty State (Jika tidak ada data sama sekali atau hasil search 0)
            <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 mb-4 text-lg">No resources found matching your criteria.</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ category: "", level: "", priority: "", status: "" });
                }}
                variant="outline"
                className="mr-2"
              >
                Clear Filters
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add New Resource
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onEdit={(res) => {
                    setSelectedResource(res);
                    setModalOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <ResourceModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedResource(undefined);
        }}
        resource={selectedResource}
        onSuccess={loadData}
      />
    </div>
  );
}
