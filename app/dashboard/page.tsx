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