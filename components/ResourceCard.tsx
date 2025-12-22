"use client";

import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Resource } from "../lib/types";
import { Edit2, Trash2, ExternalLink, FileText, PlayCircle, CheckCircle2, Clock, BookOpen, Eye } from "lucide-react";

interface ResourceCardProps {
  resource: Resource; /* Resource --> diambil dari index.ts  
                          links?: ResourceLink[]; 
                          files?: ResourceFile[];*/
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
}

export function ResourceCard({ resource, onEdit, onDelete }: ResourceCardProps) {
  // Warna Badge Priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 hover:bg-red-600 border-transparent text-white";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600 border-transparent text-white";
      case "low":
        return "bg-green-500 hover:bg-green-600 border-transparent text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Warna Teks Level
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-green-600";
      case "intermediate":
        return "text-orange-500";
      case "advanced":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  // Warna & Icon Status
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { color: "text-green-600", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> };
      case "in-progress":
        return { color: "text-blue-600", icon: <PlayCircle className="w-4 h-4 mr-1" /> };
      default:
        return { color: "text-gray-500", icon: <Clock className="w-4 h-4 mr-1" /> };
    }
  };

  const statusConfig = getStatusConfig(resource.status);

  // Helper untuk mendapatkan nama domain dari URL (misal: youtube.com)
  const getDomain = (url?: string) => {
    if (!url) return "No link";
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-white group flex flex-col h-full overflow-hidden">
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1 mr-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-1" title={resource.title}>
              {resource.title}
            </h3>

            {/* Badges Row */}
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className={`${getPriorityColor(resource.priority)} rounded px-2 py-0.5 capitalize font-medium`}>
                {resource.priority}
              </Badge>
              <span className={`font-semibold capitalize flex items-center ${getLevelColor(resource.level)}`}>• {resource.level}</span>
            </div>

            {/* Category Name */}
            <div className="flex items-center text-gray-500 text-xs pt-1">
              <BookOpen className="w-3 h-3 mr-1.5" />
              <span>{resource.category?.name || "Uncategorized"}</span>
            </div>
          </div>

          {/* Action Buttons (Muncul saat hover di desktop, atau selalu ada di mobile) */}
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resource.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
         
      <CardContent className="p-5 pt-2 flex-grow flex flex-col gap-4">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5" title="Attached Files">
            <FileText className="w-3 h-3" /> {resource.files?.length || 0}    
          </span>
          <span className="flex items-center gap-1.5" title="External Links">
            <ExternalLink className="w-3 h-3" /> {resource.links?.length || 0} 
          </span>
        </div>

        {/* Progress Section */}
        <div className="space-y-2 mt-auto">
          <div className={`flex items-center text-xs font-bold ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="capitalize flex-1">{resource.status.replace("-", " ")}</span>
            <span className="text-gray-700">{resource.progress}%</span>
          </div>
          {/* Custom Black Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gray-900 h-full rounded-full transition-all duration-500" style={{ width: `${resource.progress}%` }} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5" title="Attached Files">
            <FileText className="w-3 h-3" /> {resource.files?.length || 0}
          </span>
          <span className="flex items-center gap-1.5" title="External Links">
            <ExternalLink className="w-3 h-3" /> {resource.links?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 hover:text-black cursor-pointer transition-colors font-medium">
            <Eye className="w-3 h-3" /> View All
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
