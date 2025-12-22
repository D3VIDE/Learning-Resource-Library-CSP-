"use client";

import { Card, CardContent } from "./ui/card";
import { BookOpen, Clock, CheckCircle2, TrendingUp } from "lucide-react";

// Kita definisikan data apa yang dibutuhkan komponen ini
interface StatsCardProps {
  total: number;
  inProgress: number;
  completed: number;
  avgProgress: number;
}

// Hapus logic fetching (useEffect/useState) agar komponen ini ringan
export function StatsCard({ total, inProgress, completed, avgProgress }: StatsCardProps) {
  // Konfigurasi tampilan untuk setiap kartu agar kodenya rapi
  const stats = [
    {
      label: "Total Resources",
      value: total,
      icon: <BookOpen className="w-4 h-4 text-blue-600" />,
      bg: "bg-blue-50",
      textColor: "text-blue-900",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: <Clock className="w-4 h-4 text-orange-600" />,
      bg: "bg-orange-50",
      textColor: "text-orange-900",
    },
    {
      label: "Completed",
      value: completed,
      icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      bg: "bg-green-50",
      textColor: "text-green-900",
    },
    {
      label: "Avg Progress",
      value: `${Math.round(avgProgress)}%`,
      icon: <TrendingUp className="w-4 h-4 text-purple-600" />,
      bg: "bg-purple-50",
      textColor: "text-purple-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
