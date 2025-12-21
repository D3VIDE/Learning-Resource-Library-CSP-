"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { ExternalLink, File, Star, Edit, Trash2 } from "lucide-react"
import { Resource } from "../lib/types"
import { useState } from "react"

interface ResourceCardProps {
  resource: Resource
  onEdit: (resource: Resource) => void
  onDelete: (id: string) => void
}

export function ResourceCard({ resource, onEdit, onDelete }: ResourceCardProps) {
  const [isFavorite, setIsFavorite] = useState(resource.is_favorite)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-orange-100 text-orange-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {resource.title}
              {isFavorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {resource.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(resource)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(resource.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={getLevelColor(resource.level)}>
              {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
            </Badge>
            <Badge className={getPriorityColor(resource.priority)}>
              {resource.priority.charAt(0).toUpperCase() + resource.priority.slice(1)} Priority
            </Badge>
            <Badge variant="outline">
              {resource.category?.name || 'Uncategorized'}
            </Badge>
            {resource.source_type === 'link' ? (
              <Badge variant="secondary">
                <ExternalLink className="h-3 w-3 mr-1" />
                Link
              </Badge>
            ) : (
              <Badge variant="secondary">
                <File className="h-3 w-3 mr-1" />
                File
              </Badge>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{resource.progress}%</span>
            </div>
            <Progress value={resource.progress} className="h-2" />
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Status: <span className="font-medium">{resource.status.replace('-', ' ')}</span>
            </span>
            <span>
              Added: {new Date(resource.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}