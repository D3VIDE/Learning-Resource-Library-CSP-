"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Plus, Filter } from "lucide-react";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    category: string;
    level: string;
    priority: string;
    status: string;
  };
  setFilters: (filters: any) => void;
  onAddResource: () => void;
  categories: any[];
}

export function SearchAndFilter({ searchQuery, setSearchQuery, filters, setFilters, onAddResource, categories }: SearchAndFilterProps) {
  const updateFilter = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value === "all" ? "" : value });
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Baris Atas: Search dan Tombol Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search by title or description..." className="pl-10 bg-white border-gray-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button onClick={onAddResource} className="bg-black text-white hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      </div>

      {/* Baris Bawah: Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center text-gray-500 text-sm mr-2">
          <Filter className="w-4 h-4 mr-2" />
          <span>Filters:</span>
        </div>

        {/* Filter Category */}
        <Select value={filters.category || "all"} onValueChange={(v) => updateFilter("category", v)}>
          <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Level */}
        <Select value={filters.level || "all"} onValueChange={(v) => updateFilter("level", v)}>
          <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Priority */}
        <Select value={filters.priority || "all"} onValueChange={(v) => updateFilter("priority", v)}>
          <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200">
            <SelectValue placeholder="All Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Status */}
        <Select value={filters.status || "all"} onValueChange={(v) => updateFilter("status", v)}>
          <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
