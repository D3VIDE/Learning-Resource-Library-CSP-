"use client";

import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Resource } from "../lib/types";
import { ExternalLink, FileText, BookOpen, Clock, Edit, Calendar } from "lucide-react";

interface ResourceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | undefined;
  onEdit: (resource: Resource) => void;
}

export function ResourceDetailModal({ open, onOpenChange, resource, onEdit }: ResourceDetailModalProps) {
  if (!resource) return null;

  // 1. HELPER: Format Tanggal (Aman tanpa date-fns)
  const formatDate = (dateString?: string) => {
    try {
      const date = dateString ? new Date(dateString) : new Date();
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // 2. HELPER: Safe URL Hostname (INI YANG MEMPERBAIKI ERROR KAMU)
  const getSafeHostname = (url?: string) => {
    if (!url) return "Local File";
    try {
      // Coba parse URL dengan standar browser
      return new URL(url).hostname;
    } catch (e) {
      // Jika gagal (misal user input "test" atau "google.com"),
      // kita kembalikan string aslinya saja, jangan crash.
      return url;
    }
  };

  // 3. HELPER: Safe URL Link (Agar href tidak error)
  const getSafeLink = (url?: string) => {
    if (!url) return "#";
    // Jika tidak ada http/https, kita anggap itu link eksternal dan tambahkan https://
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  // Helper warna badge
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return "bg-red-600 text-white hover:bg-red-700";
      case "medium":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "low":
        return "bg-green-500 text-white hover:bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  const getLevelColor = (l: string) => {
    switch (l) {
      case "beginner":
        return "text-green-600 bg-green-50";
      case "intermediate":
        return "text-orange-500 bg-orange-50";
      case "advanced":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-500";
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "in-progress":
        return "text-blue-600 bg-blue-50";
      case "completed":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl">
        {/* HEADER: Title & Edit Button */}
        <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
          <div className="space-y-3 pr-8">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{resource.title}</h2>

            {/* Tags Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${getPriorityColor(resource.priority)} rounded px-2.5 py-0.5 border-none capitalize`}>{resource.priority}</Badge>
              <Badge variant="outline" className={`${getLevelColor(resource.level)} border-transparent font-semibold capitalize`}>
                ● {resource.level}
              </Badge>
              <Badge variant="outline" className={`${getStatusColor(resource.status)} border-transparent font-semibold capitalize flex items-center gap-1`}>
                {resource.status === "in-progress" && <Clock className="w-3 h-3" />}
                {resource.status.replace("-", " ")}
              </Badge>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false); // Tutup detail
              onEdit(resource); // Buka edit
            }}
            className="gap-2 text-gray-600 border-gray-300"
          >
            <Edit className="w-4 h-4" /> Edit
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* INFO BOXES (Category & Source) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
              <div className="text-gray-400 text-xs font-medium mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Category
              </div>
              <div className="font-semibold text-gray-800">{resource.category?.name || "Uncategorized"}</div>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
              <div className="text-gray-400 text-xs font-medium mb-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Source
              </div>
              {/* Ganti new URL() dengan fungsi helper getSafeHostname */}
              <div className="font-semibold text-gray-800 break-all line-clamp-1">{getSafeHostname(resource.url)}</div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{resource.description || "No description provided for this resource."}</p>
          </div>

          {/* PROGRESS BAR (Big) */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-sm font-medium text-gray-500">Learning Progress</h3>
              <span className="font-bold text-lg">{resource.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-black h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${resource.progress}%` }} />
            </div>
          </div>

          {/* RESOURCES LIST (Links & Files) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {/* Online Resources Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Online Resources
              </h3>

              {resource.url ? (
                <a href={getSafeLink(resource.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate group-hover:text-blue-600">Click to open resource</div>
                    <div className="text-xs text-gray-400 truncate">{resource.url}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                </a>
              ) : (
                <p className="text-sm text-gray-400 italic">No external link attached.</p>
              )}
            </div>

            {/* Attached Files Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Attached Files
              </h3>
              {resource.source_type === "file" ? (
                <div className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Uploaded File</div>
                    <div className="text-xs text-gray-400">File handling coming soon</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No files attached.</p>
              )}
            </div>
          </div>

          {/* Footer Date */}
          <div className="pt-4 flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            Created at {formatDate(resource.created_at)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
