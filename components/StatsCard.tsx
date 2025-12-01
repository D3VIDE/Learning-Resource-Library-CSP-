// /components/dashboard/StatsCards.tsx
'use client';

import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  status: string;
  progress: number;
  url: string;
}

interface StatsCardsProps {
  resources: Resource[];
}

export function StatsCards({ resources }: StatsCardsProps) {
  // Calculate stats
  const total = resources.length;
  const completed = resources.filter(r => r.status === 'completed').length;
  const inProgress = resources.filter(r => r.status === 'in-progress').length;
  const avgProgress = total > 0 
    ? Math.round(resources.reduce((sum, r) => sum + r.progress, 0) / total)
    : 0;

  const cards = [
    {
      title: 'Total Resources',
      value: total,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Semua materi belajar'
    },
    {
      title: 'Sedang Dipelajari',
      value: inProgress,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Dalam progres'
    },
    {
      title: 'Selesai',
      value: completed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Sudah selesai'
    },
    {
      title: 'Rata-rata Progress',
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Progress rata-rata'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {card.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}