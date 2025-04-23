import { useState, useEffect, useCallback, memo } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, EyeOff } from "lucide-react";
// Optimize image loading with lazy loading
const mangaBg = new URL("../assets/manga-background.jpg", import.meta.url).href;

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Create forms
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Set up automatic redirection after login/registration success
  useEffect(() => {
    if (loginMutation.isSuccess || registerMutation.isSuccess) {
      navigate("/");
    }
  }, [loginMutation.isSuccess, registerMutation.isSuccess, navigate]);

  // Handle login form submission
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  // Handle registration form submission
  const onRegisterSubmit = (values: RegisterValues) => {
    const { username, password } = values;
    registerMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row items-stretch">
      {/* Left panel - Auth forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-gradient-to-b from-slate-900 to-slate-800">
        <Card className="w-full max-w-md border-gray-700 bg-slate-900/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Welcome to <span className="text-purple-400">Ani<span className="text-pink-500">Ex</span></span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Your ultimate anime streaming platform
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-800">
              <TabsTrigger value="login" className="text-white data-[state=active]:bg-purple-600">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-white data-[state=active]:bg-purple-600">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} className="bg-slate-800 border-gray-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showLoginPassword ? "text" : "password"} 
                                placeholder="Enter your password" 
                                {...field} 
                                className="bg-slate-800 border-gray-700 text-white pr-10" 
                              />
                            </FormControl>
                            <button 
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                            >
                              {showLoginPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Login
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-400 text-center">
                  Don't have an account? <span className="text-purple-400 cursor-pointer" onClick={() => setActiveTab("register")}>Register here</span>
                </p>
              </CardFooter>
            </TabsContent>

            <TabsContent value="register">
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} className="bg-slate-800 border-gray-700 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showRegisterPassword ? "text" : "password"} 
                                placeholder="Create a password" 
                                {...field} 
                                className="bg-slate-800 border-gray-700 text-white pr-10" 
                              />
                            </FormControl>
                            <button 
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            >
                              {showRegisterPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Confirm Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm your password" 
                                {...field} 
                                className="bg-slate-800 border-gray-700 text-white pr-10" 
                              />
                            </FormControl>
                            <button 
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Register
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-400 text-center w-full">
                  By registering, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Right panel - Hero banner with manga background */}
      <div 
        className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center relative hidden md:block"
        style={{ 
          backgroundImage: `url(${mangaBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="max-w-lg mx-auto z-10 relative">
          <h1 className="text-4xl font-bold text-white mb-4">
            Dive into the World of Anime
          </h1>
          <p className="text-white/80 text-lg mb-6">
            Access thousands of anime episodes and movies in high quality.
            Join our community of anime enthusiasts today!
          </p>
          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-purple-500/30">
              <h3 className="text-white font-bold mb-1">Extensive Library</h3>
              <p className="text-white/70 text-sm">Thousands of titles across all genres</p>
            </div>
            <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-purple-500/30">
              <h3 className="text-white font-bold mb-1">HD Streaming</h3>
              <p className="text-white/70 text-sm">High-quality video on all devices</p>
            </div>
            <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-purple-500/30">
              <h3 className="text-white font-bold mb-1">New Releases</h3>
              <p className="text-white/70 text-sm">Regular updates with fresh content</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 text-white/50 text-sm z-10">
          &copy; {new Date().getFullYear()} AniEx. All rights reserved.
        </div>
      </div>
    </div>
  );
}
