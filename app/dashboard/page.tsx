"use client"
import { useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import {motion, AnimatePresence} from 'motion/react';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Select, SelectContent, SelectItem,SelectTrigger,SelectValue} from '../../components/ui/select';
import {DropdownMenu, DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger} from '../../components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  LogOut,
  User,
  Moon,
  Sun,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';

import { Header } from '@/components/Header';
import { useAuthContext } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { StatsCards } from "@/components/StatsCard";

// Mock data sementara
const mockResources = [
  {
    id: '1',
    title: 'React Documentation',
    description: 'Official React documentation and guides',
    category: 'Frontend',
    level: 'beginner',
    status: 'in-progress',
    progress: 75,
    url: 'https://reactjs.org',
  },
  {
    id: '2',
    title: 'TypeScript Handbook',
    description: 'Complete TypeScript guide',
    category: 'Programming',
    level: 'intermediate',
    status: 'not-started',
    progress: 0,
    url: 'https://www.typescriptlang.org',
  },
  {
    id: '3',
    title: 'Next.js Tutorial',
    description: 'Learn Next.js step by step',
    category: 'Fullstack',
    level: 'beginner',
    status: 'completed',
    progress: 100,
    url: 'https://nextjs.org',
  },
  {
    id: '4',
    title: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    category: 'Frontend',
    level: 'beginner',
    status: 'in-progress',
    progress: 50,
    url: 'https://tailwindcss.com',
  },
];  

export default function Dashboard() {
  const {user,logout,loading:authLoading} = useAuthContext();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
   const [resources] = useState(mockResources);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

    useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

    const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

    const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

    if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Jika tidak ada user, return null (akan redirect di useEffect)
  if (!user) {
    return null;
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
        {/* Simple welcome message dulu */}
        <StatsCards resources={resources} />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Selamat datang di Dashboard!</h2>
          <p className="text-muted-foreground">
            Mulai kelola resource belajar Anda.
          </p>
        </div>
      </main>
    </div>
  );
}