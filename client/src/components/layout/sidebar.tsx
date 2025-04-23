import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Film,
  Clapperboard,
  Tv,
  Server,
  Settings,
  LogOut,
  Users,
  ListTodo
} from "lucide-react";

interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => location === path;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const menuItems = [
    { path: "/admin", label: "Overview", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { 
      path: "/admin/users", 
      label: "User Management", 
      icon: <Users className="mr-3 h-5 w-5" />,
      priority: true 
    },
    { path: "/admin/anime", label: "Manage Anime", icon: <Film className="mr-3 h-5 w-5" /> },
    { path: "/admin/movies", label: "Manage Movies", icon: <Clapperboard className="mr-3 h-5 w-5" /> },
    { path: "/admin/episodes", label: "Manage Episodes", icon: <Tv className="mr-3 h-5 w-5" /> },
    { 
      path: "/admin/seasons", 
      label: "Manage Seasons", 
      icon: <ListTodo className="mr-3 h-5 w-5" />,
      priority: true 
    },
    { path: "/admin/servers", label: "Server Management", icon: <Server className="mr-3 h-5 w-5" /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings className="mr-3 h-5 w-5" /> }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-card">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-sidebar-background border-r border-sidebar-border">
            <div className="px-4">
              <Link href="/">
                <span className="text-accent font-bold text-2xl">Ani<span className="text-primary">Ex</span> <span className="text-foreground">Admin</span></span>
              </Link>
            </div>
            
            <nav className="flex-1 px-4 mt-5 space-y-1">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={cn(
                    "admin-nav-item",
                    isActive(item.path) && "active"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="p-4 mt-auto">
              {user && (
                <div className="flex flex-col">
                  <span className="text-sm text-sidebar-foreground/70">Logged in as</span>
                  <span className="font-medium text-sidebar-foreground">{user.username}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="mt-2 justify-start text-sidebar-foreground hover:text-sidebar-foreground"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
