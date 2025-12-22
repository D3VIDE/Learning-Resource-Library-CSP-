"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { ResourceCard } from "@/components/ResourceCard";
import { ResourceModal } from "@/components/ResourceModal";
import { ResourceDetailModal } from "@/components/ResourceDetailModal"; // IMPORT BARU
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { useAuthContext } from "@/components/AuthProvider";
import { resourceService } from "@/lib/services/resourceService";
import { Resource, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Data State
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State (EDIT / ADD)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource>();

  // Modal State (DETAIL VIEW) - BARU
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailResource, setSelectedDetailResource] = useState<Resource>();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    priority: "",
    status: "",
  });

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const total = resources.length;
    const inProgress = resources.filter((r) => r.status === "in-progress").length;
    const completed = resources.filter((r) => r.status === "completed").length;

    const totalProgress = resources.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    const avgProgress = total > 0 ? totalProgress / total : 0;

    return { total, inProgress, completed, avgProgress };
  }, [resources]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [user, authLoading, router]);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resResult, catResult] = await Promise.all([resourceService.getResources(), resourceService.getCategories()]);

      if (resResult.success && resResult.data) setResources(resResult.data);
      if (catResult.success && catResult.data) setCategories(catResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  // LOGIKA FILTERING
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()));

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
      try {
        await logout();
        toast.success("Berhasil keluar. Sampai jumpa!");
        router.push("/auth");
      } catch (error) {
        toast.error("Gagal logout, silakan coba lagi.");
      }
    };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      const result = await resourceService.deleteResource(id);
      if (result.success) {
        toast.success("Resource deleted");
        loadData();
      } else {
        toast.error(result.error || "Failed to delete resource");
      }
    }
  };

  // Fungsi Helper saat klik Edit
  const handleEditClick = (res: Resource) => {
    setSelectedResource(res);
    setModalOpen(true);
  };

  // Fungsi Helper saat klik View Detail
  const handleViewClick = (res: Resource) => {
    setSelectedDetailResource(res);
    setDetailOpen(true);
  };

  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name || user.email}!</p>
        </div>

        <div className="mb-8">
          <StatsCard total={stats.total} inProgress={stats.inProgress} completed={stats.completed} avgProgress={stats.avgProgress} />
        </div>

        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          onAddResource={() => {
            setSelectedResource(undefined); // Reset form untuk add baru
            setModalOpen(true);
          }}
          categories={categories}
        />

        <div className="mb-6">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-gray-300 mx-auto" />
              <p className="mt-4 text-gray-500">Loading your resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500 mb-4 text-lg">No resources found.</p>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add New Resource
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                // UPDATE: Bungkus ResourceCard dengan div yang bisa diklik untuk membuka detail
                <div key={resource.id} onClick={() => handleViewClick(resource)} className="cursor-pointer h-full">
                  <ResourceCard
                    resource={resource}
                    // Kita cegah event bubbling agar tombol edit/delete di card tidak membuka detail
                    onEdit={(res) => {
                      handleEditClick(res);
                    }}
                    onDelete={(id) => {
                      handleDelete(id);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 1. EDIT / ADD MODAL */}
      <ResourceModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedResource(undefined);
        }}
        resource={selectedResource}
        onSuccess={loadData}
        categories={categories}
      />

      {/* 2. DETAIL MODAL (NEW) */}
      <ResourceDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        resource={selectedDetailResource}
        onEdit={(res) => {
          // Tutup detail, buka edit
          setDetailOpen(false);
          setTimeout(() => handleEditClick(res), 100); // Delay sedikit agar transisi halus
        }}
      />
    </div>
  );
}
