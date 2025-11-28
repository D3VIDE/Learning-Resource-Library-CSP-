//Form untuk menghandle login dan register

import { useState } from "react";
import {motion} from 'motion/react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {login,signup} from '../lib/auth';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { toast } from 'sonner';
import { BookOpen, Loader2, Moon, Sun } from 'lucide-react';

interface AuthFormProps {
  onLoginSuccess: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function AuthForm({onLoginSuccess,theme,onToggleTheme}: AuthFormProps){
  const [isLogin,setIsLogin] = useState(true)
  const [name,setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try{
      if (isLogin){
        const result = await login(email,password)
        if(result.success){
          toast.success('Login successful!');
          onLoginSuccess();
        }else{
          toast.error(result.error || 'Login Failed')
        }

      }else{
        const result = await signup(name, email, password);
        if (result.success) {
          toast.success('Account created! Please login.');
          setIsLogin(true);
          setName('');
          setPassword('');
        } else {
          toast.error(result.error || 'Signup failed');
        }
      }
    }catch(error){
      toast.error('An error occured')
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/10">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="rounded-full"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </motion.div>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-2">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex justify-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-2xl">Learning Resource Library</CardTitle>
              <CardDescription className="mt-2">
                {isLogin ? 'Welcome back! Please login to continue' : 'Create your account to get started'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  isLogin ? 'Login' : 'Sign Up'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLogin(!isLogin);
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="w-full"
            >
              {isLogin ? 'Create Account' : 'Login Instead'}
            </Button>

            {isLogin && (
              <p className="text-xs text-center text-muted-foreground">
                Demo: You can create a test account or use any existing account
              </p>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}