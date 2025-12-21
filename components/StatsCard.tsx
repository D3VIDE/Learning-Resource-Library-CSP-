"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { BookOpen, CheckCircle, TrendingUp, Star, Loader2 } from "lucide-react"
import { ResourceStats } from "../lib/types"
import { useEffect, useState } from "react"
import { resourceService } from "../lib/services/resourceService"

export function StatsCard() {
  const [stats, setStats] = useState<ResourceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    const result = await resourceService.getUserStats()
    if (result.success && result.data) {
      setStats(result.data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = stats || {
    total_resources: 0,
    completed_resources: 0,
    in_progress_resources: 0,
    total_progress_percentage: 0,
    favorite_resources: 0
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.total_resources}</div>
          <p className="text-xs text-muted-foreground">
            Semua materi belajar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.completed_resources}</div>
          <p className="text-xs text-muted-foreground">
            Selesai dipelajari
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(statsData.total_progress_percentage)}%</div>
          <p className="text-xs text-muted-foreground">
            Rata-rata progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Favorites</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statsData.favorite_resources}</div>
          <p className="text-xs text-muted-foreground">
            Materi favorit
          </p>
        </CardContent>
      </Card>
    </div>
  )
}